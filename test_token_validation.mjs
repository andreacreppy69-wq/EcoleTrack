#!/usr/bin/env node

const API_URL = 'http://localhost:4000';

async function testTokenValidation() {
  console.log('🧪 Testing token validation endpoint...\n');

  try {
    // Step 1: Register a new user  
    console.log('1️⃣  Registering new test user...');
    const testEmail = `tokentest${Date.now()}@example.com`;
    const registerRes = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Token',
        lastName: 'Tester',
        email: testEmail,
        dob: '2000-01-01',
        profession: 'Tester',
        gender: 'M',
        password: 'testpass123',
      }),
    });

    if (!registerRes.ok) {
      console.error(`❌ Registration failed: ${registerRes.status}`);
      const error = await registerRes.json();
      console.log(error);
      return;
    }

    const registerData = await registerRes.json();
    console.log(`✅ User registered\n`);

    // Step 2: Login to get a token
    console.log('2️⃣  Logging in...');
    const loginRes = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpass123',
      }),
    });

    if (!loginRes.ok) {
      console.error(`❌ Login failed: ${loginRes.status}`);
      const error = await loginRes.json();
      console.log(error);
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log(`✅ Token received: ${token.substring(0, 8)}...\n`);

    // Step 3: Test with invalid token
    console.log('3️⃣  Testing with invalid token...');
    const invalidRes = await fetch(`${API_URL}/api/validate-token`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalid-token-12345' },
    });

    if (invalidRes.status === 401) {
      const invalidData = await invalidRes.json();
      console.log(`✅ Correctly rejected: ${invalidData.error}\n`);
    } else {
      console.error(`❌ Expected 401, got ${invalidRes.status}\n`);
      return;
    }

    // Step 4: Test with valid token
    console.log('4️⃣  Testing with valid token...');
    const validRes = await fetch(`${API_URL}/api/validate-token`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (validRes.ok) {
      const validData = await validRes.json();
      console.log(`✅ Token validated successfully`);
      console.log(`   Email: ${validData.email}`);
      console.log(`   Role: ${validData.role}\n`);
    } else {
      console.error(`❌ Validation failed: ${validRes.status}`);
      const errorData = await validRes.json();
      console.log(`   Error: ${errorData.error}\n`);
      return;
    }

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testTokenValidation();
