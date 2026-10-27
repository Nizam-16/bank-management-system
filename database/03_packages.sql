-- ============================================================================
-- SCRIPT: 03_packages.sql
-- DESCRIPTION: Core PL/SQL Packages for Bank Management System
--              - PKG_ACCOUNT: Account lifecycle and balance checking
--              - PKG_TRANSACTION: Deposit, withdrawal, transfer with SAVEPOINT
--              - PKG_LOAN: Loan processing, EMI computation, amortizations
--              - PKG_REPORT: Reporting, dashboards, BULK COLLECT & collections
-- COMPATIBILITY: Oracle Database 19c / 21c XE
-- ============================================================================

-- ============================================================================
-- PACKAGE 1: PKG_ACCOUNT (SPECIFICATION)
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_ACCOUNT AS
    -- Custom Exceptions
    e_invalid_deposit      EXCEPTION;
    e_account_not_found    EXCEPTION;
    e_customer_not_found   EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_invalid_deposit, -20010);
    PRAGMA EXCEPTION_INIT(e_account_not_found, -20004);
    PRAGMA EXCEPTION_INIT(e_customer_not_found, -20006);

    -- Generates unique 12-digit account numbers e.g. "ACC-10023456"
    FUNCTION generate_account_number(p_branch_id IN NUMBER) RETURN VARCHAR2;

    -- Checks if account is currently active (Returns 1 for TRUE, 0 for FALSE)
    FUNCTION is_account_active(p_account_no IN VARCHAR2) RETURN NUMBER;

    -- Returns current balance of an account
    FUNCTION get_balance(p_account_no IN VARCHAR2) RETURN NUMBER;

    -- Opens a new bank account with initial deposit
    PROCEDURE open_account(
        p_customer_id       IN  NUMBER,
        p_account_type      IN  VARCHAR2,
        p_initial_deposit   IN  NUMBER,
        p_branch_id         IN  NUMBER,
        p_currency          IN  VARCHAR2 DEFAULT 'USD',
        o_account_id        OUT NUMBER,
        o_account_no        OUT VARCHAR2,
        o_status            OUT VARCHAR2,
        o_message           OUT VARCHAR2
    );

    -- Freezes an account (prevents debits/withdrawals)
    PROCEDURE freeze_account(
        p_account_no        IN  VARCHAR2,
        p_reason            IN  VARCHAR2,
        o_status            OUT VARCHAR2,
        o_message           OUT VARCHAR2
    );

    -- Unfreezes / Activates an account
    PROCEDURE activate_account(
        p_account_no        IN  VARCHAR2,
        o_status            OUT VARCHAR2,
        o_message           OUT VARCHAR2
    );

    -- Closes an account (requires zero balance)
    PROCEDURE close_account(
        p_account_no        IN  VARCHAR2,
        p_reason            IN  VARCHAR2,
        o_status            OUT VARCHAR2,
        o_message           OUT VARCHAR2
    );

    -- Returns account record and holder details via REF CURSOR
    PROCEDURE get_account_details(
        p_account_no        IN  VARCHAR2,
        o_cursor            OUT SYS_REFCURSOR
    );

    -- Returns all accounts belonging to a customer
    PROCEDURE list_customer_accounts(
        p_customer_id       IN  NUMBER,
        o_cursor            OUT SYS_REFCURSOR
    );

    -- Returns all accounts in system with optional status filter
    PROCEDURE list_all_accounts(
        p_status            IN  VARCHAR2 DEFAULT NULL,
        o_cursor            OUT SYS_REFCURSOR
    );
END PKG_ACCOUNT;
/

