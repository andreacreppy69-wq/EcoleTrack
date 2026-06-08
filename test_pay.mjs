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
  console.log('Testing /api/pay');
  const payload = {
    amount: 100,
    phoneNumber: '+22891551295',
    network: 'TMONEY',
    description: 'Test paiement',
    identifier: `TEST-${Date.now()}`,
    customerEmail: 'test@local'
  };
  const result = await doFetch('/api/pay', { method: 'POST', body: JSON.stringify(payload) });
  console.log('Status:', result.status);
  console.log('Body:', result.body);
})();
