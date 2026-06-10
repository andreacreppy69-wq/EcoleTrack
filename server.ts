import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwdEnvPath = path.resolve(process.cwd(), '.env');
const localEnvPath = path.resolve(__dirname, '.env');
let dotenvResult = dotenv.config({ path: cwdEnvPath });
if (!dotenvResult.error) {
  console.log(`[ENV] Loaded .env from ${cwdEnvPath}`);
} else {
  dotenvResult = dotenv.config({ path: localEnvPath });
  if (!dotenvResult.error) {
    console.log(`[ENV] Loaded .env from ${localEnvPath}`);
  } else if (!process.env.FEDAPAY_SECRET_KEY && !process.env.FEDAPAY_API_KEY && !process.env.VITE_FEDAPAY_API_KEY) {
    console.warn(`[ENV] .env file not loaded from ${cwdEnvPath} or ${localEnvPath}; FedaPay key not found in environment.`);
  }
}

if (!process.env.FEDAPAY_SECRET_KEY && !process.env.FEDAPAY_API_KEY && !process.env.VITE_FEDAPAY_API_KEY) {
  console.warn('[ENV] FedaPay key not found in environment (FEDAPAY_SECRET_KEY or FEDAPAY_API_KEY required).');
}

// Load FedaPay secret key from environment
const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY || process.env.FEDAPAY_API_KEY || process.env.VITE_FEDAPAY_API_KEY;
if (FEDAPAY_SECRET_KEY) {
  console.log('[FEDAPAY] Secret key loaded successfully');
}

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

// Validate DATABASE_URL is configured
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[DB] ❌ FATAL: DATABASE_URL environment variable is not set!');
  console.error('[DB] Expected format: postgresql://user:password@host:port/database');
  console.error('[DB] ');
  console.error('[DB] **On Render, this should be automatically injected by the pgsql service.**');
  console.error('[DB] **If you\'re seeing this error, the Blueprint did not create the pgsql service correctly.**');
  console.error('[DB] ');
  console.error('[DB] Solutions:');
  console.error('[DB] 1. Delete the current web service in Render');
  console.error('[DB] 2. Delete the current pgsql service in Render (if it exists)');
  console.error('[DB] 3. Create a NEW Blueprint and let Render create both services');
  console.error('[DB] 4. Make sure render.yaml is present in your repository');
  process.exit(1);
}

console.log('[DB] DATABASE_URL configured (host:', DATABASE_URL.split('@')[1]?.split(':')[0] || 'unknown', ')');

// PostgreSQL connection pool
const pool = new Pool({ connectionString: DATABASE_URL });

// Verify database connection with retry logic
let dbConnectionReady = false;
const verifyDatabaseConnection = async (retries = 10, delayMs = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('[DB] ✓ PostgreSQL connection successful');
      dbConnectionReady = true;
      return true;
    } catch (error) {
      const attempt = i + 1;
      if (attempt < retries) {
        console.warn(`[DB] Connection attempt ${attempt}/${retries} failed, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error(`[DB] ❌ Failed to connect to PostgreSQL after ${retries} attempts`);
        console.error(`[DB] Error: ${error?.message}`);
        console.error('[DB] ');
        console.error('[DB] Troubleshooting:');
        console.error('[DB] 1. Verify the pgsql service is Running in Render Dashboard');
        console.error('[DB] 2. Check DATABASE_URL: postgresql://user:password@host:port/database');
        console.error('[DB] 3. If host is ::1 or 127.0.0.1, DATABASE_URL was not injected by pgsql service');
        process.exit(1);
      }
    }
  }
  return false;
};

const paramize = (sql: string) => {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
};




const runWrite = async (sql: string, params: any[] = []) => {
  const q = paramize(sql);
  await pool.query(q, params);
};

const queryAll = async (sql: string, params: any[] = []) => {
  const q = paramize(sql);
  const res = await pool.query(q, params);
  return res.rows;
};

const queryOne = async (sql: string, params: any[] = []) => {
  const rows = await queryAll(sql, params);
  return rows[0];
};

const initDb = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
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
    mustChangePassword INTEGER,
    verified INTEGER DEFAULT 0,
    investedAmount INTEGER DEFAULT 0,
    totalCollected INTEGER DEFAULT 0
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS activity (
    id SERIAL PRIMARY KEY,
    email TEXT,
    action TEXT,
    createdAt TEXT
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    message TEXT,
    createdAt TEXT
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS tier_progress (
    id INTEGER PRIMARY KEY,
    p1 INTEGER NOT NULL,
    p2 INTEGER NOT NULL,
    p3 INTEGER NOT NULL,
    p4 INTEGER NOT NULL
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS email_verifications (
    id SERIAL PRIMARY KEY,
    email TEXT,
    token TEXT UNIQUE,
    createdAt TEXT,
    expiresAt TEXT
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt BIGINT NOT NULL
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    fedapayTransactionId TEXT UNIQUE,
    reference TEXT,
    email TEXT,
    amount INTEGER,
    currency TEXT,
    status TEXT,
    purpose TEXT,
    projectId TEXT,
    createdAt TEXT,
    updatedAt TEXT
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS project_metrics (
    id TEXT PRIMARY KEY,
    name TEXT,
    collectedAmount INTEGER DEFAULT 0,
    investedAmount INTEGER DEFAULT 0,
    updatedAt TEXT
  )`);

  // Ensure optional columns exist (safe in PostgreSQL with IF NOT EXISTS)
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS verified INTEGER DEFAULT 0");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phoneNumber TEXT DEFAULT ''");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS investedAmount INTEGER DEFAULT 0");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS totalCollected INTEGER DEFAULT 0");

  // Ensure common user columns exist for older schemas
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS createdAt TEXT");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS mustChangePassword INTEGER DEFAULT 0");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS firstName TEXT");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS lastName TEXT");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS dob TEXT");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS profession TEXT");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS photoUrl TEXT");

  // Ensure default project metrics row
  const existing = await queryOne('SELECT id FROM project_metrics WHERE id = ?', ['default_project']);
  if (!existing) {
    await runWrite('INSERT INTO project_metrics (id, name, collectedAmount, investedAmount, updatedAt) VALUES (?, ?, ?, ?, ?)', ['default_project', 'Projet principal', 0, 0, new Date().toISOString()]);
  }
};

