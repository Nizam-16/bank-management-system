const { getConnection, isMockMode, oracledb } = require('../config/db');
const mockEngine = require('./mockPlsqlEngine');

/**
 * Helper to fetch all rows from an Oracle SYS_REFCURSOR
 */
async function fetchRefCursorRows(resultSet) {
  const rows = [];
  let row;
  while ((row = await resultSet.getRow())) {
    rows.push(row);
  }
  await resultSet.close();
  return rows;
}

// ----------------------------------------------------------------------------
// ACCOUNT SERVICE (CALLS PKG_ACCOUNT)
// ----------------------------------------------------------------------------
const accountService = {
  async openAccount({ customerId, accountType, initialDeposit, branchId, currency = 'USD' }) {
    if (isMockMode()) {
      return mockEngine.pkgAccount.open_account({ customerId, accountType, initialDeposit, branchId, currency });
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_ACCOUNT.open_account(
             p_customer_id     => :p_customer_id,
             p_account_type    => :p_account_type,
             p_initial_deposit => :p_initial_deposit,
             p_branch_id       => :p_branch_id,
             p_currency        => :p_currency,
             o_account_id      => :o_account_id,
             o_account_no      => :o_account_no,
             o_status          => :o_status,
             o_message         => :o_message
           );
         END;`,
        {
          p_customer_id: Number(customerId),
          p_account_type: accountType,
          p_initial_deposit: Number(initialDeposit),
          p_branch_id: Number(branchId),
          p_currency: currency,
          o_account_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_account_no: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 30 },
          o_status:     { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 20 },
          o_message:    { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 500 }
        }
      );

      return {
        account_id: result.outBinds.o_account_id,
        account_no: result.outBinds.o_account_no,
        status: result.outBinds.o_status,
        message: result.outBinds.o_message
      };
    } finally {
      await conn.close();
    }
  },

  async freezeAccount(accountNo, reason = 'Administrative hold') {
    if (isMockMode()) {
      return mockEngine.pkgAccount.freeze_account(accountNo, reason);
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_ACCOUNT.freeze_account(
             p_account_no => :p_account_no,
             p_reason     => :p_reason,
             o_status     => :o_status,
             o_message    => :o_message
           );
         END;`,
        {
          p_account_no: accountNo,
          p_reason: reason,
          o_status:  { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 20 },
          o_message: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 500 }
        }
      );

      return {
        status: result.outBinds.o_status,
        message: result.outBinds.o_message
      };
    } finally {
      await conn.close();
    }
  },

  async activateAccount(accountNo) {
    if (isMockMode()) {
      return mockEngine.pkgAccount.activate_account(accountNo);
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_ACCOUNT.activate_account(
             p_account_no => :p_account_no,
             o_status     => :o_status,
             o_message    => :o_message
           );
         END;`,
        {
          p_account_no: accountNo,
          o_status:  { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 20 },
          o_message: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 500 }
        }
      );

      return {
        status: result.outBinds.o_status,
        message: result.outBinds.o_message
      };
    } finally {
      await conn.close();
    }
  },

  async closeAccount(accountNo, reason = 'Customer request') {
    if (isMockMode()) {
      return mockEngine.pkgAccount.close_account(accountNo, reason);
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_ACCOUNT.close_account(
             p_account_no => :p_account_no,
             p_reason     => :p_reason,
             o_status     => :o_status,
             o_message    => :o_message
           );
         END;`,
        {
          p_account_no: accountNo,
          p_reason: reason,
          o_status:  { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 20 },
          o_message: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 500 }
        }
      );

      return {
        status: result.outBinds.o_status,
        message: result.outBinds.o_message
      };
    } finally {
      await conn.close();
    }
  },

  async getAccountDetails(accountNo) {
    if (isMockMode()) {
      return mockEngine.pkgAccount.get_account_details(accountNo);
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_ACCOUNT.get_account_details(
             p_account_no => :p_account_no,
             o_cursor     => :o_cursor
           );
         END;`,
        {
          p_account_no: accountNo,
          o_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
        }
      );

      const rows = await fetchRefCursorRows(result.outBinds.o_cursor);
      if (rows.length === 0) {
        throw new Error(`Account ${accountNo} not found.`);
      }
      return rows[0];
    } finally {
      await conn.close();
    }
  },

  async listCustomerAccounts(customerId) {
    if (isMockMode()) {
      return mockEngine.pkgAccount.list_customer_accounts(customerId);
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_ACCOUNT.list_customer_accounts(
             p_customer_id => :p_customer_id,
             o_cursor      => :o_cursor
           );
         END;`,
        {
          p_customer_id: Number(customerId),
          o_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
        }
      );

      return await fetchRefCursorRows(result.outBinds.o_cursor);
    } finally {
      await conn.close();
    }
  },

  async listAllAccounts(status = null) {
    if (isMockMode()) {
      return mockEngine.pkgAccount.list_all_accounts(status);
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_ACCOUNT.list_all_accounts(
             p_status => :p_status,
             o_cursor => :o_cursor
           );
         END;`,
        {
          p_status: status || null,
          o_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
        }
      );

      return await fetchRefCursorRows(result.outBinds.o_cursor);
    } finally {
      await conn.close();
    }
  }
};

// ----------------------------------------------------------------------------
// TRANSACTION SERVICE (CALLS PKG_TRANSACTION)
// ----------------------------------------------------------------------------
const transactionService = {
  async deposit({ accountNo, amount, channel = 'BRANCH', description = 'Deposit', user = 'SYSTEM' }) {
    if (isMockMode()) {
      return mockEngine.pkgTransaction.deposit({ accountNo, amount, channel, description, user });
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_TRANSACTION.deposit(
             p_account_no  => :p_account_no,
             p_amount      => :p_amount,
             p_channel     => :p_channel,
             p_description => :p_description,
             o_txn_id      => :o_txn_id,
             o_ref_number  => :o_ref_number,
             o_new_balance => :o_new_balance,
             o_message     => :o_message
           );
         END;`,
        {
          p_account_no: accountNo,
          p_amount: Number(amount),
          p_channel: channel,
          p_description: description,
          o_txn_id:      { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_ref_number:  { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 50 },
          o_new_balance: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_message:     { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 500 }
        }
      );

      return {
        transaction_id: result.outBinds.o_txn_id,
        reference_number: result.outBinds.o_ref_number,
        new_balance: result.outBinds.o_new_balance,
        message: result.outBinds.o_message
      };
    } finally {
      await conn.close();
    }
  },

  async withdraw({ accountNo, amount, channel = 'ATM', description = 'Withdrawal', user = 'SYSTEM' }) {
    if (isMockMode()) {
      return mockEngine.pkgTransaction.withdraw({ accountNo, amount, channel, description, user });
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_TRANSACTION.withdraw(
             p_account_no  => :p_account_no,
             p_amount      => :p_amount,
             p_channel     => :p_channel,
             p_description => :p_description,
             o_txn_id      => :o_txn_id,
             o_ref_number  => :o_ref_number,
             o_new_balance => :o_new_balance,
             o_message     => :o_message
           );
         END;`,
        {
          p_account_no: accountNo,
          p_amount: Number(amount),
          p_channel: channel,
          p_description: description,
          o_txn_id:      { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_ref_number:  { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 50 },
          o_new_balance: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_message:     { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 500 }
        }
      );

      return {
        transaction_id: result.outBinds.o_txn_id,
        reference_number: result.outBinds.o_ref_number,
        new_balance: result.outBinds.o_new_balance,
        message: result.outBinds.o_message
      };
    } finally {
      await conn.close();
    }
  },

  async transferFunds({ sourceAcc, destAcc, amount, description = 'Fund Transfer', channel = 'ONLINE', user = 'SYSTEM' }) {
    if (isMockMode()) {
      return mockEngine.pkgTransaction.transfer_funds({ sourceAcc, destAcc, amount, description, channel, user });
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_TRANSACTION.transfer_funds(
             p_source_acc      => :p_source_acc,
             p_dest_acc        => :p_dest_acc,
             p_amount          => :p_amount,
             p_description     => :p_description,
             p_channel         => :p_channel,
             o_txn_id          => :o_txn_id,
             o_ref_number      => :o_ref_number,
             o_src_new_balance => :o_src_new_balance,
             o_message         => :o_message
           );
         END;`,
        {
          p_source_acc: sourceAcc,
          p_dest_acc: destAcc,
          p_amount: Number(amount),
          p_description: description,
          p_channel: channel,
          o_txn_id:          { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_ref_number:      { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 50 },
          o_src_new_balance: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_message:         { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 500 }
        }
      );

      return {
        transaction_id: result.outBinds.o_txn_id,
        reference_number: result.outBinds.o_ref_number,
        source_new_balance: result.outBinds.o_src_new_balance,
        message: result.outBinds.o_message
      };
    } finally {
      await conn.close();
    }
  },

  async getTransactionHistory(filters = {}) {
    if (isMockMode()) {
      return mockEngine.pkgTransaction.get_transaction_history(filters);
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_TRANSACTION.get_transaction_history(
             p_account_no => :p_account_no,
             p_type       => :p_type,
             p_channel    => :p_channel,
             p_start_date => :p_start_date,
             p_end_date   => :p_end_date,
             p_limit      => :p_limit,
             o_cursor     => :o_cursor
           );
         END;`,
        {
          p_account_no: filters.accountNo || null,
          p_type: filters.type || null,
          p_channel: filters.channel || null,
          p_start_date: filters.startDate ? new Date(filters.startDate) : null,
          p_end_date: filters.endDate ? new Date(filters.endDate) : null,
          p_limit: filters.limit ? Number(filters.limit) : 50,
          o_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
        }
      );

      return await fetchRefCursorRows(result.outBinds.o_cursor);
    } finally {
      await conn.close();
    }
  }
};

// ----------------------------------------------------------------------------
// LOAN SERVICE (CALLS PKG_LOAN)
// ----------------------------------------------------------------------------
const loanService = {
  calculateEmi(principal, annualRate, tenureMonths) {
    if (isMockMode()) {
      return mockEngine.pkgLoan.calculate_emi(principal, annualRate, tenureMonths);
    }
    // Formula matches PKG_LOAN.calculate_emi
    return mockEngine.pkgLoan.calculate_emi(principal, annualRate, tenureMonths);
  },

  async applyLoan({ customerId, accountNo, loanType, principal, termMonths, interestRate }) {
    if (isMockMode()) {
      return mockEngine.pkgLoan.apply_loan({ customerId, accountNo, loanType, principal, termMonths, interestRate });
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_LOAN.apply_loan(
             p_customer_id   => :p_customer_id,
             p_account_no    => :p_account_no,
             p_loan_type     => :p_loan_type,
             p_principal     => :p_principal,
             p_term_months   => :p_term_months,
             p_interest_rate => :p_interest_rate,
             o_loan_id       => :o_loan_id,
             o_loan_ref      => :o_loan_ref,
             o_emi           => :o_emi,
             o_total_payable => :o_total_payable,
             o_message       => :o_message
           );
         END;`,
        {
          p_customer_id: Number(customerId),
          p_account_no: accountNo,
          p_loan_type: loanType,
          p_principal: Number(principal),
          p_term_months: Number(termMonths),
          p_interest_rate: Number(interestRate),
          o_loan_id:       { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_loan_ref:      { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 30 },
          o_emi:           { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_total_payable: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_message:       { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 500 }
        }
      );

      return {
        loan_id: result.outBinds.o_loan_id,
        loan_reference: result.outBinds.o_loan_ref,
        emi_amount: result.outBinds.o_emi,
        total_payable: result.outBinds.o_total_payable,
        message: result.outBinds.o_message
      };
    } finally {
      await conn.close();
    }
  },

  async approveLoan({ loanId, employeeId, action, remarks }) {
    if (isMockMode()) {
      return mockEngine.pkgLoan.approve_loan({ loanId, employeeId, action, remarks });
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_LOAN.approve_loan(
             p_loan_id     => :p_loan_id,
             p_employee_id => :p_employee_id,
             p_action      => :p_action,
             p_remarks     => :p_remarks,
             o_status      => :o_status,
             o_message     => :o_message
           );
         END;`,
        {
          p_loan_id: Number(loanId),
          p_employee_id: Number(employeeId),
          p_action: action,
          p_remarks: remarks || '',
          o_status:  { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 20 },
          o_message: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 500 }
        }
      );

      return {
        status: result.outBinds.o_status,
        message: result.outBinds.o_message
      };
    } finally {
      await conn.close();
    }
  },

  async payEmi({ loanId, paymentAmount, sourceAcc, paymentMethod = 'ONLINE', user = 'USER' }) {
    if (isMockMode()) {
      return mockEngine.pkgLoan.pay_emi({ loanId, paymentAmount, sourceAcc, paymentMethod, user });
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_LOAN.pay_emi(
             p_loan_id           => :p_loan_id,
             p_payment_amount    => :p_payment_amount,
             p_source_acc        => :p_source_acc,
             p_payment_method    => :p_payment_method,
             o_payment_id        => :o_payment_id,
             o_remaining_balance => :o_remaining_balance,
             o_message           => :o_message
           );
         END;`,
        {
          p_loan_id: Number(loanId),
          p_payment_amount: Number(paymentAmount),
          p_source_acc: sourceAcc,
          p_payment_method: paymentMethod,
          o_payment_id:        { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_remaining_balance: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_message:           { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 500 }
        }
      );

      return {
        payment_id: result.outBinds.o_payment_id,
        remaining_balance: result.outBinds.o_remaining_balance,
        message: result.outBinds.o_message
      };
    } finally {
      await conn.close();
    }
  },

  async getRepaymentSchedule(loanId) {
    if (isMockMode()) {
      return mockEngine.pkgLoan.get_repayment_schedule(loanId);
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_LOAN.get_repayment_schedule(
             p_loan_id => :p_loan_id,
             o_cursor  => :o_cursor
           );
         END;`,
        {
          p_loan_id: Number(loanId),
          o_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
        }
      );

      return await fetchRefCursorRows(result.outBinds.o_cursor);
    } finally {
      await conn.close();
    }
  },

  async listLoans(status = null, customerId = null) {
    if (isMockMode()) {
      return mockEngine.pkgLoan.list_loans(status, customerId);
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_LOAN.list_loans(
             p_status      => :p_status,
             p_customer_id => :p_customer_id,
             o_cursor      => :o_cursor
           );
         END;`,
        {
          p_status: status || null,
          p_customer_id: customerId ? Number(customerId) : null,
          o_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
        }
      );

      return await fetchRefCursorRows(result.outBinds.o_cursor);
    } finally {
      await conn.close();
    }
  }
};

