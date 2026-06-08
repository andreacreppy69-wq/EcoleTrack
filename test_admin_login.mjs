// Test the admin login flow with API-based authentication

import fs from 'fs';
import path from 'path';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'Admin@123';
const BASE_URL = 'http://localhost:4000';

console.log('Testing admin login flow with API-based authentication...\n');

// Step 1: Login as admin
console.log('Step 1: Logging in as admin...');
const loginResponse = await fetch(`${BASE_URL}/api/users/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
});

const loginData = await loginResponse.json();
console.log(`Status: ${loginResponse.status}`);
console.log('Response:', JSON.stringify(loginData, null, 2));

if (!loginData.token) {
  console.error('ERROR: No token received from login!');
  process.exit(1);
}

const token = loginData.token;
console.log(`\n✓ Got token: ${token.substring(0, 16)}...\n`);

// Step 2: Try to access admin endpoint with token
console.log('Step 2: Accessing admin users endpoint with token...');
const usersResponse = await fetch(`${BASE_URL}/api/users`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const usersData = await usersResponse.json();
console.log(`Status: ${usersResponse.status}`);
console.log('Response:', JSON.stringify(usersData, null, 2).substring(0, 200) + '...\n');

if (usersResponse.status !== 200) {
  console.error('ERROR: Admin endpoint returned error!');
  process.exit(1);
}

console.log('✓ Admin authentication works!\n');

// Step 3: Verify session was persisted
console.log('Step 3: Checking if sessions.json file was created...');

const sessionsPath = path.resolve(process.cwd(), '.sessions.json');
if (fs.existsSync(sessionsPath)) {
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
  console.log('✓ Sessions file exists');
  console.log(`  Sessions stored: ${Object.keys(sessions).length}`);
  console.log(`  Token present: ${token in sessions ? 'YES' : 'NO'}`);
  if (token in sessions) {
    console.log(`  Session data: ${JSON.stringify(sessions[token])}`);
  }
} else {
  console.error('ERROR: Sessions file was not created!');
  process.exit(1);
}

console.log('\n✅ All tests passed! Admin login flow working correctly.');
