#!/usr/bin/env node

const API_URL = 'http://localhost:4000';

async function run() {
  try {
    const testEmail = `testadmincall${Date.now()}@example.com`;
    console.log('Registering', testEmail);
    const reg = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'T', lastName: 'A', email: testEmail, dob: '1990-01-01', profession: 'Dev', gender: 'M', password: 'test123456' })
    });
    console.log('  register status', reg.status);
    const regData = await reg.json().catch(() => ({}));
    console.log('  reg body', regData);

    console.log('Logging in');
    const login = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test123456' })
    });
    console.log('  login status', login.status);
    const loginData = await login.json();
    console.log('  login body', { token: loginData.token ? loginData.token.slice(0,8)+'...' : null, user: loginData.user?.email, role: loginData.user?.role });

    console.log('Calling GET /api/users with user token (should be 403 Accès refusé)');
    const users = await fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${loginData.token}` } });
    console.log('  users status', users.status);
    const usersData = await users.json().catch(() => ({}));
    console.log('  users body', usersData);
  } catch (e) {
    console.error('Error', e);
  }
}

run();