// Verify database connection before initialization
await verifyDatabaseConnection();

// initialize DB now that initDb is declared
await initDb();

const createTransactionRecord = async (payload: {
  transactionId: string;
  reference: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  purpose: string;
  projectId: string;
}) => {
  const nowIso = new Date().toISOString();
  await runWrite(
      'INSERT INTO transactions (fedapayTransactionId, reference, email, amount, currency, status, purpose, projectId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (fedapayTransactionId) DO NOTHING',
    [
      payload.transactionId,
      payload.reference,
      payload.email,
      payload.amount,
      payload.currency,
      payload.status,
      payload.purpose,
      payload.projectId,
      nowIso,
      nowIso,
    ],
  );
};

const safeCreateTransactionRecord = async (payload: {
  transactionId: string;
  reference: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  purpose: string;
  projectId: string;
}) => {
  try {
    await createTransactionRecord(payload);
  } catch (error) {
    console.warn('[FEDAPAY] Failed to persist transaction record:', error?.message || error);
  }
};

const updateTransactionStatus = async (transactionId: string, status: string) => {
  const nowIso = new Date().toISOString();
  await runWrite('UPDATE transactions SET status = ?, updatedAt = ? WHERE fedapayTransactionId = ?', [status, nowIso, transactionId]);
};

const addConfirmedInvestment = async (email: string, amount: number, projectId = 'default_project') => {
  const nowIso = new Date().toISOString();
  await runWrite('UPDATE users SET investedAmount = investedAmount + ? WHERE email = ?', [amount, email]);
  await runWrite('UPDATE users SET totalCollected = totalCollected + ? WHERE email = ?', [amount, email]);
  await runWrite('UPDATE project_metrics SET collectedAmount = collectedAmount + ?, investedAmount = investedAmount + ?, updatedAt = ? WHERE id = ?', [amount, amount, nowIso, projectId]);
};

// Clean up expired sessions on startup
const now = Date.now();
// Extend session lifetime to 7 days and keep active admin sessions alive.
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const expiredThreshold = now - SESSION_TTL_MS;
const expiredTokens = await queryAll('SELECT token FROM sessions WHERE createdAt < ?', [expiredThreshold]);
for (const row of expiredTokens) {
  await runWrite('DELETE FROM sessions WHERE token = ?', [row.token]);
}

