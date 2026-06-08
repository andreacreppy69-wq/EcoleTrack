#!/usr/bin/env node

/**
 * Script de diagnostic et lancement du serveur
 * Ce script vérifie tous les prérequis avant de lancer le serveur
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.clear();
console.log('🚀 Diagnostic et lancement du serveur');
console.log('='.repeat(60));
console.log('');

// Vérifications
const checks = [
  {
    name: 'Node.js',
    test: () => true,
    fix: () => console.log('  💡 Installez Node.js depuis nodejs.org')
  },
  {
    name: 'Fichier server.ts',
    test: () => fs.existsSync(path.join(__dirname, 'server.ts')),
    fix: () => console.log('  ❌ Fichier server.ts introuvable')
  },
  {
    name: 'package.json',
    test: () => fs.existsSync(path.join(__dirname, 'package.json')),
    fix: () => console.log('  ❌ Fichier package.json introuvable')
  },
  {
    name: 'node_modules',
    test: () => fs.existsSync(path.join(__dirname, 'node_modules')),
    fix: () => console.log('  💡 Exécutez: npm install')
  },
  {
    name: 'sql.js WASM',
    test: () => fs.existsSync(path.join(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm')),
    fix: () => console.log('  💡 Exécutez: npm install sql.js')
  },
  {
    name: 'bcryptjs',
    test: () => fs.existsSync(path.join(__dirname, 'node_modules/bcryptjs')),
    fix: () => console.log('  💡 Exécutez: npm install bcryptjs')
  }
];

console.log('📋 Vérifications:');
let allPassed = true;
checks.forEach(check => {
  const passed = check.test();
  const icon = passed ? '✓' : '✗';
  console.log(`  ${icon} ${check.name}`);
  if (!passed) {
    allPassed = false;
    check.fix();
  }
});

console.log('');

if (!allPassed) {
  console.log('⚠️  Certaines vérifications ont échoué. Installez les dépendances manquantes avant de continuer.');
  console.log('');
  console.log('Commandes suggérées:');
  console.log('  npm install');
  console.log('  npm install bcryptjs');
  console.log('');
  process.exit(1);
}

console.log('✅ Tous les prérequis sont satisfaits!');
console.log('');
console.log('📝 Configuration du serveur:');
console.log('  - Port: 4000 (par défaut)');
console.log('  - Base de données: database.sqlite');
console.log('  - Admin par défaut: admin@admin.com / Admin@123');
console.log('');
console.log('🎯 Démarrage du serveur dans 2 secondes...');
console.log('');

setTimeout(() => {
  // Lancer le serveur
  const cmd = process.platform === 'win32' ? 'npm run dev' : 'npm run dev';
  
  const child = exec(cmd, { cwd: __dirname });
  
  child.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  child.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`\n❌ Le serveur s'est arrêté avec le code ${code}`);
      process.exit(code);
    }
  });
}, 2000);
