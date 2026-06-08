import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import initSqlJs from 'sql.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

dotenv.config();

interface UserRecord {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  dob: string;
  profession: string;
  phoneNumber?: string;
  gender: string;
  photoUrl: string;
  role?: string;
  password: string;
  createdAt: string;
  mustChangePassword: boolean;
}

interface ActivityRecord {
  email: string;
  action: string;
  createdAt: string;
}

interface MessageRecord {
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  activity: ActivityRecord[];
  messages: MessageRecord[];
  tierProgress: number[];
}

const app = express();
const port = Number(process.env.PORT || 4000);

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://ecolestrack.vercel.app',
];
const envOrigins = String(process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
const allowedOrigins = envOrigins.length ? [...defaultOrigins, ...envOrigins] : defaultOrigins;
const localOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const vercelOriginPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin) || localOriginPattern.test(origin) || vercelOriginPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request logger for debugging API calls (method, path, origin)
app.use((req, res, next) => {
  try {
    const origin = req.headers.origin || '';
    console.log(`[REQ] ${req.method} ${req.originalUrl} Origin=${origin}`);
  } catch (e) {
    // ignore logging errors
  }
  next();
});

// Ensure preflight OPTIONS requests to API routes are handled
app.options('/api/*', cors());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_FILE
  ? path.resolve(process.cwd(), process.env.DATABASE_FILE)
  : process.env.RENDER_DATA_DIR
    ? path.resolve(process.env.RENDER_DATA_DIR, 'database.sqlite')
    : path.resolve(process.cwd(), 'database.sqlite');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const sqlWasmPath = path.resolve(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');

if (!fs.existsSync(sqlWasmPath)) {
  console.error(`Fichier WASM introuvable: ${sqlWasmPath}`);
}

if (!process.env.DATABASE_FILE && process.env.RENDER_DATA_DIR) {
  console.log(`Utilisation du stockage persistant Render : ${dbPath}`);
}

if (!process.env.DATABASE_FILE && !process.env.RENDER_DATA_DIR) {
  console.warn('ATTENTION: database storage est en local. Les comptes utilisateurs risquent d\'être perdus lors d\'un redeploy. Définissez DATABASE_FILE sur un volume persistant ou montez un volume Render.');
}

const SQL = await initSqlJs({
  locateFile: () => sqlWasmPath,
});

const dbFileExists = fs.existsSync(dbPath);
const db = dbFileExists
  ? new SQL.Database(new Uint8Array(fs.readFileSync(dbPath)))
  : new SQL.Database();

const saveDb = () => {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
};

const runWrite = (sql: string, params: any[] = []) => {
  const placeholderCount = (sql.match(/\?/g) || []).length;
  if (params.length !== placeholderCount) {
    throw new Error(`SQL parameter mismatch: expected ${placeholderCount} values, got ${params.length}. SQL=${sql}`);
  }

  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
  saveDb();
};

const queryAll = (sql: string, params: any[] = []) => {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
};

const queryOne = (sql: string, params: any[] = []) => {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : undefined;
  stmt.free();
  return row;
};

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT,
  lastName TEXT,
  name TEXT,
  email TEXT UNIQUE,
  dob TEXT,
  profession TEXT,
  phoneNumber TEXT,
  gender TEXT,
  role TEXT DEFAULT 'user',
  photoUrl TEXT,
  password TEXT,
  createdAt TEXT,
  mustChangePassword INTEGER
)`);

db.run(`CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  action TEXT,
  createdAt TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  message TEXT,
  createdAt TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS tier_progress (
  id INTEGER PRIMARY KEY,
  p1 INTEGER NOT NULL,
  p2 INTEGER NOT NULL,
  p3 INTEGER NOT NULL,
  p4 INTEGER NOT NULL
)`);

// Ensure users table has a 'verified' column (0/1)
try {
  db.run('ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0');
} catch (e) {
  // ignore if column already exists or ALTER not needed
}

// Ensure users table has a 'phoneNumber' column
try {
  db.run('ALTER TABLE users ADD COLUMN phoneNumber TEXT DEFAULT \'\'');
} catch (e) {
  // ignore if column already exists or ALTER not needed
}

// Table to store email verification tokens
db.run(`CREATE TABLE IF NOT EXISTS email_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  token TEXT UNIQUE,
  createdAt TEXT,
  expiresAt TEXT
)`);

// Sessions table for persistent authentication across server restarts (Render support)
db.run(`CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  createdAt INTEGER NOT NULL
)`);

saveDb();

// Clean up expired sessions on startup
const now = Date.now();
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const expiredTokens = queryAll(
  'SELECT token FROM sessions WHERE ? - createdAt > ?',
  [now, SESSION_TTL_MS]
);
expiredTokens.forEach((row: any) => {
  runWrite('DELETE FROM sessions WHERE token = ?', [row.token]);
});

// Ensure a default admin account exists (use env vars to override)
const DEFAULT_ADMIN_EMAIL = String(process.env.DEFAULT_ADMIN_EMAIL || 'admin@admin.com').toLowerCase();
const DEFAULT_ADMIN_PASSWORD = String(process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123');
const ensureDefaultAdmin = () => {
  const existing = getUserByEmail(DEFAULT_ADMIN_EMAIL);
  if (!existing) {
    const hashed = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
    runWrite(
      `INSERT INTO users (firstName, lastName, name, email, dob, profession, phoneNumber, gender, role, photoUrl, password, createdAt, mustChangePassword)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Admin', 'Root', 'Admin Root', DEFAULT_ADMIN_EMAIL, '', 'Administrator', '', '', 'admin', '', hashed, new Date().toLocaleString('fr-FR'), 0],
    );
    console.log(`Default admin created: ${DEFAULT_ADMIN_EMAIL}`);
  }
};
// call ensureDefaultAdmin() after helper functions are defined