// Ensure a default admin account exists (use env vars to override)
const DEFAULT_ADMIN_EMAIL = String(process.env.DEFAULT_ADMIN_EMAIL || 'admin@admin.com').toLowerCase();
const DEFAULT_ADMIN_PASSWORD = String(process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123');
const ensureDefaultAdmin = async () => {
  const existing = await getUserByEmail(DEFAULT_ADMIN_EMAIL);
  if (!existing) {
    const hashed = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
    await runWrite(
      `INSERT INTO users (name, email, dob, profession, phoneNumber, gender, role, photoUrl, password, createdAt, mustChangePassword)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Admin Root', DEFAULT_ADMIN_EMAIL, '', 'Administrator', '', '', 'admin', '', hashed, new Date().toLocaleString('fr-FR'), 0],
    );
    console.log(`Default admin created: ${DEFAULT_ADMIN_EMAIL}`);
  }
};
// call ensureDefaultAdmin() after helper functions are defined

// Session management - persisted in SQLite for Render multi-dyno support

// Session management - persisted in SQLite for Render multi-dyno support

const createSession = async (email: string, role: string) => {
  const token = crypto.randomBytes(24).toString('hex');
  const createdAt = Date.now();
  await runWrite('INSERT INTO sessions (token, email, role, createdAt) VALUES (?, ?, ?, ?)', [token, email.toLowerCase(), role, createdAt]);
  console.log(`[SESSION] New session created for ${email} (${role}) - token: ${token.substring(0, 8)}...`);
  return token;
};

const getSession = async (token: string | undefined) => {
  if (!token) return undefined;
  const row = await queryOne('SELECT * FROM sessions WHERE token = ? LIMIT 1', [token]);
  if (!row) {
    console.log(`[SESSION] Session not found for token: ${token?.substring(0, 8)}...`);
    return undefined;
  }
  
  const now = Date.now();
  const createdAt = Number(row.createdAt);
  if (now - createdAt > SESSION_TTL_MS) {
    console.log(`[SESSION] Session expired for ${row.email} - created ${Math.round((now - createdAt) / 1000 / 60 / 60)} hours ago`);
    await runWrite('DELETE FROM sessions WHERE token = ?', [token]);
    return undefined;
  }

  // Refresh active sessions so administrators stay logged in while interacting with the app.
  const refreshedAt = now;
  if (now - createdAt > 1000 * 60 * 60) {
    console.log(`[SESSION] Refreshing session for ${row.email} (${Math.round((now - createdAt) / 1000 / 60)} min old)`);
    await runWrite('UPDATE sessions SET createdAt = ? WHERE token = ?', [refreshedAt, token]);
  }
  
  return {
    email: row.email,
    role: row.role,
    createdAt: refreshedAt,
  };
};

const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const auth = String(req.headers.authorization || '');
    console.log('[AUTH] requireAdmin header:', auth ? '[present]' : '[missing]');
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      console.warn('[AUTH] Bearer token not found in Authorization header');
      return res.status(401).json({ error: 'Session invalide ou expirée.' });
    }
    const token = m[1];
    console.log('[AUTH] requireAdmin token:', token ? `${token.slice(0,6)}...` : '[empty]');
    const s = await getSession(token);
    if (!s) return res.status(401).json({ error: 'Session invalide ou expirée.' });
    console.log('[AUTH] session found for', s.email, 'role=', s.role);
    const user = await getUserByEmail(s.email);
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable pour la session.' });
    if (String(user.role || 'user').toLowerCase() !== 'admin' && String(user.role || 'user').toLowerCase() !== 'superadmin') return res.status(403).json({ error: 'Accès refusé.' });
    req.auth = s;
    next();
  } catch (e: any) {
    console.error('[AUTH] Erreur dans requireAdmin:', e?.message || e);
    return res.status(500).json({ error: 'Erreur d\'authentification.' });
  }
};

const getClientIp = (req: any) => {
  return String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown');
};

const rateLimitStore: Record<string, { count: number; windowStart: number }> = {};

const rateLimit = (routeName: string, maxRequests: number, windowMs: number) => {
  return (req: any, res: any, next: any) => {
    const key = `${routeName}:${getClientIp(req)}`;
    const now = Date.now();
    const entry = rateLimitStore[key];

    if (!entry || now - entry.windowStart > windowMs) {
      rateLimitStore[key] = { count: 1, windowStart: now };
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({ error: 'Trop de requêtes. Veuillez réessayer plus tard.' });
    }

    entry.count += 1;
    return next();
  };
};

const requireAuth = async (req: any, res: any, next: any) => {
  const auth = String(req.headers.authorization || '');
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return res.status(401).json({ error: 'Token d\'authentification manquant.' });
  }

  const token = m[1];
  const session = await getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session invalide ou expirée.' });
  }

  req.auth = session;
  next();
};

const existingTier = await queryOne('SELECT id FROM tier_progress WHERE id = 1');
if (!existingTier) {
  await runWrite('INSERT INTO tier_progress (id, p1, p2, p3, p4) VALUES (1, ?, ?, ?, ?)', [15, 0, 0, 0]);
}

const legacyJsonPath = path.resolve(process.cwd(), 'database.json');
if (fs.existsSync(legacyJsonPath)) {
  try {
    const legacyData = JSON.parse(fs.readFileSync(legacyJsonPath, 'utf8'));
    const users = Array.isArray(legacyData.users) ? legacyData.users : [];
    const activity = Array.isArray(legacyData.activity) ? legacyData.activity : [];
    const messages = Array.isArray(legacyData.messages) ? legacyData.messages : [];
    const tierProgress = Array.isArray(legacyData.tierProgress) ? legacyData.tierProgress : [15, 0, 0, 0];

    for (const user of users) {
      const nameVal = user.name || `${String(user.firstName || '').trim()} ${String(user.lastName || '').trim()}`.trim();
      await runWrite(
        `INSERT INTO users (
          name, email, dob, profession, phoneNumber, gender, role, photoUrl, password, createdAt, mustChangePassword
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (email) DO NOTHING`,
        [
          nameVal,
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
    }

    for (const item of activity) {
      await runWrite('INSERT INTO activity (email, action, createdAt) VALUES (?, ?, ?)', [item.email, item.action, item.createdAt]);
    }

    for (const item of messages) {
      await runWrite('INSERT INTO messages (name, email, message, createdAt) VALUES (?, ?, ?, ?)', [item.name, item.email, item.message, item.createdAt]);
    }

    await runWrite('INSERT INTO tier_progress (id, p1, p2, p3, p4) VALUES (1, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET p1 = EXCLUDED.p1, p2 = EXCLUDED.p2, p3 = EXCLUDED.p3, p4 = EXCLUDED.p4', [
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

const getUsersFromDb = async (): Promise<UserRecord[]> => {
  const rows = await queryAll('SELECT * FROM users ORDER BY id DESC');
  return rows.map(rowsToUser);
};

const getUserByEmail = async (email: string): Promise<UserRecord | undefined> => {
  const row = await queryOne('SELECT * FROM users WHERE lower(email) = ? LIMIT 1', [email.toLowerCase()]);
  return row ? rowsToUser(row) : undefined;
};

// create default admin after helper functions are available
await ensureDefaultAdmin();

const getActivityLogs = async () => await queryAll('SELECT email, action, createdAt FROM activity ORDER BY id DESC LIMIT 50');
const getMessagesFromDb = async () => await queryAll('SELECT name, email, message, createdAt FROM messages ORDER BY id DESC LIMIT 50');

const getTierProgressFromDb = async () => {
  const row = await queryOne('SELECT p1, p2, p3, p4 FROM tier_progress WHERE id = 1');
  return row ? [row.p1, row.p2, row.p3, row.p4] : [15, 0, 0, 0];
};

const updateTierProgressInDb = async (tierProgress: number[]) => {
  await runWrite('UPDATE tier_progress SET p1 = ?, p2 = ?, p3 = ?, p4 = ? WHERE id = 1', [
    tierProgress[0],
    tierProgress[1],
    tierProgress[2],
    tierProgress[3],
  ]);
};

const deleteOldActivity = async () => {
  await runWrite('DELETE FROM activity WHERE id NOT IN (SELECT id FROM activity ORDER BY id DESC LIMIT 50)');
};

const deleteOldMessages = async () => {
  await runWrite('DELETE FROM messages WHERE id NOT IN (SELECT id FROM messages ORDER BY id DESC LIMIT 50)');
};

const logActivity = async (email: string, action: string) => {
  const createdAt = new Date().toLocaleString('fr-FR');
  await runWrite('INSERT INTO activity (email, action, createdAt) VALUES (?, ?, ?)', [email, action, createdAt]);
  await deleteOldActivity();
};

app.get('/api/users', requireAdmin, async (req, res) => {
  const roleFilter = String(req.query.role || '').trim().toLowerCase();
  let users = (await getUsersFromDb()).map(sanitizeUser);
  if (roleFilter) {
    users = users.filter((u) => String(u.role || 'user').toLowerCase() === roleFilter);
  }
  res.json({ users });
});

app.get('/api/users/:email', requireAdmin, async (req, res) => {
  const email = String(req.params.email).toLowerCase();
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }
  return res.json({ user: sanitizeUser(user) });
});

app.get('/api/activity', requireAdmin, async (req, res) => {
  const activity = await getActivityLogs();
  res.json({ activity });
});

app.get('/api/messages', requireAdmin, async (req, res) => {
  const messages = await getMessagesFromDb();
  res.json({ messages });
});

app.post('/api/messages', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nom, email et message sont requis.' });
  }

  const createdAt = new Date().toLocaleString('fr-FR');
  await runWrite('INSERT INTO messages (name, email, message, createdAt) VALUES (?, ?, ?, ?)', [
    String(name).trim(),
    String(email).trim().toLowerCase(),
    String(message).trim(),
    createdAt,
  ]);
  await deleteOldMessages();

  await logActivity(String(email).trim().toLowerCase(), 'Requête sécurisée envoyée');
  return res.json({ success: true });
});

app.get('/api/tier-progress', async (req, res) => {
  const tierProgress = await getTierProgressFromDb();
  res.json({ tierProgress });
});

app.post('/api/tier-progress', requireAdmin, async (req, res) => {
  try {
    const { tierProgress } = req.body;
    if (!Array.isArray(tierProgress) || tierProgress.length !== 4 || !tierProgress.every((value: any) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100)) {
      return res.status(400).json({ error: 'Progression invalide. Quatre valeurs numériques entre 0 et 100 sont requises.' });
    }

    const normalizedProgress = tierProgress.map((value: number) => Math.round(Math.max(0, Math.min(100, value))));
    await updateTierProgressInDb(normalizedProgress);
    await logActivity('admin@admin.com', 'Progression des paliers mise à jour');
    return res.json({ success: true, tierProgress: normalizedProgress });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour des paliers :', error);
    return res.status(500).json({ error: 'Erreur interne lors de la mise à jour des paliers.' });
  }
});

// PayGate has been removed. FedaPay is now the only payment gateway supported.

// FedaPay Payment Gateway Integration
app.post('/api/fedapay', rateLimit('fedapay', 15, 60 * 1000), async (req, res) => {
  try {
    const {
      amount,
      phoneNumber,
      currency,
      description,
      customerName,
      customerEmail,
      callbackUrl,
      returnUrl,
      failureUrl,
      purpose,
      projectId,
    } = req.body;

    if (!phoneNumber || !amount || !description) {
      return res.status(400).json({ error: 'phoneNumber, amount et description sont requis.' });
    }

    const fedapayApiKey = FEDAPAY_SECRET_KEY;
    const fedapayWebhookUrl = process.env.FEDAPAY_WEBHOOK_URL || 'https://ecoletrack-5481.onrender.com/api/fedapay/webhook';
    const fedapayFailureUrl = failureUrl || process.env.FEDAPAY_FAILURE_URL || 'https://ecolestrack.vercel.app/paiement/echec';
    if (!fedapayApiKey) {
      console.error('[FEDAPAY] Clé secrète non configurée (FEDAPAY_SECRET_KEY ou FEDAPAY_API_KEY requise).');
      return res.status(500).json({ error: 'Clé secrète FedaPay non configurée.' });
    }

    console.log('[FEDAPAY] Using API key:', fedapayApiKey.substring(0, 10) + '...');

    try {
      const fedapayCustomerUrl = 'https://sandbox-api.fedapay.com/v1/customers';
      const fedapayTransactionUrl = 'https://sandbox-api.fedapay.com/v1/transactions';
      const customerEmailValue = String(customerEmail || req.body.userEmail || '').trim();
      const transactionPurpose = String(purpose || 'investment');
      const transactionProjectId = String(projectId || 'default_project');
      const customerNameValue = String(customerName || 'Client').trim();
      const [firstName, ...restName] = customerNameValue.split(' ');
      const lastNameValue = restName.join(' ') || 'Client';

      const customerPayload = new URLSearchParams();
      customerPayload.append('firstname', firstName || 'Client');
      customerPayload.append('lastname', lastNameValue || 'Client');
      if (customerEmailValue) {
        customerPayload.append('email', customerEmailValue);
      }
      customerPayload.append('phone', String(phoneNumber).trim());

      console.log('[FEDAPAY] Searching or creating customer:', {
        firstname: firstName,
        lastname: lastNameValue,
        email: customerEmailValue,
        phone: phoneNumber,
      });

      let customerId: string | number | undefined;
      if (customerEmailValue) {
        try {
          const searchResponse = await axios.get(fedapayCustomerUrl, {
            headers: {
              'Authorization': `Bearer ${fedapayApiKey}`,
              'Accept': 'application/vnd.api+json',
            },
            params: {
              email: customerEmailValue,
            },
            validateStatus: () => true,
          });

          if (searchResponse.status === 200 || searchResponse.status === 201) {
            const customers = searchResponse.data?.['v1/customers'] || searchResponse.data?.data || [];
            if (Array.isArray(customers) && customers.length > 0) {
              customerId = customers[0]?.id || customers[0]?.['id'];
              console.log('[FEDAPAY] Existing customer found, reusing ID:', customerId);
            }
          }
        } catch (axiosError: any) {
          console.warn('[FEDAPAY] Customer search failed, will create a new customer if possible.', axiosError?.message || axiosError);
        }
      }

      let customerResponse: any;
      if (!customerId) {
        try {
          customerResponse = await axios.post(fedapayCustomerUrl, customerPayload.toString(), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Bearer ${fedapayApiKey}`,
              'Accept': 'application/vnd.api+json',
            },
            validateStatus: () => true,
          });
        } catch (axiosError: any) {
          const status = axiosError.response?.status || 500;
          const errorData = axiosError.response?.data || { error: axiosError.message };
          console.error('[FEDAPAY] Customer creation failed:', { status, errorData });
          return res.status(status).json({ success: false, error: 'Échec de création du client FedaPay', raw: errorData });
        }

        console.log('[FEDAPAY] Customer response status:', customerResponse.status);
        console.log('[FEDAPAY] Customer response data:', customerResponse.data);

        if (customerResponse.status !== 200 && customerResponse.status !== 201) {
          const errMsg = (customerResponse.data && (customerResponse.data.message || customerResponse.data.error || customerResponse.data.errors?.[0]?.message)) || `Erreur FedaPay customer (${customerResponse.status})`;
          return res.status(customerResponse.status).json({ success: false, error: errMsg, raw: customerResponse.data });
        }

        const customerData = customerResponse.data?.data || customerResponse.data?.['v1/customer'] || customerResponse.data;
        customerId = customerData?.id || customerData?.['id'];
        if (!customerId) {
          console.error('[FEDAPAY] Customer creation returned no ID', customerResponse.data);
          return res.status(500).json({ success: false, error: 'Impossible de récupérer l’identifiant client FedaPay' });
        }
      }

      const transactionPayload = new URLSearchParams();
      transactionPayload.append('amount', String(Math.round(Number(amount))));
      transactionPayload.append('currency[iso]', currency || 'XOF');
      transactionPayload.append('description', String(description).trim());
      transactionPayload.append('customer[id]', String(customerId));
      transactionPayload.append('callback_url', callbackUrl || fedapayWebhookUrl);
      transactionPayload.append('webhook_url', fedapayWebhookUrl);
      transactionPayload.append('return_url', returnUrl || 'https://ecolestrack.vercel.app/payment-result');
      transactionPayload.append('failure_url', fedapayFailureUrl);
      transactionPayload.append('cancel_url', fedapayFailureUrl);
      transactionPayload.append('metadata[email]', customerEmailValue || String(phoneNumber));
      transactionPayload.append('metadata[userEmail]', customerEmailValue || String(phoneNumber));
      transactionPayload.append('metadata[purpose]', transactionPurpose);
      transactionPayload.append('metadata[projectId]', transactionProjectId);

      console.log('[FEDAPAY] Calling:', fedapayTransactionUrl);
      console.log('[FEDAPAY] Transaction request:', { url: fedapayTransactionUrl, amount: amount, currency: currency || 'XOF', customerId });

      let result: any = null;
      try {
        console.log('[FEDAPAY] Request headers:', {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${fedapayApiKey.substring(0, 10)}...`,
          'Accept': 'application/vnd.api+json',
        });
        console.log('[FEDAPAY] Request payload:', transactionPayload.toString());
        const paymentResponse = await axios.post(fedapayTransactionUrl, transactionPayload.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${fedapayApiKey}`,
            'Accept': 'application/vnd.api+json',
          },
          validateStatus: () => true,
        });

        console.log('[FEDAPAY] Response status:', paymentResponse.status);
        console.log('[FEDAPAY] Response data:', paymentResponse.data);

        if (paymentResponse.status !== 200 && paymentResponse.status !== 201) {
          const errMsg = (paymentResponse.data && (paymentResponse.data.message || paymentResponse.data.error || paymentResponse.data.errors?.[0]?.message)) || `Erreur FedaPay (${paymentResponse.status})`;
          console.warn('[FEDAPAY] Error response:', { status: paymentResponse.status, error: errMsg, raw: paymentResponse.data });
          return res.status(paymentResponse.status).json({ success: false, error: errMsg, raw: paymentResponse.data });
        }

        const paymentData = paymentResponse.data;
        result = paymentData?.data || paymentData?.['v1/transaction'] || paymentData;
        console.log('[FEDAPAY] Success response:', result);
      } catch (axiosError: any) {
        const status = axiosError.response?.status || 500;
        let errorData = axiosError.response?.data || { error: axiosError.message };

        if (axiosError.response?.data && typeof axiosError.response.data === 'string') {
          try {
            errorData = JSON.parse(axiosError.response.data);
          } catch {
            errorData = { raw: axiosError.response.data };
          }
        }

        const errMsg = (errorData && (errorData.message || errorData.error || errorData.errors?.[0]?.message)) || `Erreur FedaPay (${status})`;
        console.error('[FEDAPAY] Full error:', { status, errorData, axiosMessage: axiosError.message });
        console.warn('[FEDAPAY] Error response:', { status, error: errMsg, raw: errorData });
        return res.status(status).json({ success: false, error: errMsg, raw: errorData });
      }

      if (!result) {
        console.warn('[FEDAPAY] Empty response from FedaPay');
        return res.status(500).json({ success: false, error: 'Réponse vide de FedaPay' });
      }

      const transaction = result.data || result;
      const transactionId = String(transaction.id || transaction.transaction_id || transaction.reference || `txn-${Date.now()}`);
      const transactionReference = String(transaction.reference || transaction.id || transaction.transaction_id || '');
      const checkoutLink = transaction.payment_url || transaction.cta?.url || transaction.link || `https://app.fedapay.com/transactions/${transactionId}`;

      await safeCreateTransactionRecord({
        transactionId,
        reference: transactionReference,
        email: customerEmailValue || String(phoneNumber),
        amount: Number(transaction.amount || Math.round(Number(amount))),
        currency: String(transaction.currency || currency || 'XOF'),
        status: String(transaction.status || 'pending'),
        purpose: transactionPurpose,
        projectId: transactionProjectId,
      });

      try {
        await logActivity(String(customerEmail || phoneNumber), `Transaction FedaPay initiée (${transaction.id})`);
      } catch (error: any) {
        console.warn('[FEDAPAY] Failed to log activity after transaction:', error?.message || error);
      }

      return res.json({
        success: true,
        transaction: {
          id: transaction.id,
          reference: transaction.reference,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
        },
        link: checkoutLink,
        redirectUrl: checkoutLink,
      });
    } catch (error: any) {
      console.error('[FEDAPAY] Erreur de transaction:', error?.message || error, error?.response?.data || '');
      return res.status(500).json({ 
        success: false, 
        error: error?.message || 'Impossible de contacter FedaPay' 
      });
    }
  } catch (error: any) {
    console.error('[FEDAPAY] Erreur serveur:', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// FedaPay Transaction History
app.get('/api/fedapay/transactions', requireAdmin, async (req, res) => {
  try {
    const transactions = await queryAll(
      'SELECT fedapayTransactionId AS transactionId, reference, email, amount, currency, status, purpose, projectId, createdAt, updatedAt FROM transactions ORDER BY createdAt DESC',
    );
    return res.json({ transactions });
  } catch (error: any) {
    console.error('[FEDAPAY] Failed to load transactions:', error);
    return res.status(500).json({ success: false, error: 'Impossible de charger les transactions FedaPay.' });
  }
});

app.get('/api/fedapay/investor-count', async (req, res) => {
  try {
    const row = await queryOne(
      'SELECT COUNT(*) AS count FROM transactions WHERE email IS NOT NULL AND trim(email) != ? AND amount > ?',
      ['', 0],
    );
    const investorCount = Number(row?.count ?? 0);
    return res.json({ investorCount });
  } catch (error: any) {
    console.error('[FEDAPAY] Failed to count investors:', error);
    return res.status(500).json({ success: false, error: 'Impossible de compter les investisseurs FedaPay.' });
  }
});

app.get('/api/fedapay/summary', async (req, res) => {
  try {
    const row = await queryOne(
      'SELECT COUNT(*) AS investorCount, SUM(amount) AS totalAmount FROM transactions WHERE email IS NOT NULL AND trim(email) != ? AND amount > ?',
      ['', 0],
    );
    const investorCount = Number(row?.investorCount ?? 0);
    const totalAmount = Number(row?.totalAmount ?? 0);
    return res.json({ investorCount, totalAmount });
  } catch (error: any) {
    console.error('[FEDAPAY] Failed to compute summary:', error);
    return res.status(500).json({ success: false, error: 'Impossible de calculer le total des transactions FedaPay.' });
  }
});

app.get('/api/project-metrics', async (req, res) => {
  try {
    const metricsRow = await queryOne('SELECT collectedAmount, investedAmount FROM project_metrics WHERE id = ?', ['default_project']);
    const collectedAmount = Number(metricsRow?.collectedAmount ?? 0);
    const investedAmount = Number(metricsRow?.investedAmount ?? 0);

    let donorCount = 0;
    const donorRow = await queryOne(
      'SELECT COUNT(DISTINCT lower(trim(email))) AS donorCount FROM transactions WHERE email IS NOT NULL AND trim(email) != ? AND amount > ? AND lower(trim(status)) NOT IN (?, ?, ?)',
      ['', 0, 'failed', 'cancelled', 'pending'],
    );
    donorCount = Number(donorRow?.donorCount ?? 0);
    if (donorCount === 0) {
      const fallbackRow = await queryOne('SELECT COUNT(*) AS donorCount FROM users WHERE totalCollected > ?', [0]);
      donorCount = Number(fallbackRow?.donorCount ?? 0);
    }

    return res.json({ collectedAmount, investedAmount, donorCount });
  } catch (error: any) {
    console.error('[PROJECT METRICS] Failed to load project metrics:', error);
    return res.status(500).json({ success: false, error: 'Impossible de charger les métriques de projet.' });
  }
});

// FedaPay Callback Handler
app.post('/api/fedapay/callback', async (req, res) => {
  try {
    const callbackPayload = Object.keys(req.body || {}).length ? req.body : req.query;

    if (!callbackPayload || Object.keys(callbackPayload).length === 0) {
      return res.status(400).json({ success: false, error: 'Aucun payload reçu' });
    }

    const transactionId = String(callbackPayload.transaction_id || callbackPayload.id || 'unknown');
    const status = String(callbackPayload.status || 'unknown');
    const email = String(callbackPayload.customer_email || callbackPayload.email || 'callback@fedapay');
    const amount = callbackPayload.amount || 0;

    console.log('[FEDAPAY] Callback reçu:', { transactionId, status, amount });

    const createdAt = new Date().toLocaleString('fr-FR');
    await runWrite('INSERT INTO activity (email, action, createdAt) VALUES (?, ?, ?)', [
      email,
      `Callback FedaPay: Transaction ${transactionId}, Statut=${status}, Montant=${amount}`,
      createdAt,
    ]);
    await deleteOldActivity();

    return res.json({ success: true, received: true });
  } catch (error: any) {
    console.error('[FEDAPAY] Erreur callback:', error);
    return res.status(500).json({ success: false, error: 'Erreur callback' });
  }
});

// Webhook handler for FedaPay (for server-to-server notifications)
app.post('/api/fedapay/webhook', async (req, res) => {
  try {
    const fedapayWebhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET || FEDAPAY_SECRET_KEY;
    const headerSecret = String(req.headers['x-fedapay-webhook-secret'] || req.headers['x-fedapay-signature'] || '');
    const requireWebhookSecret = process.env.NODE_ENV === 'production' || Boolean(process.env.FEDAPAY_WEBHOOK_SECRET);

    if (requireWebhookSecret) {
      if (!fedapayWebhookSecret) {
        console.error('[FEDAPAY] Webhook secret missing in production configuration');
        return res.status(500).json({ success: false, error: 'Secret webhook non configuré.' });
      }

      if (!headerSecret || headerSecret !== fedapayWebhookSecret) {
        console.warn('[FEDAPAY] Webhook rejected: invalid or missing signature header');
        return res.status(401).json({ success: false, error: 'Signature webhook invalide' });
      }
    }

    const event = req.body;
    console.log('[FEDAPAY] Webhook reçu:', event?.type);

    if (event?.type === 'transaction.success' || event?.type === 'transaction.completed') {
      const transaction = event.data;
      const email = transaction?.customer?.email || 'webhook@fedapay';
      const projectId = String(transaction?.metadata?.projectId || 'default_project');
      const amount = Number(transaction?.amount || 0);
      const status = String(transaction?.status || 'completed');
      const reference = String(transaction?.reference || '');
      const transactionId = String(transaction?.id || transaction?.transaction_id || '');

      if (transactionId) {
        createTransactionRecord({
          transactionId,
          reference,
          email,
          amount,
          currency: String(transaction?.currency || 'XOF'),
          status,
          purpose: String(transaction?.metadata?.purpose || 'investment'),
          projectId,
        });
        await updateTransactionStatus(transactionId, status);
      }

      if (email && amount > 0) {
        await addConfirmedInvestment(email, amount, projectId);
      }

      const createdAt = new Date().toLocaleString('fr-FR');
      await runWrite('INSERT INTO activity (email, action, createdAt) VALUES (?, ?, ?)', [
        email,
        `Paiement FedaPay confirmé: ${reference}, Montant=${amount}${transaction?.currency}`,
        createdAt,
      ]);
      await deleteOldActivity();
    }

    return res.json({ success: true, received: true });
  } catch (error: any) {
    console.error('[FEDAPAY] Erreur webhook:', error);
    return res.status(500).json({ success: false, error: 'Erreur webhook' });
  }
});

app.post('/api/activity', async (req, res) => {
  const { email, action } = req.body;
  if (!email || !action) {
    return res.status(400).json({ error: 'Email et action requis pour enregistrer l’activité.' });
  }
  await logActivity(String(email), String(action));
  return res.json({ success: true });
});

// Admin: reset collected amount and investor count to zero
app.post('/api/admin/reset-metrics', requireAdmin, async (req, res) => {
  try {
    // Remove all transactions so investor count becomes 0
    await runWrite('DELETE FROM transactions');

    // Reset project metrics (collectedAmount and investedAmount)
    await runWrite('UPDATE project_metrics SET collectedAmount = ?, investedAmount = ?, updatedAt = ? WHERE id = ?', [0, 0, new Date().toISOString(), 'default_project']);

    await logActivity((req as any).auth?.email || 'admin', 'Réinitialisation des métriques (montant collecté et nombre d\'investisseurs mis à zéro)');
    return res.json({ success: true });
  } catch (error: any) {
    console.error('[ADMIN] Failed to reset metrics:', error);
    return res.status(500).json({ success: false, error: 'Échec de la réinitialisation des métriques.' });
  }
});

// Admin: delete a user by email
app.delete('/api/users/:email', requireAdmin, async (req, res) => {
  try {
    const email = String(req.params.email || '').toLowerCase();
    console.log('[DELETE] request for user:', email);
    if (!email) return res.status(400).json({ error: 'Email requis.' });
    const existing = await getUserByEmail(email);
    console.log('[DELETE] existing user lookup:', !!existing);
    if (!existing) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    await runWrite('DELETE FROM users WHERE lower(email) = ?', [email]);
    await logActivity(email, 'Compte utilisateur supprimé par l\'administrateur');
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression utilisateur:', error);
    return res.status(500).json({ error: 'Impossible de supprimer l\'utilisateur.' });
  }
});

app.post('/api/users/login', rateLimit('login', 10, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const user = await getUserByEmail(String(email));
    if (!user) {
      return res.status(404).json({ error: 'Aucun compte trouvé avec cet email.' });
    }

    if (!user.password) {
      console.error(`[LOGIN] Erreur: Mot de passe manquant pour l'utilisateur ${user.email}`);
      return res.status(500).json({ error: 'Erreur d\'authentification. Contacter l\'administrateur.' });
    }

    const isPasswordValid = bcrypt.compareSync(String(password), user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    await logActivity(user.email, 'Connexion');
    const token = await createSession(user.email, user.role || 'user');
    return res.json({ user: sanitizeUser(user), mustChangePassword: user.mustChangePassword, token });
  } catch (error: any) {
    console.error('[LOGIN] Erreur lors de la connexion:', error);
    return res.status(500).json({ error: error?.message || 'Erreur d\'authentification.' });
  }
});

// Validate token endpoint - returns 200 if token is valid, 401 if invalid/expired
app.get('/api/validate-token', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Session invalide ou expirée' });
  }

  const token = String(authHeader).substring(7).trim();
  const session = await getSession(token);

  if (!session) {
    return res.status(401).json({ error: 'Session invalide ou expirée' });
  }

  return res.json({ valid: true, email: session.email, role: session.role });
});

