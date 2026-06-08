#!/usr/bin/env node

const API_URL = 'http://localhost:4000';

async function testFullRegisterFlow() {
  console.log('🧪 Testing full registration flow...\n');

  try {
    const testEmail = `testfull${Date.now()}@example.com`;
    console.log(`📧 Email: ${testEmail}\n`);
    
    // Step 1: Register
    console.log('Step 1: Register...');
    const registerResponse = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Full',
        email: testEmail,
        dob: '1990-01-01',
        profession: 'Developer',
        gender: 'M',
        password: 'test123456',
      }),
    });

    console.log(`   Status: ${registerResponse.status}`);
    const registerData = await registerResponse.json();
    
    if (!registerResponse.ok) {
      console.error('❌ Registration failed!');
      console.log(registerData);
      return;
    }
    console.log('✅ Registration succeeded\n');

    // Step 2: Auto-login
    console.log('Step 2: Auto-login...');
    const loginResponse = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'test123456',
      }),
    });

    console.log(`   Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed!');
      console.log(loginData);
      return;
    }
    console.log('✅ Login succeeded\n');
    console.log(`   Token: ${loginData.token.substring(0, 8)}...`);
    console.log(`   User: ${loginData.user.email}`);
    console.log(`   Role: ${loginData.user.role}\n`);

    // Step 3: Log activity (like handleRegisterSubmit does)
    console.log('Step 3: Log activity...');
    const activityResponse = await fetch(`${API_URL}/api/activity`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({
        email: testEmail,
        action: 'Inscription utilisateur publique',
      }),
    });

    console.log(`   Status: ${activityResponse.status}`);
    const activityData = await activityResponse.json();
    
    if (!activityResponse.ok) {
      console.error('❌ Activity log failed!');
      console.log(activityData);
      return;
    }
    console.log('✅ Activity logged\n');

    console.log('🎉 Full flow succeeded!');
  } catch (error) {
    console.error('💥 Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFullRegisterFlow();
