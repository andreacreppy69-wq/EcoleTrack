#!/usr/bin/env node

const API_URL = 'http://localhost:4000';

async function testMustChangePasswordFlow() {
  console.log('🔐 Testing mustChangePassword flow...\n');

  try {
    const testEmail = `testmcp${Date.now()}@example.com`;
    console.log(`📧 Email: ${testEmail}\n`);

    // Step 1: Register (should set mustChangePassword = 1)
    console.log('Step 1: Register user (mustChangePassword should be 1)...');
    const regResp = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'MCP',
        email: testEmail,
        dob: '1990-01-01',
        profession: 'Developer',
        gender: 'M',
        password: 'test123456',
        phoneNumber: '91551295',
      }),
    });
    console.log(`   Status: ${regResp.status}`);
    const regBody = await regResp.json();
    if (!regResp.ok) {
      console.error('❌ Registration failed!');
      console.log(regBody);
      return;
    }
    console.log('✅ Registration succeeded\n');

    // Step 2: Login (should return mustChangePassword = true)
    console.log('Step 2: Login (should return mustChangePassword = true)...');
    const loginResp = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'test123456',
      }),
    });
    console.log(`   Status: ${loginResp.status}`);
    const loginBody = await loginResp.json();
    
    if (!loginResp.ok) {
      console.error('❌ Login failed!');
      console.log(loginBody);
      return;
    }
    
    console.log('✅ Login succeeded');
    console.log(`   User: ${loginBody.user.email}`);
    console.log(`   Role: ${loginBody.user.role}`);
    console.log(`   Token: ${loginBody.token.substring(0, 8)}...`);
    console.log(`   mustChangePassword: ${loginBody.mustChangePassword}\n`);

    // Assertions
    if (loginBody.mustChangePassword !== true) {
      console.error('❌ FAILED: mustChangePassword should be true but got', loginBody.mustChangePassword);
      process.exit(1);
    }

    if (!loginBody.token) {
      console.error('❌ FAILED: No token returned');
      process.exit(1);
    }

    // Step 3: Change password
    console.log('Step 3: Change password...');
    const changeResp = await fetch(`${API_URL}/api/users/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        newPassword: 'newPassword123',
      }),
    });
    console.log(`   Status: ${changeResp.status}`);
    const changeBody = await changeResp.json().catch(() => ({}));
    if (!changeResp.ok) {
      console.error('❌ Password change failed!');
      console.log(changeBody);
      return;
    }
    console.log('✅ Password changed\n');

    // Step 4: Login again with new password (should return mustChangePassword = false)
    console.log('Step 4: Login again with new password...');
    const login2Resp = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'newPassword123',
      }),
    });
    console.log(`   Status: ${login2Resp.status}`);
    const login2Body = await login2Resp.json();
    
    if (!login2Resp.ok) {
      console.error('❌ Login with new password failed!');
      console.log(login2Body);
      return;
    }
    
    console.log('✅ Login with new password succeeded');
    console.log(`   mustChangePassword: ${login2Body.mustChangePassword}\n`);

    if (login2Body.mustChangePassword !== false) {
      console.error('❌ FAILED: mustChangePassword should be false after password change but got', login2Body.mustChangePassword);
      process.exit(1);
    }

    console.log('🎉 All mustChangePassword checks passed!');
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

testMustChangePasswordFlow();