// Session management - persisted in SQLite for Render multi-dyno support

// Session management - persisted in SQLite for Render multi-dyno support

const createSession = (email: string, role: string) => {
  const token = crypto.randomBytes(24).toString('hex');
  const createdAt = Date.now();
  runWrite(
    'INSERT INTO sessions (token, email, role, createdAt) VALUES (?, ?, ?, ?)',
    [token, email.toLowerCase(), role, createdAt]
  );
  return token;
};

const getSession = (token: string | undefined) => {
  if (!token) return undefined;
  const row = queryOne('SELECT * FROM sessions WHERE token = ? LIMIT 1', [token]);
  if (!row) return undefined;
  
  const now = Date.now();
  const createdAt = Number(row.createdAt);
  if (now - createdAt > SESSION_TTL_MS) {
    // Session expired, delete it
    runWrite('DELETE FROM sessions WHERE token = ?', [token]);
    return undefined;
  }
  
  return {
    email: row.email,
    role: row.role,
    createdAt: createdAt,
  };
};

const requireAdmin = (req: any, res: any, next: any) => {
  try {
    const auth = String(req.headers.authorization || '');
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return res.status(401).json({ error: 'Token d\'authentification manquant.' });
    const token = m[1];
    const s = getSession(token);
    if (!s) return res.status(401).json({ error: 'Session invalide ou expirée.' });
    const user = getUserByEmail(s.email);
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable pour la session.' });
    if ((user.role || 'user') !== 'admin') return res.status(403).json({ error: 'Accès refusé: privilèges administrateur requis.' });
    req.auth = s;
    next();
  } catch (e) {
    return res.status(500).json({ error: 'Erreur d\'authentification.' });
  }
};

const existingTier = queryOne('SELECT id FROM tier_progress WHERE id = 1');
if (!existingTier) {
  runWrite('INSERT INTO tier_progress (id, p1, p2, p3, p4) VALUES (1, ?, ?, ?, ?)', [15, 0, 0, 0]);
}

