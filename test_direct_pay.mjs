const URL = 'https://paygateglobal.com/api/v1/payMethode';

const payload = {
  auth_token: '03a67441-feea-4ac6-9c72-e9d2079bd187',
  phone_number: '+22891551295',
  amount: 100,
  description: 'Test direct call',
  identifier: `DIRECT-${Date.now()}`,
  network: 'TMONEY'
};

(async () => {
  try {
    console.log('Posting to PayGateGlobal:', URL);
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { json = text; }
    console.log('Status:', res.status);
    console.log('Response:', json);
  } catch (err) {
    console.error('Network error:', err && err.message ? err.message : err);
  }
})();