// Session recovery endpoint - allows getting a new token if old one is lost (e.g., after deployment)
// Only works for users who can provide their credentials
app.post('/api/session/recover', rateLimit('session-recover', 5, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const user = await getUserByEmail(String(email));
    if (!user) {
      return res.status(404).json({ error: 'Aucun compte trouvé avec cet email.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Seuls les administrateurs peuvent récupérer une session.' });
    }

    if (!user.password) {
      return res.status(500).json({ error: 'Erreur d\'authentification.' });
    }

    const isPasswordValid = bcrypt.compareSync(String(password), user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Create a new session token for this user
    const token = await createSession(user.email, user.role);
    console.log(`[SESSION] Recovery: New session issued for ${user.email}`);
    
    return res.json({ 
      success: true, 
      user: sanitizeUser(user), 
      token,
      message: 'Session récupérée avec succès après le déploiement.' 
    });
  } catch (error: any) {
    console.error('[SESSION] Recovery error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération de la session.' });
  }
});

// Public registration endpoint (useful for local development)
app.post('/api/users/register', rateLimit('register', 5, 15 * 60 * 1000), async (req, res) => {
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
    const resolvedProfession = String(profession || '').trim();
    const rawPassword = String(password || '').trim();
    const resolvedPassword = rawPassword || '123456';

    if (!resolvedFirstName || !email || !dob || !resolvedGender) {
      return res.status(400).json({ error: 'Tous les champs obligatoires sont requis.' });
    }

    if (rawPassword && rawPassword.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const lowerEmail = String(email).toLowerCase();
    if (await getUserByEmail(lowerEmail)) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
    }

    const createdAt = new Date().toLocaleString('fr-FR');
    const hashedPassword = bcrypt.hashSync(resolvedPassword, 10);

    // insert user (verified defaults to 0)
    await runWrite(
      `INSERT INTO users (firstName, lastName, name, email, dob, profession, phoneNumber, gender, role, photoUrl, password, createdAt, mustChangePassword)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resolvedFirstName,
        resolvedLastName,
        resolvedName,
        lowerEmail,
        String(dob).trim(),
        resolvedProfession,
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
    await runWrite(
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
    
    // Detect specific errors
    if (String(error.message || '').includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }
    if (String(error.message || '').includes('SQL parameter mismatch')) {
      console.error('SQL Error:', error.message);
      return res.status(500).json({ error: 'Erreur serveur: paramètres SQL invalides' });
    }
    
    return res.status(500).json({ error: 'Erreur interne lors de l\'inscription.' });
  }
});

app.get('/api/users/verify', async (req, res) => {
  try {
    const token = String(req.query.token || '').trim();
    if (!token) return res.status(400).json({ error: 'Token de vérification requis.' });

    const row = await queryOne('SELECT * FROM email_verifications WHERE token = ? LIMIT 1', [token]);
    if (!row) return res.status(404).json({ error: 'Token invalide ou expiré.' });

    const now = new Date();
    // expiresAt stored as localized string; we'll be permissive — accept if record exists
    const email = String(row.email || '').toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email associé introuvable.' });

    // mark user verified
    await runWrite('UPDATE users SET verified = 1 WHERE lower(email) = ?', [email]);
    // remove the token
    await runWrite('DELETE FROM email_verifications WHERE token = ?', [token]);

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
  const resolvedProfession = String(profession || '').trim();
  const rawPassword = String(password || '').trim();
  const resolvedPassword = rawPassword || '123456';

  if (!resolvedFirstName || !email || !dob || !resolvedGender) {
    return res.status(400).json({ error: 'Tous les champs obligatoires sont requis.' });
  }

  if (rawPassword && rawPassword.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  const lowerEmail = String(email).toLowerCase();
  if (await getUserByEmail(lowerEmail)) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
  }

  const createdAt = new Date().toLocaleString('fr-FR');
  const hashedPassword = bcrypt.hashSync(resolvedPassword, 10);
  const mustChange = mustChangePassword === false ? false : true;
  // validate role
  const normalizedRole = String(role || 'user').trim().toLowerCase();
  const allowedRoles = ['admin', 'user'];
  const finalRole = allowedRoles.includes(normalizedRole) ? normalizedRole : 'user';

  await runWrite(
    `INSERT INTO users (firstName, lastName, name, email, dob, profession, phoneNumber, gender, role, photoUrl, password, createdAt, mustChangePassword)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resolvedFirstName,
      resolvedLastName,
      resolvedName,
      lowerEmail,
      String(dob).trim(),
      resolvedProfession,
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
  const user = await getUserByEmail(lowerEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }
  await runWrite('UPDATE users SET password = ?, mustChangePassword = 0 WHERE lower(email) = ?', [bcrypt.hashSync(String(newPassword), 10), lowerEmail]);

  await logActivity(lowerEmail, 'Modification du mot de passe');
  return res.json({ success: true });
});

app.post('/api/users/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email et nouveau mot de passe requis.' });
  }

  const lowerEmail = String(email).toLowerCase();
  const user = await getUserByEmail(lowerEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }
  await runWrite('UPDATE users SET password = ?, mustChangePassword = 1 WHERE lower(email) = ?', [bcrypt.hashSync(String(newPassword), 10), lowerEmail]);

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
  const user = await getUserByEmail(lowerOldEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }
  if (lowerOldEmail !== lowerNewEmail && await getUserByEmail(lowerNewEmail)) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
  }

  await runWrite(
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
  const updatedUser = await getUserByEmail(lowerNewEmail);
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
