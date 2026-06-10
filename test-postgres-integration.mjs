#!/usr/bin/env node
import axios from 'axios';

const API = 'http://localhost:4000';

async function test() {
  try {
    console.log('Testing PostgreSQL integration...\n');

    // Test 1: Health check
    console.log('1. Health check...');
    const health = await axios.get(`${API}/`);
    console.log(`   ✓ Health: ${health.status} ${health.statusText}`);

    // Test 2: Login with default admin
    console.log('\n2. Admin login...');
    const login = await axios.post(`${API}/api/users/login`, {
      email: 'admin@admin.com',
      password: 'Admin@123',
    });
    console.log(`   ✓ Login: ${login.status}`);
    console.log(`   Token: ${login.data.token?.substring(0, 16)}...`);
    const token = login.data.token;

    // Test 3: Get users (requires auth)
    console.log('\n3. Get users (authenticated)...');
    const users = await axios.get(`${API}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`   ✓ Users endpoint: ${users.status}`);
    console.log(`   User count: ${users.data?.users?.length || 0}`);

    // Test 4: Get tier progress
    console.log('\n4. Get tier progress...');
    const tier = await axios.get(`${API}/api/tier-progress`);
    console.log(`   ✓ Tier progress: ${tier.status}`);
    console.log(`   Tier data:`, tier.data?.tierProgress);

    console.log('\n✅ All tests passed! PostgreSQL integration is working.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(`   ${error.response?.status || 'Error'}: ${error.response?.data?.error || error.message}`);
    if (error.response?.data?.error) {
      console.error('   Details:', error.response.data);
    }
    process.exit(1);
  }
}

test();
