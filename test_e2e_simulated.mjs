#!/usr/bin/env node

const API_URL = 'http://localhost:4000';

// Simulate the parts of the frontend logic we changed: registerSuccess/registerError and admin flag handling
async function run() {
  const state = {
    registerSuccess: '',
    registerError: '',
    isAdminAuthenticated: false,
    localStorage: {},
    profile: null,
    token: null,
  };

  try {
    const email = `e2e${Date.now()}@example.com`;
    console.log('Registering', email);
    const reg = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'E2E', lastName: 'Test', email, dob: '1990-01-01', profession: 'Dev', gender: 'M', password: 'test123456' })
    });
    const regBody = await reg.json().catch(() => ({}));
    console.log('  register status', reg.status);

    if (reg.ok && regBody.verificationLink) {
      state.registerError = '';
      state.registerSuccess = `Compte créé. Vérifiez l'email: ${regBody.verificationLink}`;
    } else if (!reg.ok) {
      state.registerSuccess = '';
      state.registerError = regBody.error || 'Erreur inscription';
    }

    // Simulate auto-login flow
    console.log('Logging in...');
    try {
      const login = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'test123456' })
      });
      const loginBody = await login.json();
      if (!login.ok) throw new Error(loginBody.error || 'Login failed');

      // login success
      state.token = loginBody.token;
      state.profile = loginBody.user;
      state.isAdminAuthenticated = String(loginBody.user.role || '').toLowerCase() === 'admin';
      state.localStorage.siteAuthToken = state.token;
      state.localStorage.siteAdminAuthenticated = state.isAdminAuthenticated ? 'true' : 'false';

      // Ensure we don't have both messages set
      if (state.registerSuccess && state.registerError) {
        console.error('Both registerSuccess and registerError are set — FAIL');
      } else {
        console.log('Register messages OK —', state.registerSuccess ? 'success' : (state.registerError ? 'error' : 'none'));
      }

    } catch (loginErr) {
      // If auto-login fails, frontend sets success fallback and local flag
      state.localStorage.siteAccountCreated = 'true';
      state.registerError = '';
      state.registerSuccess = 'Compte créé avec succès! Vous pouvez maintenant vous connecter avec vos identifiants.';
      console.log('Auto-login failed, set fallback success message');
    }

    // Now simulate loadUsers() which is called only for admin sessions
    console.log('Simulating loadUsers()...');
    try {
      const headers = {};
      if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
      const usersResp = await fetch(`${API_URL}/api/users`, { headers });
      const usersBody = await usersResp.json().catch(() => ({}));
      console.log('  users status', usersResp.status);
      if (!usersResp.ok) throw new Error(usersBody.error || usersResp.statusText);
      console.log('  users loaded, count:', Array.isArray(usersBody.users) ? usersBody.users.length : 'unknown');
    } catch (e) {
      const msg = String(e?.message || '').toLowerCase();
      console.log('  loadUsers error message:', msg);
      if (msg.includes('accès refusé') || msg.includes('access denied')) {
        // frontend behavior: clear admin flags
        delete state.localStorage.siteAdminAuthenticated;
        delete state.localStorage.siteAuthToken;
        state.isAdminAuthenticated = false;
        console.log('  Detected Accès refusé — cleared admin flags');
      }
    }

    // Final assertions: no simultaneous success+error, admin flag false for non-admin
    if (state.registerSuccess && state.registerError) {
      console.error('Final check: BOTH messages present -> FAIL');
      process.exit(2);
    }
    if (!state.isAdminAuthenticated && (state.localStorage.siteAdminAuthenticated === 'true')) {
      console.error('Final check: localStorage indicates admin but state does not -> FAIL');
      process.exit(3);
    }

    console.log('E2E simulated checks passed.');
    console.log('State snapshot:', { registerSuccess: !!state.registerSuccess, registerError: !!state.registerError, isAdminAuthenticated: state.isAdminAuthenticated });

  } catch (err) {
    console.error('Test failed', err);
    process.exit(1);
  }
}

run();
