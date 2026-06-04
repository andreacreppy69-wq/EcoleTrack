import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcryptjs';

dotenv.config();

interface UserRecord {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  dob: string;
  profession: string;
  gender: string;
  photoUrl: string;
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
];
const envOrigins = String(process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
const allowedOrigins = envOrigins.length ? [...defaultOrigins, ...envOrigins] : defaultOrigins;
const localOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin) || localOriginPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const dbPath = path.resolve(process.cwd(), 'database.json');
const adapter = new JSONFile<DatabaseSchema>(dbPath);
const db = new Low<DatabaseSchema>(adapter, { users: [], activity: [], messages: [], tierProgress: [15, 0, 0, 0] });

await db.read();
if (!db.data) {
  db.data = { users: [], activity: [], messages: [], tierProgress: [15, 0, 0, 0] };
  await db.write();
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

db.data!.users = db.data!.users.map(normalizeUserRecord);
await db.write();

if (!Array.isArray(db.data.tierProgress) || db.data.tierProgress.length !== 4) {
  db.data.tierProgress = [15, 0, 0, 0];
  await db.write();
}

const sanitizeUser = (user: UserRecord) => ({
  firstName: String(user.firstName || '').trim(),
  lastName: String(user.lastName || '').trim(),
  name: getDisplayName(user),
  email: user.email,
  dob: user.dob,
  profession: user.profession,
  gender: user.gender || '',
  photoUrl: user.photoUrl || '',
  createdAt: user.createdAt,
  mustChangePassword: user.mustChangePassword,
});

const logActivity = async (email: string, action: string) => {
  const createdAt = new Date().toLocaleString('fr-FR');
  db.data!.activity.unshift({ email, action, createdAt });
  db.data!.activity = db.data!.activity.slice(0, 50);
  await db.write();
};

app.get('/api/users', async (req, res) => {
  await db.read();
  const users = db.data!.users.slice().reverse().map(sanitizeUser);
  res.json({ users });
});

app.get('/api/users/:email', async (req, res) => {
  await db.read();
  const email = String(req.params.email).toLowerCase();
  const user = db.data!.users.find((item) => item.email.toLowerCase() === email);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }
  return res.json({ user: sanitizeUser(user) });
});

app.get('/api/activity', async (req, res) => {
  await db.read();
  const activity = db.data!.activity.slice(0, 50);
  res.json({ activity });
});

app.get('/api/messages', async (req, res) => {
  await db.read();
  const messages = db.data!.messages.slice(0, 50);
  res.json({ messages });
});

app.post('/api/messages', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nom, email et message sont requis.' });
  }

  await db.read();
  const createdAt = new Date().toLocaleString('fr-FR');
  db.data!.messages.unshift({
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    message: String(message).trim(),
    createdAt,
  });
  db.data!.messages = db.data!.messages.slice(0, 50);
  await db.write();
  await logActivity(String(email).trim().toLowerCase(), 'Requête sécurisée envoyée');
  return res.json({ success: true });
});

app.get('/api/tier-progress', async (req, res) => {
  await db.read();
  res.json({ tierProgress: db.data!.tierProgress });
});

app.post('/api/tier-progress', async (req, res) => {
  try {
    const { tierProgress } = req.body;
    if (!Array.isArray(tierProgress) || tierProgress.length !== 4 || !tierProgress.every((value: any) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100)) {
      return res.status(400).json({ error: 'Progression invalide. Quatre valeurs numériques entre 0 et 100 sont requises.' });
    }

    await db.read();
    db.data!.tierProgress = tierProgress.map((value: number) => Math.round(Math.max(0, Math.min(100, value))));
    await db.write();
    await logActivity('admin@admin.com', 'Progression des paliers mise à jour');
    return res.json({ success: true, tierProgress: db.data!.tierProgress });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour des paliers :', error);
    return res.status(500).json({ error: 'Erreur interne lors de la mise à jour des paliers.' });
  }
});

app.post('/api/pay', async (req, res) => {
  const { amount, currency, customerName, customerEmail, description, orderId, callbackUrl, returnUrl } = req.body;
  if (!amount || !currency || !customerName || !customerEmail || !description || !orderId) {
    return res.status(400).json({ error: 'Tous les champs de paiement requis doivent être fournis.' });
  }

  const apiKey = process.env.PAYGATE_GLOBAL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API PayGateGlobal non configurée.' });
  }

  try {
    const paymentResponse = await fetch('https://paygateglobal.com/api/v1/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        customerName,
        customerEmail,
        description,
        orderId,
        callbackUrl,
        returnUrl,
      }),
    });

    const result = await paymentResponse.json();
    if (!paymentResponse.ok) {
      return res.status(paymentResponse.status).json({ error: result.error || result.message || 'Erreur PayGateGlobal' });
    }

    await logActivity(String(customerEmail), `Transaction PayGateGlobal initiée (${orderId})`);
    return res.json(result);
  } catch (error: any) {
    console.error('Erreur de transaction PayGateGlobal :', error);
    return res.status(500).json({ error: 'Impossible de contacter le service de paiement.' });
  }
});

