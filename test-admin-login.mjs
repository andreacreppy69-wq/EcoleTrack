import bcrypt from 'bcryptjs';

// Tester le mot de passe par défaut
const defaultPassword = 'Admin@123';
const hashedPassword = '$2a$10$5GI4VZc3rL9c8v.E8E0K5eE5r5r5r5r5r5r5r5r5r5r5r5r5r5r5r'; // Ceci est juste un placeholder

console.log('🔐 Tester l\'authentification admin');
console.log('');

// Test 1: Vérifier que bcrypt.compareSync fonctionne
console.log('Test 1: Vérifier que bcrypt fonctionne');
const testPassword = 'TestPassword123';
const hashedTest = bcrypt.hashSync(testPassword, 10);
const isMatch = bcrypt.compareSync(testPassword, hashedTest);
console.log(`  bcrypt fonctionne: ${isMatch ? '✓' : '✗'}`);
console.log('');

// Test 2: Simpler la connexion admin
console.log('Test 2: Vérifier les identifiants par défaut');
console.log('  Email: admin@admin.com');
console.log('  Mot de passe: Admin@123');
console.log('');
console.log('⚠️  Assurez-vous de:');
console.log('  1. ✓ Que le serveur est en cours d\'exécution (npm run dev)');
console.log('  2. ✓ Que la base de données SQLite a les bonnes données');
console.log('  3. ✓ Que le port backend est correct dans votre navigateur');
console.log('');
console.log('💡 Pour déboguer:');
console.log('  1. Ouvrez les DevTools (F12) du navigateur');
console.log('  2. Allez à l\'onglet Network');
console.log('  3. Tentez la connexion admin');
console.log('  4. Vérifiez la réponse exacte du serveur pour /api/users/login');
console.log('  5. Vérifiez les logs du serveur terminal');
