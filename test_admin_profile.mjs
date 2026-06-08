import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000';
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'Admin@123';

async function run() {
  const loginResponse = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  console.log('login status', loginResponse.status);
  const loginData = await loginResponse.json();
  console.log('login body', loginData);
  const token = loginData.token;

  const profileResponse = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(ADMIN_EMAIL)}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  console.log('profile status', profileResponse.status);
  console.log('profile body', await profileResponse.text());
}

run().catch((err) => {
  console.error('error', err);
  process.exit(1);
});
