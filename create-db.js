import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hash = bcrypt.hashSync('password123', 10);
const database = {
  users: [{
    name: 'Test User',
    email: 'test@example.com',
    dob: '2000-01-01',
    profession: 'Testeur',
    photoUrl: '',
    password: hash,
    createdAt: new Date().toLocaleString('fr-FR'),
    mustChangePassword: true
  }],
  activity: []
};

fs.writeFileSync(path.join(__dirname, 'database.json'), JSON.stringify(database, null, 2));
console.log('Database created successfully!');