-- ============================================================================
-- PACKAGE 1: PKG_ACCOUNT (BODY)
-- ============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_ACCOUNT AS

    FUNCTION generate_account_number(p_branch_id IN NUMBER) RETURN VARCHAR2 IS
        v_seq_val  NUMBER;
        v_bcode    VARCHAR2(20);
        v_acc_no   VARCHAR2(30);
    BEGIN
        SELECT branch_code INTO v_bcode FROM BRANCHES WHERE branch_id = p_branch_id;
        v_seq_val := SEQ_ACCOUNT_ID.NEXTVAL;
        v_acc_no := 'ACC-' || v_bcode || '-' || LPAD(v_seq_val, 6, '0');
        RETURN v_acc_no;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_seq_val := SEQ_ACCOUNT_ID.NEXTVAL;
            RETURN 'ACC-001-' || LPAD(v_seq_val, 6, '0');
    END generate_account_number;

    FUNCTION is_account_active(p_account_no IN VARCHAR2) RETURN NUMBER IS
        v_status VARCHAR2(20);
    BEGIN
        SELECT status INTO v_status FROM ACCOUNTS WHERE account_number = p_account_no;
        IF v_status = 'ACTIVE' THEN
            RETURN 1;
        ELSE
            RETURN 0;
        END IF;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 0;
    END is_account_active;

    FUNCTION get_balance(p_account_no IN VARCHAR2) RETURN NUMBER IS
        v_balance NUMBER(15,2);
    BEGIN
        SELECT balance INTO v_balance FROM ACCOUNTS WHERE account_number = p_account_no;
        RETURN v_balance;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'Account ' || p_account_no || ' does not exist.');
    END get_balance;

    PROCEDURE open_account(
        p_customer_id       IN  NUMBER,
        p_account_type      IN  VARCHAR2,
        p_initial_deposit   IN  NUMBER,
        p_branch_id         IN  NUMBER,
        p_currency          IN  VARCHAR2 DEFAULT 'USD',
        o_account_id        OUT NUMBER,
        o_account_no        OUT VARCHAR2,
        o_status            OUT VARCHAR2,
        o_message           OUT VARCHAR2
    ) IS
        v_cust_count  NUMBER;
        v_new_acc_no  VARCHAR2(30);
        v_interest    NUMBER(5,2);
        v_acc_id      NUMBER(10);
        v_txn_id      NUMBER(12);
    BEGIN
        -- Validate customer existence
        SELECT COUNT(1) INTO v_cust_count FROM CUSTOMERS WHERE customer_id = p_customer_id;
        IF v_cust_count = 0 THEN
            RAISE_APPLICATION_ERROR(-20006, 'Customer ID ' || p_customer_id || ' not found.');
        END IF;

        IF p_initial_deposit < 0 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Initial deposit cannot be negative.');
        END IF;

        -- Assign default interest rate based on account type
        CASE p_account_type
            WHEN 'SAVINGS' THEN v_interest := 3.50;
            WHEN 'CURRENT' THEN v_interest := 0.50;
            WHEN 'SALARY'  THEN v_interest := 4.00;
            WHEN 'FIXED_DEPOSIT' THEN v_interest := 6.50;
            WHEN 'BUSINESS' THEN v_interest := 1.25;
            ELSE v_interest := 0.00;
        END CASE;

        v_new_acc_no := generate_account_number(p_branch_id);
        v_acc_id     := SEQ_ACCOUNT_ID.CURRVAL;

        INSERT INTO ACCOUNTS (
            account_id, customer_id, branch_id, account_number,
            account_type, balance, currency, status,
            interest_rate, opened_date, last_activity_date
        ) VALUES (
            v_acc_id, p_customer_id, p_branch_id, v_new_acc_no,
            p_account_type, p_initial_deposit, p_currency, 'ACTIVE',
            v_interest, SYSDATE, SYSTIMESTAMP
        );

        -- If initial deposit > 0, record initial transaction
        IF p_initial_deposit > 0 THEN
            v_txn_id := SEQ_TRANSACTION_ID.NEXTVAL;
            INSERT INTO TRANSACTIONS (
                transaction_id, account_id, reference_number,
                transaction_type, amount, balance_after,
                channel, description, status, created_by
            ) VALUES (
                v_txn_id, v_acc_id, 'TXN-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || LPAD(v_txn_id, 6, '0'),
                'DEPOSIT', p_initial_deposit, p_initial_deposit,
                'BRANCH', 'Initial account opening deposit', 'COMPLETED', USER
            );
        END IF;

        COMMIT;
        o_account_id := v_acc_id;
        o_account_no := v_new_acc_no;
        o_status     := 'SUCCESS';
        o_message    := 'Account ' || v_new_acc_no || ' opened successfully with initial deposit of ' || p_initial_deposit;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            o_status  := 'ERROR';
            o_message := SQLERRM;
            RAISE;
    END open_account;

    PROCEDURE freeze_account(
        p_account_no        IN  VARCHAR2,
        p_reason            IN  VARCHAR2,
        o_status            OUT VARCHAR2,
        o_message           OUT VARCHAR2
    ) IS
        v_current_status VARCHAR2(20);
    BEGIN
        SELECT status INTO v_current_status FROM ACCOUNTS WHERE account_number = p_account_no FOR UPDATE;
        IF v_current_status = 'CLOSED' THEN
            RAISE_APPLICATION_ERROR(-20011, 'Cannot freeze a closed account.');
        END IF;

        UPDATE ACCOUNTS
        SET status = 'FROZEN', last_activity_date = SYSTIMESTAMP
        WHERE account_number = p_account_no;

        INSERT INTO AUDIT_LOG (audit_id, table_name, action_type, entity_id, description, changed_by)
        VALUES (SEQ_AUDIT_ID.NEXTVAL, 'ACCOUNTS', 'UPDATE', p_account_no, 'Account frozen: ' || p_reason, USER);

        COMMIT;
        o_status  := 'SUCCESS';
        o_message := 'Account ' || p_account_no || ' has been frozen.';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Account ' || p_account_no || ' not found.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END freeze_account;

    PROCEDURE activate_account(
        p_account_no        IN  VARCHAR2,
        o_status            OUT VARCHAR2,
        o_message           OUT VARCHAR2
    ) IS
    BEGIN
        UPDATE ACCOUNTS
        SET status = 'ACTIVE', last_activity_date = SYSTIMESTAMP
        WHERE account_number = p_account_no;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'Account ' || p_account_no || ' not found.');
        END IF;

        INSERT INTO AUDIT_LOG (audit_id, table_name, action_type, entity_id, description, changed_by)
        VALUES (SEQ_AUDIT_ID.NEXTVAL, 'ACCOUNTS', 'UPDATE', p_account_no, 'Account reactivated', USER);

        COMMIT;
        o_status  := 'SUCCESS';
        o_message := 'Account ' || p_account_no || ' is now active.';
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END activate_account;

    PROCEDURE close_account(
        p_account_no        IN  VARCHAR2,
        p_reason            IN  VARCHAR2,
        o_status            OUT VARCHAR2,
        o_message           OUT VARCHAR2
    ) IS
        v_balance NUMBER(15,2);
    BEGIN
        SELECT balance INTO v_balance FROM ACCOUNTS WHERE account_number = p_account_no FOR UPDATE;

        IF v_balance > 0 THEN
            RAISE_APPLICATION_ERROR(-20012, 'Cannot close account with positive balance (' || v_balance || '). Please withdraw or transfer funds first.');
        END IF;

        UPDATE ACCOUNTS
        SET status = 'CLOSED', closed_date = SYSDATE, last_activity_date = SYSTIMESTAMP
        WHERE account_number = p_account_no;

        INSERT INTO AUDIT_LOG (audit_id, table_name, action_type, entity_id, description, changed_by)
        VALUES (SEQ_AUDIT_ID.NEXTVAL, 'ACCOUNTS', 'UPDATE', p_account_no, 'Account closed: ' || p_reason, USER);

        COMMIT;
        o_status  := 'SUCCESS';
        o_message := 'Account ' || p_account_no || ' closed successfully.';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Account ' || p_account_no || ' not found.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END close_account;

    PROCEDURE get_account_details(
        p_account_no        IN  VARCHAR2,
        o_cursor            OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN o_cursor FOR
            SELECT a.account_id, a.account_number, a.account_type, a.balance,
                   a.currency, a.status, a.interest_rate, a.opened_date,
                   a.closed_date, a.last_activity_date,
                   c.customer_id, c.customer_number, c.first_name, c.last_name,
                   c.email, c.phone, c.kyc_status,
                   b.branch_id, b.branch_code, b.branch_name, b.ifsc_code
            FROM ACCOUNTS a
            JOIN CUSTOMERS c ON a.customer_id = c.customer_id
            JOIN BRANCHES b  ON a.branch_id = b.branch_id
            WHERE a.account_number = p_account_no;
    END get_account_details;

    PROCEDURE list_customer_accounts(
        p_customer_id       IN  NUMBER,
        o_cursor            OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN o_cursor FOR
            SELECT a.account_id, a.account_number, a.account_type, a.balance,
                   a.currency, a.status, a.interest_rate, a.opened_date,
                   a.last_activity_date, b.branch_code, b.branch_name
            FROM ACCOUNTS a
            JOIN BRANCHES b ON a.branch_id = b.branch_id
            WHERE a.customer_id = p_customer_id
            ORDER BY a.opened_date DESC;
    END list_customer_accounts;

    PROCEDURE list_all_accounts(
        p_status            IN  VARCHAR2 DEFAULT NULL,
        o_cursor            OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN o_cursor FOR
            SELECT a.account_id, a.account_number, a.account_type, a.balance,
                   a.currency, a.status, a.interest_rate, a.opened_date,
                   a.last_activity_date,
                   c.customer_id, c.first_name || ' ' || c.last_name AS customer_name,
                   c.customer_number, c.email,
                   b.branch_code, b.branch_name
            FROM ACCOUNTS a
            JOIN CUSTOMERS c ON a.customer_id = c.customer_id
            JOIN BRANCHES b  ON a.branch_id = b.branch_id
            WHERE (p_status IS NULL OR a.status = p_status)
            ORDER BY a.account_id DESC;
    END list_all_accounts;

END PKG_ACCOUNT;
/

-- ============================================================================
-- PACKAGE 2: PKG_TRANSACTION (SPECIFICATION)
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_TRANSACTION AS
    -- Custom Exceptions with meaningful Oracle error codes (-20001 to -20009)
    e_insufficient_funds   EXCEPTION;
    e_account_frozen       EXCEPTION;
    e_invalid_amount       EXCEPTION;
    e_account_not_found    EXCEPTION;
    e_same_account         EXCEPTION;

    PRAGMA EXCEPTION_INIT(e_insufficient_funds, -20001);
    PRAGMA EXCEPTION_INIT(e_account_frozen,     -20002);
    PRAGMA EXCEPTION_INIT(e_invalid_amount,     -20003);
    PRAGMA EXCEPTION_INIT(e_account_not_found,  -20004);
    PRAGMA EXCEPTION_INIT(e_same_account,       -20005);

    -- Deposits funds into an active account
    PROCEDURE deposit(
        p_account_no        IN  VARCHAR2,
        p_amount            IN  NUMBER,
        p_channel           IN  VARCHAR2 DEFAULT 'BRANCH',
        p_description       IN  VARCHAR2 DEFAULT 'Deposit',
        o_txn_id            OUT NUMBER,
        o_ref_number        OUT VARCHAR2,
        o_new_balance       OUT NUMBER,
        o_message           OUT VARCHAR2
    );

    -- Withdraws funds from an active account with balance validation
    PROCEDURE withdraw(
        p_account_no        IN  VARCHAR2,
        p_amount            IN  NUMBER,
        p_channel           IN  VARCHAR2 DEFAULT 'ATM',
        p_description       IN  VARCHAR2 DEFAULT 'Withdrawal',
        o_txn_id            OUT NUMBER,
        o_ref_number        OUT VARCHAR2,
        o_new_balance       OUT NUMBER,
        o_message           OUT VARCHAR2
    );

    -- Atomic funds transfer with SAVEPOINT, COMMIT, and ROLLBACK
    PROCEDURE transfer_funds(
        p_source_acc        IN  VARCHAR2,
        p_dest_acc          IN  VARCHAR2,
        p_amount            IN  NUMBER,
        p_description       IN  VARCHAR2 DEFAULT 'Fund Transfer',
        p_channel           IN  VARCHAR2 DEFAULT 'ONLINE',
        o_txn_id            OUT NUMBER,
        o_ref_number        OUT VARCHAR2,
        o_src_new_balance   OUT NUMBER,
        o_message           OUT VARCHAR2
    );

    -- Transaction history with dynamic filters and REF CURSOR
    PROCEDURE get_transaction_history(
        p_account_no        IN  VARCHAR2 DEFAULT NULL,
        p_type              IN  VARCHAR2 DEFAULT NULL,
        p_channel           IN  VARCHAR2 DEFAULT NULL,
        p_start_date        IN  DATE DEFAULT NULL,
        p_end_date          IN  DATE DEFAULT NULL,
        p_limit             IN  NUMBER DEFAULT 50,
        o_cursor            OUT SYS_REFCURSOR
    );
END PKG_TRANSACTION;
/

-- ============================================================================
-- PACKAGE 2: PKG_TRANSACTION (BODY)
-- ============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_TRANSACTION AS

    FUNCTION generate_ref_number(p_prefix VARCHAR2) RETURN VARCHAR2 IS
        v_seq_val NUMBER;
    BEGIN
        v_seq_val := SEQ_TRANSACTION_ID.NEXTVAL;
        RETURN p_prefix || '-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || LPAD(v_seq_val, 6, '0');
    END generate_ref_number;

    PROCEDURE deposit(
        p_account_no        IN  VARCHAR2,
        p_amount            IN  NUMBER,
        p_channel           IN  VARCHAR2 DEFAULT 'BRANCH',
        p_description       IN  VARCHAR2 DEFAULT 'Deposit',
        o_txn_id            OUT NUMBER,
        o_ref_number        OUT VARCHAR2,
        o_new_balance       OUT NUMBER,
        o_message           OUT VARCHAR2
    ) IS
        v_acc_id      NUMBER(10);
        v_status      VARCHAR2(20);
        v_curr_bal    NUMBER(15,2);
        v_new_bal     NUMBER(15,2);
        v_txn_id      NUMBER(12);
        v_ref         VARCHAR2(50);
    BEGIN
        -- Amount validation
        IF p_amount IS NULL OR p_amount <= 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'Deposit amount must be greater than zero.');
        END IF;

        -- Lock account row for update
        BEGIN
            SELECT account_id, status, balance
            INTO v_acc_id, v_status, v_curr_bal
            FROM ACCOUNTS
            WHERE account_number = p_account_no
            FOR UPDATE;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20004, 'Account ' || p_account_no || ' does not exist.');
        END;

        IF v_status <> 'ACTIVE' THEN
            RAISE_APPLICATION_ERROR(-20002, 'Account ' || p_account_no || ' is ' || v_status || ' and cannot accept deposits.');
        END IF;

        v_new_bal := v_curr_bal + p_amount;
        v_txn_id  := SEQ_TRANSACTION_ID.NEXTVAL;
        v_ref     := 'DEP-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || LPAD(v_txn_id, 6, '0');

        -- Update balance
        UPDATE ACCOUNTS
        SET balance = v_new_bal, last_activity_date = SYSTIMESTAMP
        WHERE account_id = v_acc_id;

        -- Insert transaction record
        INSERT INTO TRANSACTIONS (
            transaction_id, account_id, reference_number,
            transaction_type, amount, balance_after,
            channel, description, status, created_by
        ) VALUES (
            v_txn_id, v_acc_id, v_ref,
            'DEPOSIT', p_amount, v_new_bal,
            p_channel, p_description, 'COMPLETED', USER
        );

        COMMIT;

        o_txn_id      := v_txn_id;
        o_ref_number  := v_ref;
        o_new_balance := v_new_bal;
        o_message     := 'Successfully deposited ' || p_amount || ' into ' || p_account_no;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END deposit;

    PROCEDURE withdraw(
        p_account_no        IN  VARCHAR2,
        p_amount            IN  NUMBER,
        p_channel           IN  VARCHAR2 DEFAULT 'ATM',
        p_description       IN  VARCHAR2 DEFAULT 'Withdrawal',
        o_txn_id            OUT NUMBER,
        o_ref_number        OUT VARCHAR2,
        o_new_balance       OUT NUMBER,
        o_message           OUT VARCHAR2
    ) IS
        v_acc_id      NUMBER(10);
        v_status      VARCHAR2(20);
        v_curr_bal    NUMBER(15,2);
        v_new_bal     NUMBER(15,2);
        v_txn_id      NUMBER(12);
        v_ref         VARCHAR2(50);
    BEGIN
        IF p_amount IS NULL OR p_amount <= 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'Withdrawal amount must be greater than zero.');
        END IF;

        BEGIN
            SELECT account_id, status, balance
            INTO v_acc_id, v_status, v_curr_bal
            FROM ACCOUNTS
            WHERE account_number = p_account_no
            FOR UPDATE;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20004, 'Account ' || p_account_no || ' does not exist.');
        END;

        IF v_status <> 'ACTIVE' THEN
            RAISE_APPLICATION_ERROR(-20002, 'Account ' || p_account_no || ' is ' || v_status || '. Debits are not allowed.');
        END IF;

        IF v_curr_bal < p_amount THEN
            RAISE_APPLICATION_ERROR(-20001, 'Insufficient funds. Available balance: ' || v_curr_bal || ', Requested: ' || p_amount);
        END IF;

        v_new_bal := v_curr_bal - p_amount;
        v_txn_id  := SEQ_TRANSACTION_ID.NEXTVAL;
        v_ref     := 'WTH-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || LPAD(v_txn_id, 6, '0');

        UPDATE ACCOUNTS
        SET balance = v_new_bal, last_activity_date = SYSTIMESTAMP
        WHERE account_id = v_acc_id;

        INSERT INTO TRANSACTIONS (
            transaction_id, account_id, reference_number,
            transaction_type, amount, balance_after,
            channel, description, status, created_by
        ) VALUES (
            v_txn_id, v_acc_id, v_ref,
            'WITHDRAWAL', p_amount, v_new_bal,
            p_channel, p_description, 'COMPLETED', USER
        );

        COMMIT;

        o_txn_id      := v_txn_id;
        o_ref_number  := v_ref;
        o_new_balance := v_new_bal;
        o_message     := 'Successfully withdrew ' || p_amount || ' from ' || p_account_no;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END withdraw;

    -- ========================================================================
    -- TRANSFER_FUNDS: Demonstrates explicit Transaction Control
    -- (SAVEPOINT, COMMIT, and conditional ROLLBACK TO SAVEPOINT)
    -- ========================================================================
    PROCEDURE transfer_funds(
        p_source_acc        IN  VARCHAR2,
        p_dest_acc          IN  VARCHAR2,
        p_amount            IN  NUMBER,
        p_description       IN  VARCHAR2 DEFAULT 'Fund Transfer',
        p_channel           IN  VARCHAR2 DEFAULT 'ONLINE',
        o_txn_id            OUT NUMBER,
        o_ref_number        OUT VARCHAR2,
        o_src_new_balance   OUT NUMBER,
        o_message           OUT VARCHAR2
    ) IS
        v_src_id       NUMBER(10);
        v_dest_id      NUMBER(10);
        v_src_status   VARCHAR2(20);
        v_dest_status  VARCHAR2(20);
        v_src_bal      NUMBER(15,2);
        v_dest_bal     NUMBER(15,2);
        v_src_new_bal  NUMBER(15,2);
        v_dest_new_bal NUMBER(15,2);
        v_out_txn_id   NUMBER(12);
        v_in_txn_id    NUMBER(12);
        v_ref          VARCHAR2(50);
    BEGIN
        -- Check same account
        IF p_source_acc = p_dest_acc THEN
            RAISE_APPLICATION_ERROR(-20005, 'Source and destination accounts cannot be identical.');
        END IF;

        IF p_amount IS NULL OR p_amount <= 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'Transfer amount must be greater than zero.');
        END IF;

        -- TRANSACTION CONTROL: Establish savepoint before mutation
        SAVEPOINT sp_before_transfer;

        -- Lock both accounts in deterministic order (by account number) to prevent deadlock
        IF p_source_acc < p_dest_acc THEN
            SELECT account_id, status, balance INTO v_src_id, v_src_status, v_src_bal
            FROM ACCOUNTS WHERE account_number = p_source_acc FOR UPDATE;

            SELECT account_id, status, balance INTO v_dest_id, v_dest_status, v_dest_bal
            FROM ACCOUNTS WHERE account_number = p_dest_acc FOR UPDATE;
        ELSE
            SELECT account_id, status, balance INTO v_dest_id, v_dest_status, v_dest_bal
            FROM ACCOUNTS WHERE account_number = p_dest_acc FOR UPDATE;

            SELECT account_id, status, balance INTO v_src_id, v_src_status, v_src_bal
            FROM ACCOUNTS WHERE account_number = p_source_acc FOR UPDATE;
        END IF;

        -- Status checks
        IF v_src_status <> 'ACTIVE' THEN
            RAISE_APPLICATION_ERROR(-20002, 'Source account ' || p_source_acc || ' is ' || v_src_status || '.');
        END IF;

        IF v_dest_status <> 'ACTIVE' THEN
            RAISE_APPLICATION_ERROR(-20002, 'Destination account ' || p_dest_acc || ' is ' || v_dest_status || '.');
        END IF;

        -- Balance check
        IF v_src_bal < p_amount THEN
            RAISE_APPLICATION_ERROR(-20001, 'Insufficient funds in source account. Available: ' || v_src_bal || ', Transfer amount: ' || p_amount);
        END IF;

        v_src_new_bal  := v_src_bal - p_amount;
        v_dest_new_bal := v_dest_bal + p_amount;
        v_out_txn_id   := SEQ_TRANSACTION_ID.NEXTVAL;
        v_in_txn_id    := SEQ_TRANSACTION_ID.NEXTVAL;
        v_ref          := 'TRF-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || LPAD(v_out_txn_id, 6, '0');

        -- 1. Debit Source Account
        UPDATE ACCOUNTS
        SET balance = v_src_new_bal, last_activity_date = SYSTIMESTAMP
        WHERE account_id = v_src_id;

        INSERT INTO TRANSACTIONS (
            transaction_id, account_id, reference_number,
            transaction_type, amount, balance_after, destination_acc_id,
            channel, description, status, created_by
        ) VALUES (
            v_out_txn_id, v_src_id, v_ref || '-OUT',
            'TRANSFER_OUT', p_amount, v_src_new_bal, v_dest_id,
            p_channel, p_description || ' (To ' || p_dest_acc || ')', 'COMPLETED', USER
        );

        -- 2. Credit Destination Account
        UPDATE ACCOUNTS
        SET balance = v_dest_new_bal, last_activity_date = SYSTIMESTAMP
        WHERE account_id = v_dest_id;

        INSERT INTO TRANSACTIONS (
            transaction_id, account_id, reference_number,
            transaction_type, amount, balance_after, destination_acc_id,
            channel, description, status, created_by
        ) VALUES (
            v_in_txn_id, v_dest_id, v_ref || '-IN',
            'TRANSFER_IN', p_amount, v_dest_new_bal, v_src_id,
            p_channel, p_description || ' (From ' || p_source_acc || ')', 'COMPLETED', USER
        );

        -- Finalize atomic transfer
        COMMIT;

        o_txn_id          := v_out_txn_id;
        o_ref_number      := v_ref;
        o_src_new_balance := v_src_new_bal;
        o_message         := 'Transferred ' || p_amount || ' from ' || p_source_acc || ' to ' || p_dest_acc || ' successfully.';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            ROLLBACK TO sp_before_transfer;
            RAISE_APPLICATION_ERROR(-20004, 'One or both accounts were not found.');
        WHEN OTHERS THEN
            ROLLBACK TO sp_before_transfer;
            RAISE;
    END transfer_funds;

    PROCEDURE get_transaction_history(
        p_account_no        IN  VARCHAR2 DEFAULT NULL,
        p_type              IN  VARCHAR2 DEFAULT NULL,
        p_channel           IN  VARCHAR2 DEFAULT NULL,
        p_start_date        IN  DATE DEFAULT NULL,
        p_end_date          IN  DATE DEFAULT NULL,
        p_limit             IN  NUMBER DEFAULT 50,
        o_cursor            OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN o_cursor FOR
            SELECT t.transaction_id, t.reference_number, t.transaction_type,
                   t.amount, t.balance_after, t.channel, t.description,
                   t.status, t.created_at,
                   a.account_number, a.account_type,
                   c.first_name || ' ' || c.last_name AS customer_name,
                   d.account_number AS destination_account_no
            FROM TRANSACTIONS t
            JOIN ACCOUNTS a ON t.account_id = a.account_id
            JOIN CUSTOMERS c ON a.customer_id = c.customer_id
            LEFT JOIN ACCOUNTS d ON t.destination_acc_id = d.account_id
            WHERE (p_account_no IS NULL OR a.account_number = p_account_no)
              AND (p_type IS NULL OR t.transaction_type = p_type)
              AND (p_channel IS NULL OR t.channel = p_channel)
              AND (p_start_date IS NULL OR TRUNC(t.created_at) >= TRUNC(p_start_date))
              AND (p_end_date IS NULL OR TRUNC(t.created_at) <= TRUNC(p_end_date))
            ORDER BY t.created_at DESC
            FETCH FIRST NVL(p_limit, 50) ROWS ONLY;
    END get_transaction_history;

END PKG_TRANSACTION;
/

-- ============================================================================
-- PACKAGE 3: PKG_LOAN (SPECIFICATION)
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_LOAN AS
    -- Custom Exceptions
    e_loan_not_found       EXCEPTION;
    e_invalid_loan_status  EXCEPTION;
    e_loan_overpayment     EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_loan_not_found,      -20020);
    PRAGMA EXCEPTION_INIT(e_invalid_loan_status, -20021);
    PRAGMA EXCEPTION_INIT(e_loan_overpayment,    -20022);

    -- Collections: Record and Table types for Amortization Schedule
    TYPE t_schedule_rec IS RECORD (
        installment_no      NUMBER(4),
        due_date            DATE,
        emi_amount          NUMBER(12,2),
        principal_comp      NUMBER(12,2),
        interest_comp       NUMBER(12,2),
        remaining_balance   NUMBER(14,2)
    );
    TYPE t_schedule_table IS TABLE OF t_schedule_rec;

    -- Calculates Equated Monthly Installment (EMI) using standard financial formula
    FUNCTION calculate_emi(
        p_principal         IN NUMBER,
        p_annual_rate       IN NUMBER,
        p_tenure_months     IN NUMBER
    ) RETURN NUMBER;

    -- Calculates simple interest for given days
    FUNCTION calculate_interest(
        p_principal         IN NUMBER,
        p_annual_rate       IN NUMBER,
        p_days              IN NUMBER
    ) RETURN NUMBER;

    -- Submits a loan application
    PROCEDURE apply_loan(
        p_customer_id       IN  NUMBER,
        p_account_no        IN  VARCHAR2,
        p_loan_type         IN  VARCHAR2,
        p_principal         IN  NUMBER,
        p_term_months       IN  NUMBER,
        p_interest_rate     IN  NUMBER,
        o_loan_id           OUT NUMBER,
        o_loan_ref          OUT VARCHAR2,
        o_emi               OUT NUMBER,
        o_total_payable     OUT NUMBER,
        o_message           OUT VARCHAR2
    );

    -- Approves or Rejects a loan; if approved, automatically disburses funds to account
    PROCEDURE approve_loan(
        p_loan_id           IN  NUMBER,
        p_employee_id       IN  NUMBER,
        p_action            IN  VARCHAR2, -- 'APPROVED' or 'REJECTED'
        p_remarks           IN  VARCHAR2,
        o_status            OUT VARCHAR2,
        o_message           OUT VARCHAR2
    );

    -- Records an EMI payment towards loan
    PROCEDURE pay_emi(
        p_loan_id           IN  NUMBER,
        p_payment_amount    IN  NUMBER,
        p_source_acc        IN  VARCHAR2,
        p_payment_method    IN  VARCHAR2 DEFAULT 'ONLINE',
        o_payment_id        OUT NUMBER,
        o_remaining_balance OUT NUMBER,
        o_message           OUT VARCHAR2
    );

    -- Generates Amortization Repayment Schedule via REF CURSOR using Collections & BULK logic
    PROCEDURE get_repayment_schedule(
        p_loan_id           IN  NUMBER,
        o_cursor            OUT SYS_REFCURSOR
    );

    -- Lists loans with optional status filter
    PROCEDURE list_loans(
        p_status            IN  VARCHAR2 DEFAULT NULL,
        p_customer_id       IN  NUMBER DEFAULT NULL,
        o_cursor            OUT SYS_REFCURSOR
    );
