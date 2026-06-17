# FedaPay Dashboard Total Amount - Diagnostic Guide

## Problem
Le tableau de bord affiche "0 FCFA" pour "Montant total" (somme des montants approuvés)

## Root Causes Investigated

### 1. Empty Local Database
- **Local dev server**: Uses sql.js (in-memory database with NO persistence)
- **Production server**: Uses PostgreSQL on Render
- **Solution**: Use production server or create test data for local testing

### 2. Webhook Processing Issues
- Webhook may not be receiving events from FedaPay
- Webhook signature validation may be failing
- Event structure may not match expectations

### 3. SQL Filter Logic
The `/api/fedapay/summary` endpoint now correctly filters transactions:
```sql
WHERE email IS NOT NULL 
  AND trim(email) != '' 
  AND amount > 0 
  AND lower(trim(status)) NOT IN ('failed', 'cancelled', 'pending', 'declined', 'unknown', 'void', 'refused')
```

Transactions with `pending` status are excluded (they haven't been confirmed yet).

## New Diagnostic Endpoints

### 1. Check Transaction Database Status
**Endpoint**: `GET /api/fedapay/diagnostic` (requires admin authentication)

**Response includes:**
- Total transaction count in database
- Breakdown by status (how many in each status)
- What the approved total SHOULD be (based on current filter)
- Recent 10 transactions

**How to use:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://ecoletrack-5481.onrender.com/api/fedapay/diagnostic
```

**What to look for:**
- If `totalTransactions: 0` → No transactions in database at all
- If transactions exist but all are `pending` → Webhooks haven't confirmed them
- If transactions exist with other statuses → Check why they're not being counted

### 2. Get Transaction List (with logging)
**Endpoint**: `GET /api/fedapay/transactions` (requires admin authentication)

**Response includes:**
- All transactions with fedapayTransactionId, reference, email, amount, status, createdAt
- Console logs show count and first 5 transactions

### 3. Check Current Summary (with debugging)
**Endpoint**: `GET /api/fedapay/summary` (no auth required, used by dashboard)

**Response**: `{ "investorCount": N, "totalAmount": M }`

**Console logs show:**
- Status breakdown (how many transactions in each status)
- Final computed totals

### 4. Create Test Transaction (development only)
**Endpoint**: `POST /api/fedapay/test-transaction` (requires admin auth, production blocked)

**Request body:**
```json
{
  "transactionId": "TEST_CUSTOM_ID",
  "reference": "TEST_REF_123",
  "email": "test@example.com",
  "amount": 50000,
  "status": "completed",
  "projectId": "project_id"
}
```

**Response includes:**
- Confirmation of created transaction
- New summary totals

**Use case**: Verify that SQL logic works correctly with known test data

## Diagnostic Steps

### Step 1: Check Database Status
1. Go to admin dashboard on production: https://ecoletrack-5481.onrender.com
2. Make a GET request to `/api/fedapay/diagnostic` with admin token
3. Check the response for:
   - Are there any transactions at all?
   - What statuses do they have?
   - Do the approved totals match what you expect?

### Step 2: Check Application Logs
1. Go to Render dashboard
2. Navigate to your app logs
3. Filter for `[FEDAPAY]` messages
4. Look for:
   - Webhook events being received: `[FEDAPAY WEBHOOK] Received event from FedaPay`
   - Event processing: `[FEDAPAY] Processing approved payment:`
   - Any errors in webhook processing

### Step 3: Verify Webhook Configuration
1. Check if `FEDAPAY_WEBHOOK_SECRET` environment variable is set on Render
2. Verify the webhook URL registered with FedaPay is correct:
   - Should be: `https://ecoletrack-5481.onrender.com/api/fedapay/webhook`
3. Check if webhook events are being sent by FedaPay (check FedaPay sandbox dashboard)

### Step 4: Test Locally (if needed)
1. Create a test transaction using the test endpoint:
```bash
curl -X POST http://localhost:4000/api/fedapay/test-transaction \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "amount": 25000,
    "status": "completed"
  }'
```

2. Verify the summary updates:
```bash
curl http://localhost:4000/api/fedapay/summary
```

## Expected Behavior

### Correct Scenario
1. FedaPay transaction is made
2. FedaPay sends webhook event with `event.name = 'transaction.approved'`
3. Server receives webhook and creates/updates transaction with `status = 'completed'`
4. `/api/fedapay/summary` query includes this transaction
5. Dashboard displays non-zero "Montant total"

### Current Issue
One of the steps above is failing:
- Transactions not being created at all
- Transactions created but status is wrong
- Webhook events not reaching the server
- Webhook events are received but not processed correctly

## Console Logs to Watch For

**Successful webhook processing:**
```
[FEDAPAY WEBHOOK] Received event from FedaPay
[FEDAPAY] Event name: transaction.approved
[FEDAPAY] Processing approved payment: TX_ID, AMOUNT, EMAIL
[FEDAPAY] Transaction details: {...}
[FEDAPAY] Transaction record created: TX_ID
[FEDAPAY] Transaction status updated: {...}
[FEDAPAY] Confirmed investment added: {...}
```

**Webhook rejection:**
```
[FEDAPAY WEBHOOK] Webhook rejected: invalid or missing signature header
```

**Ignored event:**
```
[FEDAPAY] Ignoring event (not an approval): event.name
```

## Quick Checklist

- [ ] Database has transactions (check `/api/fedapay/diagnostic`)
- [ ] Transactions have non-pending status (check status breakdown)
- [ ] Webhook secret is configured on Render (check environment variables)
- [ ] Webhook events are being logged (check Render logs)
- [ ] SQL filter logic is correct (test with `test-transaction` endpoint)
- [ ] Frontend can reach and parse the API response (check browser console)

## If Total is Still 0 FCFA After These Steps

Most likely cause: **Webhook events are not reaching your server at all**

1. Check with FedaPay support that webhooks are configured correctly
2. Verify webhook URL in FedaPay dashboard points to your app
3. Make a test payment and watch for webhook logs in real-time
4. If no logs appear, webhook is not being sent

## Code Changes Made

- Enhanced `/api/fedapay/summary` with status breakdown logging
- Enhanced `/api/fedapay/transactions` with logging
- Enhanced webhook handler with detailed step-by-step logging
- Added `/api/fedapay/diagnostic` endpoint
- Added `/api/fedapay/test-transaction` endpoint
- Fixed missing `await` on `createTransactionRecord()` in webhook
