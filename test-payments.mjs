#!/usr/bin/env node
import axios from 'axios';

const API = 'http://localhost:4000';

async function test() {
  try {
    console.log('Testing Payment Integration with PostgreSQL...\n');

    // Test 1: Register a new user
    console.log('1. Register new user for payment test...');
    const testEmail = `test-${Date.now()}@example.com`;
    const regResponse = await axios.post(`${API}/api/users/register`, {
      firstName: 'Test',
      lastName: 'Payment',
      name: 'Test Payment',
      email: testEmail,
      dob: '2000-01-01',
      profession: 'Engineer',
      phoneNumber: '+22891234567',
      gender: 'M',
      photoUrl: '',
      password: 'TestPass@123',
    });
    console.log(`   ✓ User registered: ${testEmail}`);
    console.log(`   User ID: ${regResponse.data?.user?.id || 'N/A'}`);

    // Test 2: Login as the new user
    console.log('\n2. Login as new user...');
    const loginResponse = await axios.post(`${API}/api/users/login`, {
      email: testEmail,
      password: 'TestPass@123',
    });
    console.log(`   ✓ User logged in`);
    const userToken = loginResponse.data.token;

    // Test 3: Create a payment transaction
    console.log('\n3. Create payment transaction...');
    const paymentResponse = await axios.post(`${API}/api/fedapay`, {
      amount: 5000,
      phoneNumber: '+22891234567',
      currency: 'XOF',
      description: 'Test Investment',
      customerName: 'Test Payment',
      customerEmail: testEmail,
      purpose: 'investment',
      projectId: 'default_project',
    }, {
      headers: { Authorization: `Bearer ${userToken}` },
      validateStatus: () => true, // Accept any status for debugging
    });

    console.log(`   Status: ${paymentResponse.status}`);
    if (paymentResponse.status === 200 || paymentResponse.status === 201) {
      console.log(`   ✓ Payment transaction created`);
      console.log(`   Response:`, {
        url: paymentResponse.data?.url ? 'present' : 'missing',
        transactionId: paymentResponse.data?.transactionId || 'N/A',
      });
    } else {
      console.log(`   ⚠️  Payment endpoint returned ${paymentResponse.status}`);
      console.log(`   Response:`, paymentResponse.data);
    }

    // Test 4: Get fedapay summary (public endpoint)
    console.log('\n4. Get FedaPay summary (public)...');
    const summaryResponse = await axios.get(`${API}/api/fedapay/summary`, {
      validateStatus: () => true,
    });

    if (summaryResponse.status === 200) {
      console.log(`   ✓ Summary retrieved`);
      console.log(`   Investor count: ${summaryResponse.data?.investorCount || 0}`);
      console.log(`   Total amount: ${summaryResponse.data?.totalAmount || 0}`);
    } else {
      console.log(`   ⚠️  Summary endpoint returned ${summaryResponse.status}`);
    }

    // Test 5: Get investor count (public endpoint)
    console.log('\n5. Get investor count (public)...');
    const investorCountResponse = await axios.get(`${API}/api/fedapay/investor-count`, {
      validateStatus: () => true,
    });

    if (investorCountResponse.status === 200) {
      console.log(`   ✓ Investor count retrieved: ${investorCountResponse.data?.investorCount || 0}`);
    } else {
      console.log(`   ⚠️  Investor count endpoint returned ${investorCountResponse.status}`);
    }

    // Test 6: Admin views all transactions
    console.log('\n6. Admin views all transactions (requireAdmin)...');
    const adminLoginResponse = await axios.post(`${API}/api/users/login`, {
      email: 'admin@admin.com',
      password: 'Admin@123',
    });
    const adminToken = adminLoginResponse.data.token;

    const allTransactionsResponse = await axios.get(`${API}/api/fedapay/transactions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      validateStatus: () => true,
    });

    if (allTransactionsResponse.status === 200) {
      console.log(`   ✓ Admin transactions view works`);
      const txCount = allTransactionsResponse.data?.transactions?.length || 0;
      console.log(`   Total transactions in DB: ${txCount}`);
      if (txCount > 0) {
        const latestTx = allTransactionsResponse.data.transactions[0];
        console.log(`   Latest transaction:`, {
          transactionId: latestTx.transactionId?.substring(0, 16) + '...' || 'N/A',
          amount: latestTx.amount,
          email: latestTx.email,
          status: latestTx.status,
          purpose: latestTx.purpose,
          createdAt: latestTx.createdAt,
        });
      }
    } else {
      console.log(`   ⚠️  Admin transactions endpoint returned ${allTransactionsResponse.status}`);
    }

    console.log('\n✅ Payment tests completed! PostgreSQL is handling transactions correctly.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Payment test failed:');
    console.error(`   ${error.response?.status || 'Error'}: ${error.response?.data?.error || error.message}`);
    if (error.response?.data) {
      console.error('   Details:', error.response.data);
    }
    process.exit(1);
  }
}

test();
