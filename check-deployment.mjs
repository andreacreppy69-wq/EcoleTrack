#!/usr/bin/env node
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const checks = {
  filesExist: [],
  configValid: [],
  apiTests: [],
};

async function checkFilesExist() {
  console.log('\n📁 Vérification des fichiers...\n');
  const requiredFiles = [
    'server.ts',
    'package.json',
    'render.yaml',
    'tsconfig.json',
  ];

  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.resolve(file));
    const status = exists ? '✓' : '✗';
    console.log(`  ${status} ${file}`);
    checks.filesExist.push({ file, exists });
  }
}

async function checkConfig() {
  console.log('\n⚙️  Vérification de la configuration...\n');

  // Check render.yaml has PostgreSQL
  const renderYaml = fs.readFileSync('render.yaml', 'utf8');
  const hasPostgres = renderYaml.includes('type: pgsql');
  const hasWebService = renderYaml.includes('name: ecolestrack-api');
  const hasDatabaseUrl = renderYaml.includes('DATABASE_URL');
  
  console.log(`  ${hasPostgres ? '✓' : '✗'} render.yaml configure PostgreSQL service`);
  console.log(`  ${hasWebService ? '✓' : '✗'} render.yaml configure Web service`);
  console.log(`  ${hasDatabaseUrl ? '✓' : '✗'} render.yaml configure DATABASE_URL`);
  
  checks.configValid.push({ 
    postgres: hasPostgres, 
    webService: hasWebService,
    databaseUrl: hasDatabaseUrl
  });

  // Check package.json has required scripts
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasServerScript = pkg.scripts?.server !== undefined;
  const hasPrepareDb = pkg.scripts?.['prepare-db'] !== undefined;
  const hasPgDep = pkg.dependencies?.pg !== undefined;

  console.log(`  ${hasServerScript ? '✓' : '✗'} package.json has 'npm run server' script`);
  console.log(`  ${hasPrepareDb ? '✓' : '✗'} package.json has 'prepare-db' script`);
  console.log(`  ${hasPgDep ? '✓' : '✗'} package.json has 'pg' dependency`);

  checks.configValid.push({
    serverScript: hasServerScript,
    preparDb: hasPrepareDb,
    pgDep: hasPgDep
  });
}

async function testAPI() {
  console.log('\n🧪 Vérification de l\'API locale...\n');

  const api = 'http://localhost:4000';
  
  try {
    // Test health
    const health = await axios.get(`${api}/`);
    console.log(`  ✓ Health check: ${health.status} ${health.statusText}`);
    checks.apiTests.push({ health: true });
  } catch (e) {
    console.log(`  ✗ Health check failed: ${e.message}`);
    console.log(`    Assurez-vous que 'npm run server' tourne sur http://localhost:4000`);
    checks.apiTests.push({ health: false });
    return;
  }

  try {
    // Test login
    const login = await axios.post(`${api}/api/users/login`, {
      email: 'admin@admin.com',
      password: 'Admin@123',
    });
    console.log(`  ✓ Admin login works`);
    const token = login.data.token;
    checks.apiTests.push({ login: true, hasToken: !!token });

    // Test users endpoint
    const users = await axios.get(`${api}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`  ✓ Users endpoint works (${users.data?.users?.length || 0} users)`);
    checks.apiTests.push({ users: true });
  } catch (e) {
    console.log(`  ✗ API test failed: ${e.response?.data?.error || e.message}`);
    checks.apiTests.push({ login: false, users: false });
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 Résumé des vérifications');
  console.log('='.repeat(50) + '\n');

  const allFilesOk = checks.filesExist.every(c => c.exists);
  const allConfigOk = checks.configValid.every(c => Object.values(c).every(v => v));
  const allApiOk = checks.apiTests.every(c => Object.values(c).every(v => v !== false));

  console.log(`Fichiers: ${allFilesOk ? '✓ OK' : '✗ MANQUANTS'}`);
  console.log(`Configuration: ${allConfigOk ? '✓ OK' : '✗ INVALIDE'}`);
  console.log(`API: ${allApiOk ? '✓ OK' : '✗ ÉCHEC'}`);

  if (allFilesOk && allConfigOk && allApiOk) {
    console.log('\n🚀 Tout est prêt pour le déploiement sur Render!');
    console.log('\nProchaines étapes:');
    console.log('1. git add .');
    console.log('2. git commit -m "Deploy PostgreSQL to Render"');
    console.log('3. git push origin main');
    console.log('4. Allez à https://dashboard.render.com');
    console.log('5. Créez un nouveau Blueprint et connectez votre dépôt');
    console.log('\nVoir DEPLOYMENT_CHECKLIST.md pour plus de détails');
    process.exit(0);
  } else {
    console.log('\n⚠️  Veuillez corriger les erreurs avant le déploiement');
    console.log('\nVérifiez:');
    if (!allFilesOk) console.log('- Les fichiers requis existent');
    if (!allConfigOk) console.log('- render.yaml est configuré pour PostgreSQL');
    if (!allApiOk) console.log('- npm run server tourne et répond');
    process.exit(1);
  }
}

async function main() {
  console.log('🔍 Vérification de la configuration de déploiement PostgreSQL\n');

  await checkFilesExist();
  await checkConfig();
  await testAPI();
  await printSummary();
}

main().catch(console.error);
