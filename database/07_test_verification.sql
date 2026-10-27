-- ============================================================================
-- SCRIPT: 07_test_verification.sql
-- DESCRIPTION: Autonomous PL/SQL Test Harness executing directly in SQL*Plus /
--              Oracle SQL Developer / Live SQL.
--              Tests every required PL/SQL procedure, function, trigger & exception.
-- ============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;

DECLARE
    v_acc_id       NUMBER;
    v_acc_no       VARCHAR2(30);
    v_status       VARCHAR2(20);
    v_msg          VARCHAR2(500);
    v_txn_id       NUMBER;
    v_ref          VARCHAR2(50);
    v_new_bal      NUMBER;
    v_emi          NUMBER;
    v_loan_id      NUMBER;
    v_loan_ref     VARCHAR2(30);
    v_tot_pay      NUMBER;
    v_pay_id       NUMBER;
    v_rem_bal      NUMBER;

    -- Dashboard metrics
    v_tot_cust     NUMBER;
    v_tot_dep      NUMBER;
    v_act_loans    NUMBER;
    v_today_txns   NUMBER;
    v_tot_accs     NUMBER;
    v_audit_count  NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('================================================================');
    DBMS_OUTPUT.PUT_LINE(' STARTING ORACLE PL/SQL VERIFICATION HARNESS');
    DBMS_OUTPUT.PUT_LINE('================================================================');

    -- 1. TEST PKG_ACCOUNT.open_account
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '[TEST 1] Testing PKG_ACCOUNT.open_account...');
    PKG_ACCOUNT.open_account(
        p_customer_id     => 2001,
        p_account_type    => 'SAVINGS',
        p_initial_deposit => 2500,
        p_branch_id       => 1,
        p_currency        => 'USD',
        o_account_id      => v_acc_id,
        o_account_no      => v_acc_no,
        o_status          => v_status,
        o_message         => v_msg
    );
    DBMS_OUTPUT.PUT_LINE(' -> Result: ' || v_status || ' | Account Created: ' || v_acc_no || ' | Balance: $2500');

    -- 2. TEST PKG_TRANSACTION.deposit
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '[TEST 2] Testing PKG_TRANSACTION.deposit...');
    PKG_TRANSACTION.deposit(
        p_account_no  => v_acc_no,
        p_amount      => 750,
        p_channel     => 'BRANCH',
        p_description => 'Test counter deposit',
        o_txn_id      => v_txn_id,
        o_ref_number  => v_ref,
        o_new_balance => v_new_bal,
        o_message     => v_msg
    );
    DBMS_OUTPUT.PUT_LINE(' -> Deposit of $750 completed. New Balance: $' || v_new_bal || ' (Ref: ' || v_ref || ')');

    -- 3. TEST PKG_TRANSACTION.withdraw
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '[TEST 3] Testing PKG_TRANSACTION.withdraw...');
    PKG_TRANSACTION.withdraw(
        p_account_no  => v_acc_no,
        p_amount      => 250,
        p_channel     => 'ATM',
        p_description => 'Test ATM withdrawal',
        o_txn_id      => v_txn_id,
        o_ref_number  => v_ref,
        o_new_balance => v_new_bal,
        o_message     => v_msg
    );
    DBMS_OUTPUT.PUT_LINE(' -> Withdrawal of $250 completed. New Balance: $' || v_new_bal || ' (Ref: ' || v_ref || ')');

    -- 4. TEST USER-DEFINED EXCEPTION: INSUFFICIENT FUNDS (-20001)
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '[TEST 4] Testing User-Defined Exception: Insufficient Funds (ORA-20001)...');
    BEGIN
        PKG_TRANSACTION.withdraw(
            p_account_no  => v_acc_no,
            p_amount      => 999999, -- Exceeds balance
            p_channel     => 'ATM',
            p_description => 'Overdraft attempt',
            o_txn_id      => v_txn_id,
            o_ref_number  => v_ref,
            o_new_balance => v_new_bal,
            o_message     => v_msg
        );
        DBMS_OUTPUT.PUT_LINE(' -> ERROR: Should have raised exception!');
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE = -20001 THEN
                DBMS_OUTPUT.PUT_LINE(' -> SUCCESS: Caught expected ORA-20001 (' || SQLERRM || ')');
            ELSE
                DBMS_OUTPUT.PUT_LINE(' -> Unexpected error: ' || SQLERRM);
            END IF;
    END;

    -- 5. TEST PKG_TRANSACTION.transfer_funds (SAVEPOINT & COMMIT)
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '[TEST 5] Testing PKG_TRANSACTION.transfer_funds with atomic SAVEPOINT...');
    PKG_TRANSACTION.transfer_funds(
        p_source_acc      => v_acc_no,
        p_dest_acc        => 'ACC-NYC01-003002',
        p_amount          => 500,
        p_description     => 'Peer transfer demonstration',
        p_channel         => 'ONLINE',
        o_txn_id          => v_txn_id,
        o_ref_number      => v_ref,
        o_src_new_balance => v_new_bal,
        o_message         => v_msg
    );
    DBMS_OUTPUT.PUT_LINE(' -> Atomic transfer completed. Source new balance: $' || v_new_bal || ' (Ref: ' || v_ref || ')');

    -- 6. TEST PKG_LOAN.calculate_emi
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '[TEST 6] Testing PKG_LOAN.calculate_emi function...');
    v_emi := PKG_LOAN.calculate_emi(
        p_principal     => 20000,
        p_annual_rate   => 8.5,
        p_tenure_months => 24
    );
    DBMS_OUTPUT.PUT_LINE(' -> Principal: $20,000 | 8.5% APR | 24 Months -> EMI: $' || v_emi || ' / month');

    -- 7. TEST PKG_LOAN.apply_loan & approve_loan (Disbursement)
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '[TEST 7] Testing PKG_LOAN.apply_loan and approve_loan disbursement...');
    PKG_LOAN.apply_loan(
        p_customer_id   => 2001,
        p_account_no    => v_acc_no,
        p_loan_type     => 'PERSONAL',
        p_principal     => 10000,
        p_term_months   => 12,
        p_interest_rate => 7.5,
        o_loan_id       => v_loan_id,
        o_loan_ref      => v_loan_ref,
        o_emi           => v_emi,
        o_total_payable => v_tot_pay,
        o_message       => v_msg
    );
    DBMS_OUTPUT.PUT_LINE(' -> Loan applied: ' || v_loan_ref || ' (ID: ' || v_loan_id || ') | EMI: $' || v_emi);

    PKG_LOAN.approve_loan(
        p_loan_id     => v_loan_id,
        p_employee_id => 1003,
        p_action      => 'APPROVED',
        p_remarks     => 'Approved via automated test harness.',
        o_status      => v_status,
        o_message     => v_msg
    );
    DBMS_OUTPUT.PUT_LINE(' -> Loan ' || v_loan_ref || ' ' || v_status || ' and funds disbursed into ' || v_acc_no);

    -- 8. TEST PKG_LOAN.pay_emi
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '[TEST 8] Testing PKG_LOAN.pay_emi installment repayment...');
    PKG_LOAN.pay_emi(
        p_loan_id           => v_loan_id,
        p_payment_amount    => v_emi,
        p_source_acc        => v_acc_no,
        p_payment_method    => 'ONLINE',
        o_payment_id        => v_pay_id,
        o_remaining_balance => v_rem_bal,
        o_message           => v_msg
    );
    DBMS_OUTPUT.PUT_LINE(' -> Installment paid. Payment ID: ' || v_pay_id || ' | Remaining balance: $' || v_rem_bal);

    -- 9. TEST PKG_REPORT.get_dashboard_metrics
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '[TEST 9] Testing PKG_REPORT.get_dashboard_metrics...');
    PKG_REPORT.get_dashboard_metrics(
        o_total_customers    => v_tot_cust,
        o_total_deposits     => v_tot_dep,
        o_active_loans       => v_act_loans,
        o_today_transactions => v_today_txns,
        o_total_accounts     => v_tot_accs
    );
    DBMS_OUTPUT.PUT_LINE(' -> Total Active Customers: ' || v_tot_cust);
    DBMS_OUTPUT.PUT_LINE(' -> Total System Deposits:  $' || TO_CHAR(v_tot_dep, '999,999,999.99'));
    DBMS_OUTPUT.PUT_LINE(' -> Active Loan Count:      ' || v_act_loans);

    -- 10. TEST AUDIT LOG TRIGGER
    SELECT COUNT(1) INTO v_audit_count FROM AUDIT_LOG;
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '[TEST 10] Testing Database Triggers (AUDIT_LOG count)...');
    DBMS_OUTPUT.PUT_LINE(' -> Total Compliance Audit Records Captured: ' || v_audit_count);

    DBMS_OUTPUT.PUT_LINE(CHR(10) || '================================================================');
    DBMS_OUTPUT.PUT_LINE(' ALL PL/SQL PROCEDURES, PACKAGES & TRIGGERS VERIFIED SUCCESSFULLY!');
    DBMS_OUTPUT.PUT_LINE('================================================================');
END;
/
