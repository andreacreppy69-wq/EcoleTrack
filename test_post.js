import fs from 'fs/promises';

const payload = await fs.readFile('test_payload.json', 'utf8');
try {
  const res = await fetch('http://localhost:4000/api/users/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text);
} catch (err) {
  console.error('Fetch error:', err);
}

