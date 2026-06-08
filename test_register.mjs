const API = process.env.API_BASE || 'http://localhost:4000';

const doFetch = async (path, opts = {}) => {
  const url = `${API}${path}`;
  const res = await fetch(url, { headers: { 'content-type': 'application/json' }, ...opts });
  const body = await res.text();
  let json = null;
  try { json = JSON.parse(body); } catch (e) { /* ignore */ }
  return { ok: res.ok, status: res.status, body: json ?? body };
};

(async () => {
  const email = `reg_${Date.now()}@example.com`;
  console.log('Registering', email);
  const result = await doFetch('/api/users/register', { method: 'POST', body: JSON.stringify({ firstName: 'Reg', lastName: 'User', email, dob: '1990-01-01', profession: 'Dev', gender: 'Other', password: 'regpass123' }) });
  console.log('Status:', result.status, result.body);
})();