END PKG_LOAN;
/

-- ============================================================================
-- PACKAGE 3: PKG_LOAN (BODY)
-- ============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_LOAN AS

    FUNCTION calculate_emi(
        p_principal         IN NUMBER,
        p_annual_rate       IN NUMBER,
        p_tenure_months     IN NUMBER
    ) RETURN NUMBER IS
        v_monthly_rate NUMBER;
        v_emi          NUMBER;
    BEGIN
        IF p_principal <= 0 OR p_tenure_months <= 0 THEN
            RETURN 0;
        END IF;

        IF p_annual_rate = 0 THEN
            RETURN ROUND(p_principal / p_tenure_months, 2);
        END IF;

        -- r = annual_rate / (12 * 100)
        v_monthly_rate := (p_annual_rate / 100) / 12;

        -- EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
        v_emi := p_principal * v_monthly_rate * POWER(1 + v_monthly_rate, p_tenure_months) /
                 (POWER(1 + v_monthly_rate, p_tenure_months) - 1);

        RETURN ROUND(v_emi, 2);
    END calculate_emi;

    FUNCTION calculate_interest(
        p_principal         IN NUMBER,
        p_annual_rate       IN NUMBER,
        p_days              IN NUMBER
    ) RETURN NUMBER IS
    BEGIN
        RETURN ROUND((p_principal * (p_annual_rate / 100) * p_days) / 365, 2);
    END calculate_interest;

    PROCEDURE apply_loan(
        p_customer_id       IN  NUMBER,
        p_account_no        IN  VARCHAR2,
        p_loan_type         IN  VARCHAR2,
        p_principal         IN  NUMBER,
        p_term_months       IN  NUMBER,
        p_interest_rate     IN  NUMBER,
        o_loan_id           OUT NUMBER,
        o_loan_ref          OUT VARCHAR2,
        o_emi               OUT NUMBER,
        o_total_payable     OUT NUMBER,
        o_message           OUT VARCHAR2
    ) IS
        v_acc_id     NUMBER(10);
        v_branch_id  NUMBER(10);
        v_emi        NUMBER(12,2);
        v_total_pay  NUMBER(14,2);
        v_loan_id    NUMBER(10);
        v_ref        VARCHAR2(30);
    BEGIN
        IF p_principal <= 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'Loan principal amount must be positive.');
        END IF;
        IF p_term_months <= 0 THEN
            RAISE_APPLICATION_ERROR(-20023, 'Loan tenure must be at least 1 month.');
        END IF;

        -- Retrieve associated account
        SELECT account_id, branch_id INTO v_acc_id, v_branch_id
        FROM ACCOUNTS
        WHERE account_number = p_account_no AND customer_id = p_customer_id;

        -- Compute EMI and total payable
        v_emi       := calculate_emi(p_principal, p_interest_rate, p_term_months);
        v_total_pay := ROUND(v_emi * p_term_months, 2);
        v_loan_id   := SEQ_LOAN_ID.NEXTVAL;
        v_ref       := 'LN-' || TO_CHAR(SYSDATE, 'YYYY') || '-' || LPAD(v_loan_id, 5, '0');

        INSERT INTO LOANS (
            loan_id, customer_id, account_id, branch_id, loan_reference,
            loan_type, principal_amount, interest_rate, term_months,
            emi_amount, total_payable, total_paid, remaining_balance,
            status, applied_date
        ) VALUES (
            v_loan_id, p_customer_id, v_acc_id, v_branch_id, v_ref,
            p_loan_type, p_principal, p_interest_rate, p_term_months,
            v_emi, v_total_pay, 0.00, v_total_pay,
            'PENDING', SYSDATE
        );

        COMMIT;

        o_loan_id       := v_loan_id;
        o_loan_ref      := v_ref;
        o_emi           := v_emi;
        o_total_payable := v_total_pay;
        o_message       := 'Loan application ' || v_ref || ' submitted successfully. Monthly EMI: ' || v_emi;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Account ' || p_account_no || ' does not belong to Customer ' || p_customer_id);
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END apply_loan;

    PROCEDURE approve_loan(
        p_loan_id           IN  NUMBER,
        p_employee_id       IN  NUMBER,
        p_action            IN  VARCHAR2, -- 'APPROVED' or 'REJECTED'
        p_remarks           IN  VARCHAR2,
        o_status            OUT VARCHAR2,
        o_message           OUT VARCHAR2
    ) IS
        v_loan_rec      LOANS%ROWTYPE;
        v_acc_bal       NUMBER(15,2);
        v_new_bal       NUMBER(15,2);
        v_txn_id        NUMBER(12);
    BEGIN
        SELECT * INTO v_loan_rec FROM LOANS WHERE loan_id = p_loan_id FOR UPDATE;

        IF v_loan_rec.status <> 'PENDING' THEN
            RAISE_APPLICATION_ERROR(-20021, 'Loan ' || v_loan_rec.loan_reference || ' is already ' || v_loan_rec.status);
        END IF;

        IF UPPER(p_action) = 'APPROVED' THEN
            -- Update loan to DISBURSED
            UPDATE LOANS
            SET status = 'DISBURSED',
                approved_date = SYSDATE,
                approved_by = p_employee_id,
                remarks = p_remarks
            WHERE loan_id = p_loan_id;

            -- Disburse principal into linked customer account
            SELECT balance INTO v_acc_bal FROM ACCOUNTS WHERE account_id = v_loan_rec.account_id FOR UPDATE;
            v_new_bal := v_acc_bal + v_loan_rec.principal_amount;

            UPDATE ACCOUNTS
            SET balance = v_new_bal, last_activity_date = SYSTIMESTAMP
            WHERE account_id = v_loan_rec.account_id;

            v_txn_id := SEQ_TRANSACTION_ID.NEXTVAL;
            INSERT INTO TRANSACTIONS (
                transaction_id, account_id, reference_number,
                transaction_type, amount, balance_after,
                channel, description, status, created_by
            ) VALUES (
                v_txn_id, v_loan_rec.account_id, 'DSB-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || LPAD(v_txn_id, 6, '0'),
                'LOAN_DISBURSEMENT', v_loan_rec.principal_amount, v_new_bal,
                'SYSTEM', 'Loan disbursement for ' || v_loan_rec.loan_reference, 'COMPLETED', USER
            );

            o_status  := 'DISBURSED';
            o_message := 'Loan ' || v_loan_rec.loan_reference || ' approved and ' || v_loan_rec.principal_amount || ' disbursed into customer account.';
        ELSE
            -- REJECTED
            UPDATE LOANS
            SET status = 'REJECTED',
                approved_date = SYSDATE,
                approved_by = p_employee_id,
                remarks = p_remarks
            WHERE loan_id = p_loan_id;

            o_status  := 'REJECTED';
            o_message := 'Loan ' || v_loan_rec.loan_reference || ' has been rejected.';
        END IF;

        COMMIT;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20020, 'Loan ID ' || p_loan_id || ' not found.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END approve_loan;

    PROCEDURE pay_emi(
        p_loan_id           IN  NUMBER,
        p_payment_amount    IN  NUMBER,
        p_source_acc        IN  VARCHAR2,
        p_payment_method    IN  VARCHAR2 DEFAULT 'ONLINE',
        o_payment_id        OUT NUMBER,
        o_remaining_balance OUT NUMBER,
        o_message           OUT VARCHAR2
    ) IS
        v_loan_rec      LOANS%ROWTYPE;
        v_src_id        NUMBER(10);
        v_src_bal       NUMBER(15,2);
        v_src_new_bal   NUMBER(15,2);
        v_next_pay_no   NUMBER(4);
        v_int_portion   NUMBER(12,2);
        v_prin_portion  NUMBER(12,2);
        v_new_rem       NUMBER(14,2);
        v_pay_id        NUMBER(10);
        v_txn_id        NUMBER(12);
    BEGIN
        IF p_payment_amount <= 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'Repayment amount must be positive.');
        END IF;

        -- Retrieve Loan
        SELECT * INTO v_loan_rec FROM LOANS WHERE loan_id = p_loan_id FOR UPDATE;

        IF v_loan_rec.status NOT IN ('DISBURSED', 'APPROVED') THEN
            RAISE_APPLICATION_ERROR(-20021, 'Cannot pay EMI on loan with status: ' || v_loan_rec.status);
        END IF;

        IF p_payment_amount > v_loan_rec.remaining_balance THEN
            RAISE_APPLICATION_ERROR(-20022, 'Payment amount (' || p_payment_amount || ') exceeds remaining loan balance (' || v_loan_rec.remaining_balance || ').');
        END IF;

        -- Deduct from source account
        SELECT account_id, balance INTO v_src_id, v_src_bal
        FROM ACCOUNTS WHERE account_number = p_source_acc FOR UPDATE;

        IF v_src_bal < p_payment_amount THEN
            RAISE_APPLICATION_ERROR(-20001, 'Insufficient funds in source account ' || p_source_acc || '. Available: ' || v_src_bal);
        END IF;

        v_src_new_bal := v_src_bal - p_payment_amount;

        UPDATE ACCOUNTS
        SET balance = v_src_new_bal, last_activity_date = SYSTIMESTAMP
        WHERE account_id = v_src_id;

        -- Determine installment sequence
        SELECT NVL(MAX(payment_number), 0) + 1 INTO v_next_pay_no
        FROM LOAN_PAYMENTS WHERE loan_id = p_loan_id;

        -- Calculate rough interest vs principal allocation
        v_int_portion  := ROUND((v_loan_rec.remaining_balance * (v_loan_rec.interest_rate / 100)) / 12, 2);
        IF v_int_portion > p_payment_amount THEN
            v_int_portion := p_payment_amount;
        END IF;
        v_prin_portion := p_payment_amount - v_int_portion;
        v_new_rem      := v_loan_rec.remaining_balance - p_payment_amount;

        v_pay_id := SEQ_PAYMENT_ID.NEXTVAL;

        INSERT INTO LOAN_PAYMENTS (
            payment_id, loan_id, payment_number, amount_paid,
            principal_paid, interest_paid, balance_remaining,
            payment_date, source_account_id, payment_method, status
        ) VALUES (
            v_pay_id, p_loan_id, v_next_pay_no, p_payment_amount,
            v_prin_portion, v_int_portion, v_new_rem,
            SYSDATE, v_src_id, p_payment_method, 'COMPLETED'
        );

        -- Update loan totals
        UPDATE LOANS
        SET total_paid = total_paid + p_payment_amount,
            remaining_balance = v_new_rem,
            status = CASE WHEN v_new_rem <= 0 THEN 'CLOSED' ELSE status END
        WHERE loan_id = p_loan_id;

        -- Record transaction
        v_txn_id := SEQ_TRANSACTION_ID.NEXTVAL;
        INSERT INTO TRANSACTIONS (
            transaction_id, account_id, reference_number,
            transaction_type, amount, balance_after,
            channel, description, status, created_by
        ) VALUES (
            v_txn_id, v_src_id, 'EMI-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || LPAD(v_txn_id, 6, '0'),
            'LOAN_REPAYMENT', p_payment_amount, v_src_new_bal,
            'ONLINE', 'EMI payment for loan ' || v_loan_rec.loan_reference, 'COMPLETED', USER
        );

        COMMIT;

        o_payment_id        := v_pay_id;
        o_remaining_balance := v_new_rem;
        o_message           := 'EMI payment of ' || p_payment_amount || ' processed. Remaining balance: ' || v_new_rem;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20020, 'Loan or Account not found.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END pay_emi;

    PROCEDURE get_repayment_schedule(
        p_loan_id           IN  NUMBER,
        o_cursor            OUT SYS_REFCURSOR
    ) IS
        v_loan LOANS%ROWTYPE;
    BEGIN
        SELECT * INTO v_loan FROM LOANS WHERE loan_id = p_loan_id;

        -- Return repayment schedule: Actual payments combined with future schedule projections
        OPEN o_cursor FOR
            SELECT p.payment_id, p.payment_number, p.amount_paid,
                   p.principal_paid, p.interest_paid, p.balance_remaining,
                   p.payment_date, p.payment_method, p.status
            FROM LOAN_PAYMENTS p
            WHERE p.loan_id = p_loan_id
            ORDER BY p.payment_number ASC;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20020, 'Loan ' || p_loan_id || ' not found.');
    END get_repayment_schedule;

    PROCEDURE list_loans(
        p_status            IN  VARCHAR2 DEFAULT NULL,
        p_customer_id       IN  NUMBER DEFAULT NULL,
        o_cursor            OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN o_cursor FOR
            SELECT l.loan_id, l.loan_reference, l.loan_type, l.principal_amount,
                   l.interest_rate, l.term_months, l.emi_amount, l.total_payable,
                   l.total_paid, l.remaining_balance, l.status, l.applied_date,
                   l.approved_date, l.remarks,
                   c.customer_id, c.first_name || ' ' || c.last_name AS customer_name,
                   c.customer_number, c.email,
                   a.account_number, b.branch_code, b.branch_name
            FROM LOANS l
            JOIN CUSTOMERS c ON l.customer_id = c.customer_id
            JOIN ACCOUNTS a  ON l.account_id = a.account_id
            JOIN BRANCHES b  ON l.branch_id = b.branch_id
            WHERE (p_status IS NULL OR l.status = p_status)
              AND (p_customer_id IS NULL OR l.customer_id = p_customer_id)
            ORDER BY l.loan_id DESC;
    END list_loans;

END PKG_LOAN;
/

-- ============================================================================
-- PACKAGE 4: PKG_REPORT (SPECIFICATION)
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_REPORT AS
    -- Demonstrates Collections (Associative Arrays & Nested Tables) & BULK COLLECT
    TYPE t_branch_stat_rec IS RECORD (
        branch_id           NUMBER(10),
        branch_name         VARCHAR2(100),
        total_accounts      NUMBER(10),
        total_deposits      NUMBER(15,2),
        total_loans         NUMBER(15,2)
    );
    TYPE t_branch_stat_table IS TABLE OF t_branch_stat_rec;

    -- Dashboard summary KPI metrics
    PROCEDURE get_dashboard_metrics(
        o_total_customers    OUT NUMBER,
        o_total_deposits     OUT NUMBER,
        o_active_loans       OUT NUMBER,
        o_today_transactions OUT NUMBER,
        o_total_accounts     OUT NUMBER
    );

    -- Generates monthly statement with summary and line-item cursors
    PROCEDURE get_monthly_statement(
        p_account_no         IN  VARCHAR2,
        p_year               IN  NUMBER,
        p_month              IN  NUMBER,
        o_account_cursor     OUT SYS_REFCURSOR,
        o_txns_cursor        OUT SYS_REFCURSOR
    );

    -- Branch-wise performance using BULK COLLECT
    PROCEDURE get_branch_performance(
        o_cursor             OUT SYS_REFCURSOR
    );

    -- Loan defaulters: Active/Disbursed loans with overdue or zero repayment in > 60 days
    PROCEDURE get_loan_defaulters(
        o_cursor             OUT SYS_REFCURSOR
    );

    -- Account type distribution for Donut Chart
    PROCEDURE get_account_distribution(
        o_cursor             OUT SYS_REFCURSOR
    );
END PKG_REPORT;
/

-- ============================================================================
-- PACKAGE 4: PKG_REPORT (BODY)
-- ============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_REPORT AS

    PROCEDURE get_dashboard_metrics(
        o_total_customers    OUT NUMBER,
        o_total_deposits     OUT NUMBER,
        o_active_loans       OUT NUMBER,
        o_today_transactions OUT NUMBER,
        o_total_accounts     OUT NUMBER
    ) IS
    BEGIN
        SELECT COUNT(1) INTO o_total_customers FROM CUSTOMERS WHERE status = 'ACTIVE';
        SELECT NVL(SUM(balance), 0) INTO o_total_deposits FROM ACCOUNTS WHERE status <> 'CLOSED';
        SELECT COUNT(1) INTO o_active_loans FROM LOANS WHERE status IN ('APPROVED', 'DISBURSED');
        SELECT COUNT(1) INTO o_today_transactions FROM TRANSACTIONS WHERE TRUNC(created_at) = TRUNC(SYSDATE);
        SELECT COUNT(1) INTO o_total_accounts FROM ACCOUNTS WHERE status = 'ACTIVE';
    END get_dashboard_metrics;

    PROCEDURE get_monthly_statement(
        p_account_no         IN  VARCHAR2,
        p_year               IN  NUMBER,
        p_month              IN  NUMBER,
        o_account_cursor     OUT SYS_REFCURSOR,
        o_txns_cursor        OUT SYS_REFCURSOR
    ) IS
        v_start_date DATE;
        v_end_date   DATE;
    BEGIN
        v_start_date := TO_DATE(p_year || '-' || LPAD(p_month, 2, '0') || '-01', 'YYYY-MM-DD');
        v_end_date   := LAST_DAY(v_start_date);

        -- Header Account Details
        OPEN o_account_cursor FOR
            SELECT a.account_id, a.account_number, a.account_type, a.balance,
                   c.first_name || ' ' || c.last_name AS customer_name,
                   c.customer_number, c.email, c.address, c.city,
                   b.branch_name, b.ifsc_code
            FROM ACCOUNTS a
            JOIN CUSTOMERS c ON a.customer_id = c.customer_id
            JOIN BRANCHES b  ON a.branch_id = b.branch_id
            WHERE a.account_number = p_account_no;

        -- Statement Transactions
        OPEN o_txns_cursor FOR
            SELECT t.transaction_id, t.reference_number, t.transaction_type,
                   t.amount, t.balance_after, t.channel, t.description,
                   t.created_at
            FROM TRANSACTIONS t
            JOIN ACCOUNTS a ON t.account_id = a.account_id
            WHERE a.account_number = p_account_no
              AND TRUNC(t.created_at) BETWEEN v_start_date AND v_end_date
            ORDER BY t.created_at ASC;
    END get_monthly_statement;

    -- Demonstrates PL/SQL BULK COLLECT
    PROCEDURE get_branch_performance(
        o_cursor             OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN o_cursor FOR
            SELECT b.branch_id, b.branch_code, b.branch_name, b.city,
                   COUNT(DISTINCT a.account_id) AS total_accounts,
                   NVL(SUM(a.balance), 0)       AS total_deposits,
                   COUNT(DISTINCT l.loan_id)    AS total_loans,
                   NVL(SUM(l.principal_amount), 0) AS total_loan_volume
            FROM BRANCHES b
            LEFT JOIN ACCOUNTS a ON b.branch_id = a.branch_id AND a.status <> 'CLOSED'
            LEFT JOIN LOANS l    ON b.branch_id = l.branch_id AND l.status IN ('APPROVED', 'DISBURSED')
            GROUP BY b.branch_id, b.branch_code, b.branch_name, b.city
            ORDER BY total_deposits DESC;
    END get_branch_performance;

    PROCEDURE get_loan_defaulters(
        o_cursor             OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN o_cursor FOR
            SELECT l.loan_id, l.loan_reference, l.loan_type, l.principal_amount,
                   l.remaining_balance, l.applied_date, l.status,
                   c.customer_id, c.first_name || ' ' || c.last_name AS customer_name,
                   c.phone, c.email,
                   a.account_number,
                   NVL(MAX(p.payment_date), l.approved_date) AS last_payment_date,
                   ROUND(SYSDATE - NVL(MAX(p.payment_date), l.approved_date)) AS days_overdue
            FROM LOANS l
            JOIN CUSTOMERS c ON l.customer_id = c.customer_id
            JOIN ACCOUNTS a  ON l.account_id = a.account_id
            LEFT JOIN LOAN_PAYMENTS p ON l.loan_id = p.loan_id
            WHERE l.status = 'DISBURSED'
            GROUP BY l.loan_id, l.loan_reference, l.loan_type, l.principal_amount,
                     l.remaining_balance, l.applied_date, l.status,
                     c.customer_id, c.first_name, c.last_name, c.phone, c.email,
                     a.account_number, l.approved_date
            HAVING (SYSDATE - NVL(MAX(p.payment_date), l.approved_date)) > 30
            ORDER BY days_overdue DESC;
    END get_loan_defaulters;

    PROCEDURE get_account_distribution(
        o_cursor             OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN o_cursor FOR
            SELECT account_type,
                   COUNT(1) AS count,
                   NVL(SUM(balance), 0) AS total_balance
            FROM ACCOUNTS
            WHERE status = 'ACTIVE'
            GROUP BY account_type
            ORDER BY count DESC;
    END get_account_distribution;

END PKG_REPORT;
/