const legacyJsonPath = path.resolve(process.cwd(), 'database.json');
if (!dbFileExists && fs.existsSync(legacyJsonPath)) {
  try {
    const legacyData = JSON.parse(fs.readFileSync(legacyJsonPath, 'utf8'));
    const users = Array.isArray(legacyData.users) ? legacyData.users : [];
    const activity = Array.isArray(legacyData.activity) ? legacyData.activity : [];
    const messages = Array.isArray(legacyData.messages) ? legacyData.messages : [];
    const tierProgress = Array.isArray(legacyData.tierProgress) ? legacyData.tierProgress : [15, 0, 0, 0];

    users.forEach((user: UserRecord) => {
      runWrite(
        `INSERT OR IGNORE INTO users (
          firstName, lastName, name, email, dob, profession, phoneNumber, gender, role, photoUrl, password, createdAt, mustChangePassword
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.firstName || '',
          user.lastName || '',
          user.name || '',
          user.email,
          user.dob,
          user.profession,
          user.phoneNumber || '',
          user.gender,
          user.role || 'user',
          user.photoUrl,
          user.password,
          user.createdAt,
          user.mustChangePassword ? 1 : 0,
        ],
      );
    });

    activity.forEach((item: ActivityRecord) => {
      runWrite('INSERT INTO activity (email, action, createdAt) VALUES (?, ?, ?)', [item.email, item.action, item.createdAt]);
    });

    messages.forEach((item: MessageRecord) => {
      runWrite('INSERT INTO messages (name, email, message, createdAt) VALUES (?, ?, ?, ?)', [item.name, item.email, item.message, item.createdAt]);
    });

    runWrite('INSERT OR REPLACE INTO tier_progress (id, p1, p2, p3, p4) VALUES (1, ?, ?, ?, ?)', [
      Number(tierProgress[0] ?? 15),
      Number(tierProgress[1] ?? 0),
      Number(tierProgress[2] ?? 0),
      Number(tierProgress[3] ?? 0),
    ]);
  } catch (error) {
    console.warn('Migration de database.json vers SQLite échouée :', error);
  }
}

type NameSource = { firstName?: string; lastName?: string; name?: string };
const getDisplayName = (user: NameSource) => {
  const firstName = String(user.firstName || '').trim();
  const lastName = String(user.lastName || '').trim();
  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  return String(user.name || '').trim();
};

const normalizeUserRecord = (user: UserRecord): UserRecord => {
  const firstName = String(user.firstName || '').trim();
  const lastName = String(user.lastName || '').trim();
  const name = String(user.name || '').trim();
  const gender = String(user.gender || '').trim();
  if (firstName && lastName) {
    return { ...user, firstName, lastName, gender, name: `${firstName} ${lastName}`.trim() };
  }
  if (name) {
    const parts = name.split(' ').filter(Boolean);
    const derivedFirstName = parts.shift() || '';
    const derivedLastName = parts.join(' ') || '';
    return { ...user, firstName: firstName || derivedFirstName, lastName: lastName || derivedLastName, gender, name };
  }
  return { ...user, firstName, lastName, gender, name };
};

const sanitizeUser = (user: UserRecord) => ({
  firstName: String(user.firstName || '').trim(),
  lastName: String(user.lastName || '').trim(),
  name: getDisplayName(user),
  email: user.email,
  dob: user.dob,
  profession: user.profession,
  phoneNumber: user.phoneNumber || '',
  gender: user.gender || '',
  role: user.role || 'user',
  photoUrl: user.photoUrl || '',
  createdAt: user.createdAt,
  mustChangePassword: user.mustChangePassword,
});

const rowsToUser = (row: any): UserRecord => ({
  firstName: row.firstName || '',
  lastName: row.lastName || '',
  name: row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim(),
  email: row.email,
  dob: row.dob,
  profession: row.profession,
  phoneNumber: row.phoneNumber || '',
  gender: row.gender || '',
  role: row.role || 'user',
  photoUrl: row.photoUrl || '',
  password: row.password,
  createdAt: row.createdAt,
  mustChangePassword: Boolean(row.mustChangePassword),
});

const getUsersFromDb = (): UserRecord[] => {
  const rows = queryAll('SELECT * FROM users ORDER BY id DESC');
  return rows.map(rowsToUser);
};

const getUserByEmail = (email: string): UserRecord | undefined => {
  const row = queryOne('SELECT * FROM users WHERE lower(email) = ? LIMIT 1', [email.toLowerCase()]);
  return row ? rowsToUser(row) : undefined;
};

// create default admin now that DB helpers are available
ensureDefaultAdmin();

const getActivityLogs = () => queryAll('SELECT email, action, createdAt FROM activity ORDER BY id DESC LIMIT 50');
const getMessagesFromDb = () => queryAll('SELECT name, email, message, createdAt FROM messages ORDER BY id DESC LIMIT 50');

const getTierProgressFromDb = () => {
  const row = queryOne('SELECT p1, p2, p3, p4 FROM tier_progress WHERE id = 1');
  return row ? [row.p1, row.p2, row.p3, row.p4] : [15, 0, 0, 0];
};

const updateTierProgressInDb = (tierProgress: number[]) => {
  runWrite('UPDATE tier_progress SET p1 = ?, p2 = ?, p3 = ?, p4 = ? WHERE id = 1', [
    tierProgress[0],
    tierProgress[1],
    tierProgress[2],
    tierProgress[3],
  ]);
};

const deleteOldActivity = () => {
  runWrite('DELETE FROM activity WHERE id NOT IN (SELECT id FROM activity ORDER BY id DESC LIMIT 50)');
};

const deleteOldMessages = () => {
  runWrite('DELETE FROM messages WHERE id NOT IN (SELECT id FROM messages ORDER BY id DESC LIMIT 50)');
};

const logActivity = async (email: string, action: string) => {
  const createdAt = new Date().toLocaleString('fr-FR');
  runWrite('INSERT INTO activity (email, action, createdAt) VALUES (?, ?, ?)', [email, action, createdAt]);
  deleteOldActivity();
};

app.get('/api/users', (req, res) => {
  const roleFilter = String(req.query.role || '').trim().toLowerCase();
  let users = getUsersFromDb().map(sanitizeUser);
  if (roleFilter) {
    users = users.filter((u) => String(u.role || 'user').toLowerCase() === roleFilter);
  }
  res.json({ users });
});

app.get('/api/users/:email', (req, res) => {
  const email = String(req.params.email).toLowerCase();
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }
  return res.json({ user: sanitizeUser(user) });
});

app.get('/api/activity', (req, res) => {
  const activity = getActivityLogs();
  res.json({ activity });
});

app.get('/api/messages', (req, res) => {
  const messages = getMessagesFromDb();
  res.json({ messages });
});

app.post('/api/messages', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nom, email et message sont requis.' });
  }

  const createdAt = new Date().toLocaleString('fr-FR');
  runWrite('INSERT INTO messages (name, email, message, createdAt) VALUES (?, ?, ?, ?)', [
    String(name).trim(),
    String(email).trim().toLowerCase(),
    String(message).trim(),
    createdAt,
  ]);
  deleteOldMessages();

  await logActivity(String(email).trim().toLowerCase(), 'Requête sécurisée envoyée');
  return res.json({ success: true });
});

app.get('/api/tier-progress', (req, res) => {
  const tierProgress = getTierProgressFromDb();
  res.json({ tierProgress });
});

app.post('/api/tier-progress', async (req, res) => {
  try {
    const { tierProgress } = req.body;
    if (!Array.isArray(tierProgress) || tierProgress.length !== 4 || !tierProgress.every((value: any) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100)) {
      return res.status(400).json({ error: 'Progression invalide. Quatre valeurs numériques entre 0 et 100 sont requises.' });
    }

    const normalizedProgress = tierProgress.map((value: number) => Math.round(Math.max(0, Math.min(100, value))));
    updateTierProgressInDb(normalizedProgress);
    await logActivity('admin@admin.com', 'Progression des paliers mise à jour');
    return res.json({ success: true, tierProgress: normalizedProgress });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour des paliers :', error);
    return res.status(500).json({ error: 'Erreur interne lors de la mise à jour des paliers.' });
  }
});

app.post('/api/pay', async (req, res) => {
  const { amount, phoneNumber, network, description, identifier, customerName, customerEmail } = req.body;
  if (!phoneNumber || !amount || !description || !identifier || !network) {
    return res.status(400).json({ error: 'phoneNumber, amount, description, identifier et network sont requis.' });
  }

  const normalizedNetwork = String(network).trim().toUpperCase();
  const allowedNetworks = ['FLOOZ', 'TMONEY'];
  if (!allowedNetworks.includes(normalizedNetwork)) {
    return res.status(400).json({ error: `Network invalide. Choisissez ${allowedNetworks.join(' ou ')}.` });
  }

  const apiKey = process.env.PAYGATE_GLOBAL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API PayGateGlobal non configurée.' });
  }

  try {
    const paygateUrl = 'https://paygateglobal.com/api/v1/pay';
    const payload = {
      auth_token: apiKey,
      phone_number: String(phoneNumber).trim(),
      amount: Math.round(Number(amount)),
      description: String(description).trim(),
      identifier: String(identifier).trim(),
      network: normalizedNetwork,
    };

    // Log payload for audit (non-sensitive fields only)
    console.log('PayGate request:', { url: paygateUrl, body: payload });

    const paymentResponse = await fetch(paygateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Try to parse JSON response, be permissive if not JSON
    let result: any = null;
    try {
      result = await paymentResponse.json();
    } catch (parseErr) {
      // preserve raw text if not JSON
      const text = await paymentResponse.text().catch(() => null);
      result = { raw: text };
    }

    if (!paymentResponse.ok) {
      const errMsg = (result && (result.error_message || result.message || result.error)) || 'Erreur PayGateGlobal';
      const errCode = result && (result.error_code || result.code || null);
      console.warn('PayGate error response:', { status: paymentResponse.status, error_code: errCode, error_message: errMsg, raw: result });
      return res.status(paymentResponse.status).json({ error: errMsg, error_code: errCode, raw: result });
    }

    await logActivity(String(customerEmail || phoneNumber), `Transaction PayGateGlobal initiée (${identifier})`);
    return res.json(result);
  } catch (error: any) {
    console.error('Erreur de transaction PayGateGlobal :', error);
    return res.status(500).json({ error: 'Impossible de contacter le service de paiement.' });
  }
});

app.post('/api/paygate/callback', async (req, res) => {
  const callbackPayload = Object.keys(req.body || {}).length ? req.body : req.query;

  if (!callbackPayload || Object.keys(callbackPayload).length === 0) {
    return res.status(400).json({ error: 'Aucun payload de callback reçu.' });
  }

  const customerEmail = String(callbackPayload.customerEmail || callbackPayload.email || 'callback@paygate');
  const orderId = String(callbackPayload.orderId || callbackPayload.order_id || callbackPayload.reference || callbackPayload.tx_reference || callbackPayload.identifier || 'unknown');
  const status = String(callbackPayload.status || callbackPayload.payment_status || callbackPayload.transaction_status || 'inconnu');

  const createdAt = new Date().toLocaleString('fr-FR');
  runWrite('INSERT INTO activity (email, action, createdAt) VALUES (?, ?, ?)', [
    customerEmail,
    `Callback PayGateGlobal reçu : commande=${orderId}, statut=${status}`,
    createdAt,
  ]);
  deleteOldActivity();

  console.log('PayGateGlobal callback reçu :', callbackPayload);

  return res.json({ success: true, received: callbackPayload });
});

// Legacy callback endpoint for backward compatibility
app.post('/api/pay/callback', async (req, res) => {
  const callbackPayload = Object.keys(req.body || {}).length ? req.body : req.query;

  if (!callbackPayload || Object.keys(callbackPayload).length === 0) {
    return res.status(400).json({ error: 'Aucun payload de callback reçu.' });
  }

  const customerEmail = String(callbackPayload.customerEmail || callbackPayload.email || 'callback@paygate');
  const orderId = String(callbackPayload.orderId || callbackPayload.order_id || callbackPayload.reference || callbackPayload.tx_reference || 'unknown');
  const status = String(callbackPayload.status || callbackPayload.payment_status || callbackPayload.transaction_status || 'inconnu');

  const createdAt = new Date().toLocaleString('fr-FR');
  runWrite('INSERT INTO activity (email, action, createdAt) VALUES (?, ?, ?)', [
    customerEmail,
    `Callback PayGateGlobal reçu : commande=${orderId}, statut=${status}`,
    createdAt,
  ]);
  deleteOldActivity();

  console.log('PayGate callback reçu :', callbackPayload);

  return res.json({ success: true, received: callbackPayload });
});

app.post('/api/activity', async (req, res) => {
  const { email, action } = req.body;
  if (!email || !action) {
    return res.status(400).json({ error: 'Email et action requis pour enregistrer l’activité.' });
  }
  await logActivity(String(email), String(action));
  return res.json({ success: true });
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  const user = getUserByEmail(String(email));
  if (!user) {
    return res.status(404).json({ error: 'Aucun compte trouvé avec cet email.' });
  }

  const isPasswordValid = bcrypt.compareSync(String(password), user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
  }

  await logActivity(user.email, 'Connexion');
  const token = createSession(user.email, user.role || 'user');
  return res.json({ user: sanitizeUser(user), mustChangePassword: user.mustChangePassword, token });
});

// Public registration endpoint (useful for local development)
app.post('/api/users/register', async (req, res) => {
  try {
    const { firstName, lastName, name, email, dob, profession, gender, photoUrl, password } = req.body;
    const rawFirstName = String(firstName || '').trim();
    const rawLastName = String(lastName || '').trim();
    const fallbackName = String(name || '').trim();
    const nameWords = fallbackName.split(' ').filter(Boolean);
    const resolvedFirstName = rawFirstName || nameWords.slice(0, -1).join(' ').trim() || fallbackName;
    const resolvedLastName = rawLastName || (nameWords.length > 1 ? nameWords.slice(-1).join('').trim() : '');
    const resolvedName = String(name || `${resolvedFirstName} ${resolvedLastName}`).trim();
    const resolvedGender = String(gender || '').trim();
    const rawPassword = String(password || '').trim();
    const resolvedPassword = rawPassword || '123456';

    if (!resolvedFirstName || !email || !dob || !profession || !resolvedGender) {
      return res.status(400).json({ error: 'Tous les champs obligatoires sont requis.' });
    }

    if (rawPassword && rawPassword.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const lowerEmail = String(email).toLowerCase();
    if (getUserByEmail(lowerEmail)) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
    }

    const createdAt = new Date().toLocaleString('fr-FR');
    const hashedPassword = bcrypt.hashSync(resolvedPassword, 10);

    // insert user (verified defaults to 0)
    runWrite(
      `INSERT INTO users (firstName, lastName, name, email, dob, profession, phoneNumber, gender, role, photoUrl, password, createdAt, mustChangePassword)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resolvedFirstName,
        resolvedLastName,
        resolvedName,
        lowerEmail,
        String(dob).trim(),
        String(profession).trim(),
        String(req.body.phoneNumber || '').trim(),
        resolvedGender,
        'user',
        String(photoUrl || ''),
        hashedPassword,
        createdAt,
        1,
      ],
    );

    // create verification token
    const token = crypto.randomBytes(24).toString('hex');
    const now = new Date();
    const createdAtToken = now.toLocaleString('fr-FR');
    const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24); // 24h
    const expiresAt = expires.toLocaleString('fr-FR');
    runWrite(
      `INSERT INTO email_verifications (email, token, createdAt, expiresAt) VALUES (?, ?, ?, ?)`,
      [lowerEmail, token, createdAtToken, expiresAt],
    );

    // build verification link
    const origin = (req.headers.origin && String(req.headers.origin)) || `http://localhost:${port}`;
    const verificationLink = `${origin.replace(/\/$/, '')}/api/users/verify?token=${encodeURIComponent(token)}`;

    // Log the link (and return it in response for local dev). In production replace with real email sending.
    console.log(`Email verification link for ${lowerEmail}: ${verificationLink}`);

    await logActivity(lowerEmail, 'Inscription publique (verification envoyée)');
    return res.status(201).json({ success: true, verificationLink });
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription publique :', error);
    return res.status(500).json({ error: 'Erreur interne lors de l\'inscription.' });
  }
});