// ----------------------------------------------------------------------------
// REPORT SERVICE (CALLS PKG_REPORT)
// ----------------------------------------------------------------------------
const reportService = {
  async getDashboardMetrics() {
    if (isMockMode()) {
      return mockEngine.pkgReport.get_dashboard_metrics();
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_REPORT.get_dashboard_metrics(
             o_total_customers    => :o_total_customers,
             o_total_deposits     => :o_total_deposits,
             o_active_loans       => :o_active_loans,
             o_today_transactions => :o_today_transactions,
             o_total_accounts     => :o_total_accounts
           );
         END;`,
        {
          o_total_customers:    { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_total_deposits:     { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_active_loans:       { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_today_transactions: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          o_total_accounts:     { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        }
      );

      return {
        total_customers: result.outBinds.o_total_customers,
        total_deposits: result.outBinds.o_total_deposits,
        active_loans: result.outBinds.o_active_loans,
        today_transactions: result.outBinds.o_today_transactions,
        total_accounts: result.outBinds.o_total_accounts
      };
    } finally {
      await conn.close();
    }
  },

  async getMonthlyStatement(accountNo, year, month) {
    if (isMockMode()) {
      return mockEngine.pkgReport.get_monthly_statement(accountNo, year, month);
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_REPORT.get_monthly_statement(
             p_account_no     => :p_account_no,
             p_year           => :p_year,
             p_month          => :p_month,
             o_account_cursor => :o_account_cursor,
             o_txns_cursor    => :o_txns_cursor
           );
         END;`,
        {
          p_account_no: accountNo,
          p_year: Number(year),
          p_month: Number(month),
          o_account_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
          o_txns_cursor:    { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
        }
      );

      const accounts = await fetchRefCursorRows(result.outBinds.o_account_cursor);
      const txns = await fetchRefCursorRows(result.outBinds.o_txns_cursor);

      return {
        account: accounts[0] || null,
        transactions: txns
      };
    } finally {
      await conn.close();
    }
  },

  async getBranchPerformance() {
    if (isMockMode()) {
      return mockEngine.pkgReport.get_branch_performance();
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_REPORT.get_branch_performance(o_cursor => :o_cursor);
         END;`,
        { o_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT } }
      );

      return await fetchRefCursorRows(result.outBinds.o_cursor);
    } finally {
      await conn.close();
    }
  },

  async getLoanDefaulters() {
    if (isMockMode()) {
      return mockEngine.pkgReport.get_loan_defaulters();
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_REPORT.get_loan_defaulters(o_cursor => :o_cursor);
         END;`,
        { o_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT } }
      );

      return await fetchRefCursorRows(result.outBinds.o_cursor);
    } finally {
      await conn.close();
    }
  },

  async getAccountDistribution() {
    if (isMockMode()) {
      return mockEngine.pkgReport.get_account_distribution();
    }

    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `BEGIN
           PKG_REPORT.get_account_distribution(o_cursor => :o_cursor);
         END;`,
        { o_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT } }
      );

      return await fetchRefCursorRows(result.outBinds.o_cursor);
    } finally {
      await conn.close();
    }
  }
};

module.exports = {
  accountService,
  transactionService,
  loanService,
  reportService,
  mockEngine
};
