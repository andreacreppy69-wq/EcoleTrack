import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000';

console.log('🧪 Test de connexion admin - Script de dépannage');
console.log('='.repeat(50));
console.log('');

async function testAdminLogin() {
  const credentials = {
    email: 'admin@admin.com',
    password: 'Admin@123'
  };

  console.log('📤 Envoi de la requête de connexion...');
  console.log(`   URL: ${API_BASE}/api/users/login`);
  console.log(`   Données: Email="${credentials.email}"`);
  console.log('');

  try {
    const response = await fetch(`${API_BASE}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log(`📥 Réponse reçue:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log('');

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Connexion admin réussie!');
      console.log('');
      console.log('📋 Informations retournées:');
      console.log(`   Email: ${data.user?.email}`);
      console.log(`   Rôle: ${data.user?.role}`);
      console.log(`   Doit changer le mot de passe: ${data.mustChangePassword}`);
      console.log(`   Token: ${data.token ? data.token.substring(0, 20) + '...' : 'non reçu'}`);
    } else {
      console.log('❌ Erreur de connexion');
      console.log(`   Message: ${data.error || data.message || 'Erreur inconnue'}`);
    }

  } catch (error) {
    console.log('❌ Erreur réseau');
    console.log(`   Message: ${error.message}`);
    console.log('');
    console.log('💡 Assurez-vous que le serveur backend est lancé:');
    console.log('   cd "d:\\Projet AYISSOU\\go"');
    console.log('   npm run dev');
  }
}

testAdminLogin();
