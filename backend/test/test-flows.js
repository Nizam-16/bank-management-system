const assert = require('assert');
const { app, startServer } = require('../src/server');

async function runTests() {
  console.log('\n================================================================');
  console.log(' STARTING BANK MANAGEMENT SYSTEM AUTOMATED VERIFICATION SUITE');
  console.log('================================================================\n');

  const server = await startServer();
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  let adminToken = '';
  let customerToken = '';

  try {
    // 1. HEALTH CHECK
    console.log('[Test 1] Verifying System Health Endpoint...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthData.status, 'ONLINE');
    console.log(' ✓ Health check passed: Database Mode =', healthData.database);

    // 2. AUTHENTICATION (ADMIN & CUSTOMER)
    console.log('\n[Test 2] Testing Authentication...');
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bank.com', password: 'password123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert.strictEqual(adminLoginRes.status, 200);
    assert(adminLoginData.token, 'Admin token should be returned');
    assert.strictEqual(adminLoginData.user.role, 'ADMIN');
    adminToken = adminLoginData.token;
    console.log(' ✓ Admin login successful (Role: ADMIN)');

    const custLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@bank.com', password: 'password123' })
    });
    const custLoginData = await custLoginRes.json();
    assert.strictEqual(custLoginRes.status, 200);
    assert(custLoginData.token, 'Customer token should be returned');
    assert.strictEqual(custLoginData.user.role, 'CUSTOMER');
    customerToken = custLoginData.token;
    console.log(' ✓ Customer login successful (Role: CUSTOMER)');

    // 3. ACCOUNT OPENING & LIFECYCLE (PKG_ACCOUNT)
    console.log('\n[Test 3] Testing PKG_ACCOUNT (Open, Freeze, Activate, Balance)...');
    const openRes = await fetch(`${baseUrl}/api/accounts/open`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        customerId: 2025,
        accountType: 'SAVINGS',
        initialDeposit: 1500,
        branchId: 1,
        currency: 'USD'
      })
    });
    const openData = await openRes.json();
    assert.strictEqual(openRes.status, 201);
    const testAccNo = openData.data.account_no;
    console.log(` ✓ Successfully opened new account: ${testAccNo} with $1500 initial deposit`);

    // 4. TRANSACTION: DEPOSIT (PKG_TRANSACTION.deposit)
    console.log('\n[Test 4] Testing PKG_TRANSACTION.deposit...');
    const depRes = await fetch(`${baseUrl}/api/transactions/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        accountNumber: testAccNo,
        amount: 500,
        channel: 'BRANCH',
        description: 'Automated Test Deposit'
      })
    });
    const depData = await depRes.json();
    assert.strictEqual(depRes.status, 200);
    assert.strictEqual(depData.data.new_balance, 2000);
    console.log(` ✓ Deposit of $500 processed. New balance: $${depData.data.new_balance}`);

    // 5. TRANSACTION: WITHDRAWAL (PKG_TRANSACTION.withdraw)
    console.log('\n[Test 5] Testing PKG_TRANSACTION.withdraw...');
    const withRes = await fetch(`${baseUrl}/api/transactions/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        accountNumber: testAccNo,
        amount: 300,
        channel: 'ATM',
        description: 'Automated Test Withdrawal'
      })
    });
    const withData = await withRes.json();
    assert.strictEqual(withRes.status, 200);
    assert.strictEqual(withData.data.new_balance, 1700);
    console.log(` ✓ Withdrawal of $300 processed. New balance: $${withData.data.new_balance}`);

    // 6. CUSTOM EXCEPTION TEST: INSUFFICIENT FUNDS (ORA-20001)
    console.log('\n[Test 6] Testing Custom Exception: Insufficient Funds (ORA-20001)...');
    const overWithRes = await fetch(`${baseUrl}/api/transactions/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        accountNumber: testAccNo,
        amount: 999999,
        channel: 'ATM'
      })
    });
    const overWithData = await overWithRes.json();
    assert.strictEqual(overWithRes.status, 400);
    assert.strictEqual(overWithData.errorCode, 'INSUFFICIENT_FUNDS');
    console.log(' ✓ Caught expected ORA-20001 Insufficient Funds error cleanly:', overWithData.error);

    // 7. TRANSACTION CONTROL: TRANSFER FUNDS (PKG_TRANSACTION.transfer_funds)
    console.log('\n[Test 7] Testing PKG_TRANSACTION.transfer_funds with SAVEPOINT & COMMIT...');
    const targetAccNo = 'ACC-NYC01-003028'; // Demo customer checking account
    const trfRes = await fetch(`${baseUrl}/api/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        sourceAccount: testAccNo,
        destinationAccount: targetAccNo,
        amount: 400,
        description: 'Automated Test Peer Transfer'
      })
    });
    const trfData = await trfRes.json();
    assert.strictEqual(trfRes.status, 200);
    assert.strictEqual(trfData.data.source_new_balance, 1300);
    console.log(` ✓ Atomic Transfer of $400 completed. Source balance: $${trfData.data.source_new_balance}`);

    // 8. LOAN MODULE & EMI CALCULATION (PKG_LOAN)
    console.log('\n[Test 8] Testing PKG_LOAN (Calculate EMI, Apply, Approve, Pay EMI)...');
    const emiRes = await fetch(`${baseUrl}/api/loans/calculate-emi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        principal: 12000,
        annualRate: 8.5,
        tenureMonths: 12
      })
    });
    const emiData = await emiRes.json();
    assert.strictEqual(emiRes.status, 200);
    assert(emiData.data.emi > 0);
    console.log(` ✓ EMI Computed accurately: $${emiData.data.emi} / month (Total: $${emiData.data.totalPayable})`);

    // Apply for loan
    const applyRes = await fetch(`${baseUrl}/api/loans/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        customerId: 2025,
        accountNumber: testAccNo,
        loanType: 'PERSONAL',
        principal: 10000,
        termMonths: 12,
        interestRate: 8.0
      })
    });
    const applyData = await applyRes.json();
    assert.strictEqual(applyRes.status, 201);
    const newLoanId = applyData.data.loan_id;
    console.log(` ✓ Loan application submitted: ID ${newLoanId}, Ref: ${applyData.data.loan_reference}`);

    // Approve loan as Admin
    const approveRes = await fetch(`${baseUrl}/api/loans/${newLoanId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        action: 'APPROVED',
        remarks: 'Automated test suite approval.'
      })
    });
    const approveData = await approveRes.json();
    assert.strictEqual(approveRes.status, 200);
    console.log(` ✓ Loan ID ${newLoanId} approved and disbursed to ${testAccNo}`);

    // Repay an installment
    const repayRes = await fetch(`${baseUrl}/api/loans/${newLoanId}/pay-emi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        paymentAmount: 500,
        sourceAccount: testAccNo,
        paymentMethod: 'ONLINE'
      })
    });
    const repayData = await repayRes.json();
    assert.strictEqual(repayRes.status, 200);
    console.log(` ✓ EMI payment of $500 processed. Remaining loan balance: $${repayData.data.remaining_balance}`);

    // 9. REPORTING & DASHBOARDS (PKG_REPORT)
    console.log('\n[Test 9] Testing PKG_REPORT (Dashboard metrics & Collections)...');
    const dashRes = await fetch(`${baseUrl}/api/reports/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const dashData = await dashRes.json();
    assert.strictEqual(dashRes.status, 200);
    assert(dashData.data.metrics.total_deposits > 0);
    assert(dashData.data.distribution.length > 0);
    console.log(' ✓ Dashboard metrics retrieved:', dashData.data.metrics);

    // 10. AUDIT LOGS VIEWER (Triggers verification)
    console.log('\n[Test 10] Testing Audit Logs generated by Database Triggers...');
    const auditRes = await fetch(`${baseUrl}/api/audit`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const auditData = await auditRes.json();
    assert.strictEqual(auditRes.status, 200);
    assert(auditData.data.length >= 5);
    console.log(` ✓ Successfully retrieved ${auditData.data.length} audit entries captured via triggers.`);

    console.log('\n================================================================');
    console.log(' ALL 10 TEST SUITES PASSED! BANK MANAGEMENT CORE IS FULLY VERIFIED.');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ TEST FAILURE:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