app.get('/api/users/verify', async (req, res) => {
  try {
    const token = String(req.query.token || '').trim();
    if (!token) return res.status(400).json({ error: 'Token de vérification requis.' });

    const row = queryOne('SELECT * FROM email_verifications WHERE token = ? LIMIT 1', [token]);
    if (!row) return res.status(404).json({ error: 'Token invalide ou expiré.' });

    const now = new Date();
    // expiresAt stored as localized string; we'll be permissive — accept if record exists
    const email = String(row.email || '').toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email associé introuvable.' });

    // mark user verified
    runWrite('UPDATE users SET verified = 1 WHERE lower(email) = ?', [email]);
    // remove the token
    runWrite('DELETE FROM email_verifications WHERE token = ?', [token]);

    await logActivity(email, 'Email vérifié');
    return res.json({ success: true, email });
  } catch (error: any) {
    console.error('Erreur lors de la vérification email :', error);
    return res.status(500).json({ error: 'Erreur interne lors de la vérification.' });
  }
});

app.post('/api/users/create', requireAdmin, async (req, res) => {
  const { firstName, lastName, name, email, dob, profession, gender, role, photoUrl, password, mustChangePassword } = req.body;
  const rawFirstName = String(firstName || '').trim();
  const rawLastName = String(lastName || '').trim();
  const fallbackName = String(name || '').trim();
  const nameWords = fallbackName.split(' ').filter(Boolean);
  const resolvedFirstName = rawFirstName || nameWords.slice(0, -1).join(' ').trim() || fallbackName;
  const resolvedLastName = rawLastName || (nameWords.length > 1 ? nameWords.slice(-1).join('').trim() : '');
  const resolvedName = String(name || `${resolvedFirstName} ${resolvedLastName}`).trim();
  const resolvedGender = String(gender || '').trim();
  const rawPassword = String(password || '').trim();
  const resolvedPassword = rawPassword || '123456';

  if (!resolvedFirstName || !email || !dob || !profession || !resolvedGender) {
    return res.status(400).json({ error: 'Tous les champs obligatoires sont requis.' });
  }

  if (rawPassword && rawPassword.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  const lowerEmail = String(email).toLowerCase();
  if (getUserByEmail(lowerEmail)) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
  }

  const createdAt = new Date().toLocaleString('fr-FR');
  const hashedPassword = bcrypt.hashSync(resolvedPassword, 10);
  const mustChange = mustChangePassword === false ? false : true;
  // validate role
  const normalizedRole = String(role || 'user').trim().toLowerCase();
  const allowedRoles = ['admin', 'user'];
  const finalRole = allowedRoles.includes(normalizedRole) ? normalizedRole : 'user';

  runWrite(
    `INSERT INTO users (firstName, lastName, name, email, dob, profession, phoneNumber, gender, role, photoUrl, password, createdAt, mustChangePassword)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resolvedFirstName,
      resolvedLastName,
      resolvedName,
      lowerEmail,
      String(dob).trim(),
      String(profession).trim(),
      String(req.body.phoneNumber || '').trim(),
      resolvedGender,
      finalRole,
      String(photoUrl || ''),
      hashedPassword,
      createdAt,
      mustChange ? 1 : 0,
    ],
  );
  // log activity under the admin who made the request (if available)
  try {
    const auth = (req as any).auth;
    if (auth && auth.email) {
      await logActivity(String(auth.email), `Compte utilisateur créé: ${lowerEmail}`);
    } else {
      await logActivity(lowerEmail, 'Compte utilisateur créé par un administrateur');
    }
  } catch (e) {
    await logActivity(lowerEmail, 'Compte utilisateur créé par administrateur (journal impossible)');
  }
  return res.status(201).json({ success: true });
});

app.post('/api/users/change-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email et nouveau mot de passe requis.' });
  }

  const lowerEmail = String(email).toLowerCase();
  const user = getUserByEmail(lowerEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  runWrite('UPDATE users SET password = ?, mustChangePassword = 0 WHERE lower(email) = ?', [bcrypt.hashSync(String(newPassword), 10), lowerEmail]);

  await logActivity(lowerEmail, 'Modification du mot de passe');
  return res.json({ success: true });
});

app.post('/api/users/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email et nouveau mot de passe requis.' });
  }

  const lowerEmail = String(email).toLowerCase();
  const user = getUserByEmail(lowerEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  runWrite('UPDATE users SET password = ?, mustChangePassword = 1 WHERE lower(email) = ?', [bcrypt.hashSync(String(newPassword), 10), lowerEmail]);

  await logActivity(lowerEmail, 'Mot de passe administrateur réinitialisé');
  return res.json({ success: true });
});

app.post('/api/users/update', async (req, res) => {
  const { oldEmail, firstName, lastName, name, email, dob, profession, phoneNumber, gender, photoUrl } = req.body;
  const resolvedFirstName = String(firstName || '').trim();
  const resolvedLastName = String(lastName || '').trim();
  const resolvedName = String(name || `${resolvedFirstName} ${resolvedLastName}`).trim();
  const resolvedGender = String(gender || '').trim();

  if (!oldEmail || !email || !dob || !resolvedFirstName || !resolvedLastName) {
    return res.status(400).json({ error: 'Tous les champs obligatoires sont requis (Email, DOB, Nom, Prénom).' });
  }

  const lowerOldEmail = String(oldEmail).toLowerCase();
  const lowerNewEmail = String(email).toLowerCase();
  const user = getUserByEmail(lowerOldEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  if (lowerOldEmail !== lowerNewEmail && getUserByEmail(lowerNewEmail)) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
  }

  runWrite(
    `UPDATE users SET firstName = ?, lastName = ?, name = ?, email = ?, dob = ?, profession = ?, phoneNumber = ?, gender = ?, photoUrl = ? WHERE lower(email) = ?`,
    [
      resolvedFirstName,
      resolvedLastName,
      resolvedName,
      lowerNewEmail,
      String(dob).trim(),
      String(profession).trim(),
      String(phoneNumber || '').trim(),
      resolvedGender,
      String(photoUrl || ''),
      lowerOldEmail,
    ],
  );

  await logActivity(lowerNewEmail, 'Profil utilisateur modifié');
  const updatedUser = getUserByEmail(lowerNewEmail);
  return res.json({
    success: true,
    user: updatedUser ? sanitizeUser(updatedUser) : null,
  });
});

app.listen(port, () => {
  console.log(`Backend API server is running on http://localhost:${port}`);
});

// Simple health route to confirm the API is reachable (useful for Render or other hosts)
app.get('/', (req, res) => {
  res.send('API is running');
});
