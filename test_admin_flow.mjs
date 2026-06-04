const API = process.env.API_BASE || 'http://localhost:4000';
const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@admin.com';
const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';

const log = (...a) => console.log('[TEST]', ...a);

const doFetch = async (path, opts = {}) => {
  const url = `${API}${path}`;
  const res = await fetch(url, { headers: { 'content-type': 'application/json' }, ...opts });
  const body = await res.text();
  let json = null;
  try { json = JSON.parse(body); } catch (e) { /* ignore */ }
  return { ok: res.ok, status: res.status, body: json ?? body };
};

const main = async () => {
  log('Login as admin:', ADMIN_EMAIL);
  const login = await doFetch('/api/users/login', { method: 'POST', body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }) });
  if (!login.ok) {
    console.error('Login failed', login.status, login.body);
    process.exit(1);
  }
  const token = login.body.token;
  log('Got token:', token ? 'yes' : 'NO');
  if (!token) process.exit(2);

  const headers = { 'content-type': 'application/json', Authorization: `Bearer ${token}` };

  const userEmail = `testuser_${Date.now()}@example.com`;
  log('Creating user (role=user):', userEmail);
  const createUser = await doFetch('/api/users/create', { method: 'POST', headers, body: JSON.stringify({ firstName: 'Test', lastName: 'User', email: userEmail, dob: '1990-01-01', profession: 'Tester', gender: 'Other', role: 'user', password: 'secret123' }) });
  log('Create user status:', createUser.status, createUser.body);
  if (!createUser.ok) process.exit(3);

  const adminEmail2 = `admin2_${Date.now()}@example.com`;
  log('Creating admin (role=admin):', adminEmail2);
  const createAdmin = await doFetch('/api/users/create', { method: 'POST', headers, body: JSON.stringify({ firstName: 'Admin2', lastName: 'User', email: adminEmail2, dob: '1985-01-01', profession: 'Admin', gender: 'Other', role: 'admin', password: 'AdminX123' }) });
  log('Create admin status:', createAdmin.status, createAdmin.body);
  if (!createAdmin.ok) process.exit(4);

  log('Query users?role=user');
  const usersUser = await doFetch(`/api/users?role=user`, { method: 'GET', headers });
  log('users?role=user status:', usersUser.status);
  if (!usersUser.ok) { console.error(usersUser.body); process.exit(5); }
  const foundUser = Array.isArray(usersUser.body.users) && usersUser.body.users.some(u => u.email === userEmail);
  log('Found created user in role=user list:', foundUser);
  if (!foundUser) process.exit(6);

  log('Query users?role=admin');
  const usersAdmin = await doFetch(`/api/users?role=admin`, { method: 'GET', headers });
  log('users?role=admin status:', usersAdmin.status);
  if (!usersAdmin.ok) { console.error(usersAdmin.body); process.exit(7); }
  const foundAdmin = Array.isArray(usersAdmin.body.users) && usersAdmin.body.users.some(u => u.email === adminEmail2);
  log('Found created admin in role=admin list:', foundAdmin);
  if (!foundAdmin) process.exit(8);

  log('All tests passed');
  process.exit(0);
};

main().catch(err => { console.error('Test error', err); process.exit(99); });
