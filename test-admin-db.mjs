import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = path.resolve(__dirname, 'database.sqlite');
const sqlWasmPath = path.resolve(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm');

console.log('📁 Chemin DB:', dbPath);
console.log('📁 Chemin WASM:', sqlWasmPath);
console.log('');

const SQL = await initSqlJs({
  locateFile: () => sqlWasmPath,
});

if (!fs.existsSync(dbPath)) {
  console.error('❌ Fichier database.sqlite introuvable');
  process.exit(1);
}

const db = new SQL.Database(new Uint8Array(fs.readFileSync(dbPath)));

console.log('✓ Base de données chargée');
console.log('');

// Vérifier les comptes admin
const stmt = db.prepare('SELECT id, email, firstName, lastName, role, password FROM users WHERE lower(role) = "admin"');
const admins = [];
while (stmt.step()) {
  admins.push(stmt.getAsObject());
}
stmt.free();

console.log('👤 Comptes ADMIN trouvés:', admins.length);
admins.forEach((admin, i) => {
  const hasPassword = admin.password ? '✓ Mot de passe présent' : '✗ Mot de passe MANQUANT';
  console.log(`  ${i + 1}. ${admin.email} (${admin.firstName} ${admin.lastName}) - ${hasPassword}`);
});
console.log('');

// Vérifier le compte admin par défaut
const defaultEmail = 'admin@admin.com';
const defaultStmt = db.prepare('SELECT * FROM users WHERE lower(email) = ?');
defaultStmt.bind([defaultEmail.toLowerCase()]);
const defaultAdmin = defaultStmt.step() ? defaultStmt.getAsObject() : null;
defaultStmt.free();

if (defaultAdmin) {
  console.log(`✓ Compte par défaut "${defaultEmail}" existe`);
  console.log(`  Role: ${defaultAdmin.role}`);
  console.log(`  Mot de passe: ${defaultAdmin.password ? 'Présent' : 'MANQUANT'}`);
  console.log(`  Créé: ${defaultAdmin.createdAt}`);
} else {
  console.log(`⚠️  Compte par défaut "${defaultEmail}" N'EXISTE PAS`);
  console.log('');
  console.log('🔧 Création du compte admin par défaut...');
  
  const hashedPassword = bcrypt.hashSync('Admin@123', 10);
  const createdAt = new Date().toLocaleString('fr-FR');
  
  const insertStmt = db.prepare(
    `INSERT INTO users (firstName, lastName, name, email, dob, profession, phoneNumber, gender, role, photoUrl, password, createdAt, mustChangePassword)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  insertStmt.run([
    'Admin',
    'Root',
    'Admin Root',
    defaultEmail,
    '',
    'Administrator',
    '',
    '',
    'admin',
    '',
    hashedPassword,
    createdAt,
    0
  ]);
  insertStmt.free();
  
  // Sauvegarder la base de données
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  
  console.log(`✓ Compte admin créé avec succès!`);
  console.log(`  Email: ${defaultEmail}`);
  console.log(`  Mot de passe: Admin@123`);
}

console.log('');
console.log('✓ Vérification terminée');
