#!/usr/bin/env node
const http = require('http');
const https = require('https');
const { URL } = require('url');

const API_BASE = process.env.API_BASE || process.env.API_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function doRequest(urlString, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlString);
      const lib = url.protocol === 'https:' ? https : http;
      const options = {
        method,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + (url.search || ''),
        headers,
      };

      const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed = data;
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch (e) {
            // keep raw
          }
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        });
      });

      req.on('error', (err) => reject(err));
      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function main() {
  try {
    let token = ADMIN_TOKEN;
    if (!token) {
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error('Provide ADMIN_TOKEN or ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
        process.exit(1);
      }

      const loginUrl = `${API_BASE.replace(/\/$/, '')}/api/users/login`;
      console.log('Logging in as admin to', loginUrl);
      const loginRes = await doRequest(loginUrl, 'POST', { 'Content-Type': 'application/json' }, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      if (loginRes.status !== 200 && loginRes.status !== 201) {
        console.error('Login failed:', loginRes.status, loginRes.body);
        process.exit(1);
      }

      token = loginRes.body?.token || loginRes.body?.session || loginRes.body?.data?.token;
      if (!token) {
        // try Set-Cookie header for session token
        const setCookie = loginRes.headers && loginRes.headers['set-cookie'];
        if (setCookie && Array.isArray(setCookie) && setCookie.length > 0) {
          // pass cookies through as-is
          token = null;
          // we will send cookies instead of Bearer token
          console.log('Login returned cookies; will use cookie-based auth.');
        } else {
          console.error('No token returned from login response:', loginRes.body);
          process.exit(1);
        }
      }
    }

    const resetUrl = `${API_BASE.replace(/\/$/, '')}/api/admin/reset-metrics`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log('Calling reset endpoint:', resetUrl);
    const res = await doRequest(resetUrl, 'POST', headers, null);
    if (res.status === 200 || res.status === 201) {
      console.log('Reset successful:', res.body);
      process.exit(0);
    }

    console.error('Reset failed:', res.status, res.body);
    process.exit(1);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main();