app.post('/api/pay/callback', async (req, res) => {
  const callbackPayload = Object.keys(req.body || {}).length ? req.body : req.query;

  if (!callbackPayload || Object.keys(callbackPayload).length === 0) {
    return res.status(400).json({ error: 'Aucun payload de callback reçu.' });
  }

  const customerEmail = String(callbackPayload.customerEmail || callbackPayload.email || 'callback@paygate');
  const orderId = String(callbackPayload.orderId || callbackPayload.order_id || callbackPayload.reference || callbackPayload.tx_reference || 'unknown');
  const status = String(callbackPayload.status || callbackPayload.payment_status || callbackPayload.transaction_status || 'inconnu');

  await db.read();
  const createdAt = new Date().toLocaleString('fr-FR');
  db.data!.activity.unshift({
    email: customerEmail,
    action: `Callback PayGateGlobal reçu : commande=${orderId}, statut=${status}`,
    createdAt,
  });
  db.data!.activity = db.data!.activity.slice(0, 50);
  await db.write();

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

  await db.read();
  const user = db.data!.users.find((item) => item.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'Aucun compte trouvé avec cet email.' });
  }

  const isPasswordValid = bcrypt.compareSync(String(password), user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
  }

  await logActivity(user.email, 'Connexion');
  return res.json({ user: sanitizeUser(user), mustChangePassword: user.mustChangePassword });
});

app.post('/api/users/create', async (req, res) => {
  const { firstName, lastName, name, email, dob, profession, gender, photoUrl, password, mustChangePassword } = req.body;
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

  await db.read();
  const lowerEmail = String(email).toLowerCase();
  const existing = db.data!.users.find((user) => user.email.toLowerCase() === lowerEmail);
  if (existing) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
  }

  const createdAt = new Date().toLocaleString('fr-FR');
  const hashedPassword = bcrypt.hashSync(resolvedPassword, 10);
  const mustChange = mustChangePassword === false ? false : true;

  db.data!.users.push({
    firstName: resolvedFirstName,
    lastName: resolvedLastName,
    name: resolvedName,
    email: lowerEmail,
    dob: String(dob).trim(),
    profession: String(profession).trim(),
    gender: resolvedGender,
    photoUrl: String(photoUrl || ''),
    password: hashedPassword,
    createdAt,
    mustChangePassword: mustChange,
  });
  await db.write();

  await logActivity(lowerEmail, 'Compte utilisateur créé par l’administrateur');
  return res.status(201).json({ success: true });
});

app.post('/api/users/change-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email et nouveau mot de passe requis.' });
  }

  await db.read();
  const lowerEmail = String(email).toLowerCase();
  const user = db.data!.users.find((item) => item.email.toLowerCase() === lowerEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  user.password = bcrypt.hashSync(String(newPassword), 10);
  user.mustChangePassword = false;
  await db.write();

  await logActivity(lowerEmail, 'Modification du mot de passe');
  return res.json({ success: true });
});

app.post('/api/users/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email et nouveau mot de passe requis.' });
  }

  await db.read();
  const lowerEmail = String(email).toLowerCase();
  const user = db.data!.users.find((item) => item.email.toLowerCase() === lowerEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  user.password = bcrypt.hashSync(String(newPassword), 10);
  user.mustChangePassword = true;
  await db.write();

  await logActivity(lowerEmail, 'Mot de passe administrateur réinitialisé');
  return res.json({ success: true });
});

app.post('/api/users/update', async (req, res) => {
  const { oldEmail, firstName, lastName, name, email, dob, profession, gender, photoUrl } = req.body;
  const resolvedFirstName = String(firstName || '').trim();
  const resolvedLastName = String(lastName || '').trim();
  const resolvedName = String(name || `${resolvedFirstName} ${resolvedLastName}`).trim();
  const resolvedGender = String(gender || '').trim();

  if (!oldEmail || !email || !dob || !profession || !resolvedFirstName || !resolvedLastName) {
    return res.status(400).json({ error: 'Tous les champs obligatoires sont requis (Email, DOB, Profession, Nom, Prénom).' });
  }

  await db.read();
  const lowerOldEmail = String(oldEmail).toLowerCase();
  const lowerNewEmail = String(email).toLowerCase();
  const user = db.data!.users.find((item) => item.email.toLowerCase() === lowerOldEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  if (lowerOldEmail !== lowerNewEmail) {
    const existing = db.data!.users.find((item) => item.email.toLowerCase() === lowerNewEmail);
    if (existing) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
    }
  }

  user.firstName = resolvedFirstName;
  user.lastName = resolvedLastName;
  user.name = resolvedName;
  user.email = lowerNewEmail;
  user.dob = String(dob).trim();
  user.profession = String(profession).trim();
  if (resolvedGender) {
    user.gender = resolvedGender;
  }
  user.photoUrl = String(photoUrl || '');
  await db.write();

  await logActivity(lowerNewEmail, 'Profil utilisateur modifié');
  return res.json({
    success: true,
    user: sanitizeUser(user),
  });
});

app.listen(port, () => {
  console.log(`Backend API server is running on http://localhost:${port}`);
});

// Simple health route to confirm the API is reachable (useful for Render or other hosts)
app.get('/', (req, res) => {
  res.send('API is running');
});
