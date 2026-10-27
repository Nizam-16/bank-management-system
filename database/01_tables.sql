-- ============================================================================
-- SCRIPT: 01_tables.sql
-- DESCRIPTION: DDL for Bank Management System Tables with PK, FK, CHECK, UNIQUE,
--              NOT NULL constraints, column comments, and performance indexes.
-- COMPATIBILITY: Oracle Database 19c / 21c XE
-- ============================================================================

-- Drop tables in reverse dependency order for clean recreation
BEGIN
    FOR t IN (SELECT table_name FROM user_tables WHERE table_name IN (
        'AUDIT_LOG', 'LOAN_PAYMENTS', 'LOANS', 'TRANSACTIONS', 
        'ACCOUNTS', 'CUSTOMERS', 'EMPLOYEES', 'BRANCHES'
    )) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
    END LOOP;
END;
/

-- ---------------------------------------------------------------------------
-- 1. BRANCHES TABLE
-- Stores bank branch details and location identifiers.
-- ---------------------------------------------------------------------------
CREATE TABLE BRANCHES (
    branch_id          NUMBER(10)          NOT NULL,
    branch_code        VARCHAR2(20)        NOT NULL,
    branch_name        VARCHAR2(100)       NOT NULL,
    ifsc_code          VARCHAR2(20)        NOT NULL,
    address            VARCHAR2(255)       NOT NULL,
    city               VARCHAR2(50)        NOT NULL,
    state              VARCHAR2(50)        NOT NULL,
    postal_code        VARCHAR2(20)        NOT NULL,
    phone              VARCHAR2(20)        NOT NULL,
    email              VARCHAR2(100)       NOT NULL,
    created_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_branches PRIMARY KEY (branch_id),
    CONSTRAINT uq_branch_code UNIQUE (branch_code),
    CONSTRAINT uq_branch_ifsc UNIQUE (ifsc_code)
);

COMMENT ON TABLE BRANCHES IS 'Physical and virtual branches of the bank.';
COMMENT ON COLUMN BRANCHES.branch_code IS 'Unique code assigned to each branch e.g., BR-001.';
COMMENT ON COLUMN BRANCHES.ifsc_code IS 'Routing / IFSC identification string.';

-- ---------------------------------------------------------------------------
-- 2. EMPLOYEES TABLE
-- System users including Admin, Tellers, and Loan Officers.
-- ---------------------------------------------------------------------------
CREATE TABLE EMPLOYEES (
    employee_id        NUMBER(10)          NOT NULL,
    branch_id          NUMBER(10)          NOT NULL,
    employee_code      VARCHAR2(20)        NOT NULL,
    first_name         VARCHAR2(50)        NOT NULL,
    last_name          VARCHAR2(50)        NOT NULL,
    email              VARCHAR2(100)       NOT NULL,
    password_hash      VARCHAR2(255)       NOT NULL,
    role               VARCHAR2(20)        NOT NULL,
    status             VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_employees PRIMARY KEY (employee_id),
    CONSTRAINT uq_employee_code UNIQUE (employee_code),
    CONSTRAINT uq_employee_email UNIQUE (email),
    CONSTRAINT fk_emp_branch FOREIGN KEY (branch_id) REFERENCES BRANCHES(branch_id),
    CONSTRAINT chk_emp_role CHECK (role IN ('ADMIN', 'TELLER', 'LOAN_OFFICER', 'MANAGER')),
    CONSTRAINT chk_emp_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

COMMENT ON TABLE EMPLOYEES IS 'Bank staff and operational personnel with RBAC credentials.';

-- ---------------------------------------------------------------------------
-- 3. CUSTOMERS TABLE
-- Bank account holders and loan applicants.
-- ---------------------------------------------------------------------------
CREATE TABLE CUSTOMERS (
    customer_id        NUMBER(10)          NOT NULL,
    branch_id          NUMBER(10)          NOT NULL,
    customer_number    VARCHAR2(20)        NOT NULL,
    first_name         VARCHAR2(50)        NOT NULL,
    last_name          VARCHAR2(50)        NOT NULL,
    email              VARCHAR2(100)       NOT NULL,
    phone              VARCHAR2(20)        NOT NULL,
    national_id        VARCHAR2(50)        NOT NULL,
    date_of_birth      DATE                NOT NULL,
    address            VARCHAR2(255)       NOT NULL,
    city               VARCHAR2(50)        NOT NULL,
    state              VARCHAR2(50)        NOT NULL,
    postal_code        VARCHAR2(20)        NOT NULL,
    occupation         VARCHAR2(50),
    annual_income      NUMBER(14,2) DEFAULT 0.00,
    kyc_status         VARCHAR2(20) DEFAULT 'VERIFIED' NOT NULL,
    status             VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    password_hash      VARCHAR2(255),
    created_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_customers PRIMARY KEY (customer_id),
    CONSTRAINT uq_cust_number UNIQUE (customer_number),
    CONSTRAINT uq_cust_email UNIQUE (email),
    CONSTRAINT uq_cust_nat_id UNIQUE (national_id),
    CONSTRAINT fk_cust_branch FOREIGN KEY (branch_id) REFERENCES BRANCHES(branch_id),
    CONSTRAINT chk_cust_kyc CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    CONSTRAINT chk_cust_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED'))
);

COMMENT ON TABLE CUSTOMERS IS 'Core customer profiles containing demographic, KYC and compliance records.';

-- ---------------------------------------------------------------------------
-- 4. ACCOUNTS TABLE
-- Savings, Current, Business, and Fixed Deposit accounts.
-- ---------------------------------------------------------------------------
CREATE TABLE ACCOUNTS (
    account_id         NUMBER(10)          NOT NULL,
    customer_id        NUMBER(10)          NOT NULL,
    branch_id          NUMBER(10)          NOT NULL,
    account_number     VARCHAR2(30)        NOT NULL,
    account_type       VARCHAR2(20)        NOT NULL,
    balance            NUMBER(15,2) DEFAULT 0.00 NOT NULL,
    currency           VARCHAR2(10) DEFAULT 'USD' NOT NULL,
    status             VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    interest_rate      NUMBER(5,2)  DEFAULT 0.00 NOT NULL,
    opened_date        DATE DEFAULT SYSDATE NOT NULL,
    closed_date        DATE,
    last_activity_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    created_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_accounts PRIMARY KEY (account_id),
    CONSTRAINT uq_account_number UNIQUE (account_number),
    CONSTRAINT fk_acc_customer FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id),
    CONSTRAINT fk_acc_branch FOREIGN KEY (branch_id) REFERENCES BRANCHES(branch_id),
    CONSTRAINT chk_acc_type CHECK (account_type IN ('SAVINGS', 'CURRENT', 'BUSINESS', 'SALARY', 'FIXED_DEPOSIT')),
    CONSTRAINT chk_acc_status CHECK (status IN ('ACTIVE', 'FROZEN', 'CLOSED', 'DORMANT')),
    CONSTRAINT chk_acc_balance CHECK (balance >= 0)
);

COMMENT ON TABLE ACCOUNTS IS 'Ledger accounts associated with customers. Balance constraint balance >= 0 strictly enforced.';

-- ---------------------------------------------------------------------------
-- 5. TRANSACTIONS TABLE
-- Financial ledger tracking deposits, withdrawals, transfers, and loan EMI payments.
-- ---------------------------------------------------------------------------
CREATE TABLE TRANSACTIONS (
    transaction_id     NUMBER(12)          NOT NULL,
    account_id         NUMBER(10)          NOT NULL,
    reference_number   VARCHAR2(50)        NOT NULL,
    transaction_type   VARCHAR2(20)        NOT NULL,
    amount             NUMBER(15,2)        NOT NULL,
    balance_after      NUMBER(15,2)        NOT NULL,
    destination_acc_id NUMBER(10),
    channel            VARCHAR2(20) DEFAULT 'ONLINE' NOT NULL,
    description        VARCHAR2(255),
    status             VARCHAR2(20) DEFAULT 'COMPLETED' NOT NULL,
    created_by         VARCHAR2(50) DEFAULT 'SYSTEM' NOT NULL,
    created_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_transactions PRIMARY KEY (transaction_id),
    CONSTRAINT uq_txn_ref UNIQUE (reference_number),
    CONSTRAINT fk_txn_account FOREIGN KEY (account_id) REFERENCES ACCOUNTS(account_id),
    CONSTRAINT fk_txn_dest_acc FOREIGN KEY (destination_acc_id) REFERENCES ACCOUNTS(account_id),
    CONSTRAINT chk_txn_type CHECK (transaction_type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'FEE')),
    CONSTRAINT chk_txn_channel CHECK (channel IN ('ONLINE', 'ATM', 'BRANCH', 'MOBILE', 'SYSTEM')),
    CONSTRAINT chk_txn_status CHECK (status IN ('COMPLETED', 'PENDING', 'FAILED', 'REVERSED')),
    CONSTRAINT chk_txn_amount CHECK (amount > 0)
);

COMMENT ON TABLE TRANSACTIONS IS 'Immutable record of financial transactions affecting account balances.';

-- ---------------------------------------------------------------------------
-- 6. LOANS TABLE
-- Customer credit facilities, loan tenure, EMI computations, and life-cycle state.
-- ---------------------------------------------------------------------------
CREATE TABLE LOANS (
    loan_id            NUMBER(10)          NOT NULL,
    customer_id        NUMBER(10)          NOT NULL,
    account_id         NUMBER(10)          NOT NULL,
    branch_id          NUMBER(10)          NOT NULL,
    loan_reference     VARCHAR2(30)        NOT NULL,
    loan_type          VARCHAR2(30)        NOT NULL,
    principal_amount   NUMBER(14,2)        NOT NULL,
    interest_rate      NUMBER(5,2)         NOT NULL,
    term_months        NUMBER(4)           NOT NULL,
    emi_amount         NUMBER(12,2)        NOT NULL,
    total_payable      NUMBER(14,2)        NOT NULL,
    total_paid         NUMBER(14,2) DEFAULT 0.00 NOT NULL,
    remaining_balance  NUMBER(14,2)        NOT NULL,
    status             VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    applied_date       DATE DEFAULT SYSDATE NOT NULL,
    approved_date      DATE,
    approved_by        NUMBER(10),
    remarks            VARCHAR2(255),
    created_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_loans PRIMARY KEY (loan_id),
    CONSTRAINT uq_loan_ref UNIQUE (loan_reference),
    CONSTRAINT fk_loan_cust FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id),
    CONSTRAINT fk_loan_acc FOREIGN KEY (account_id) REFERENCES ACCOUNTS(account_id),
    CONSTRAINT fk_loan_branch FOREIGN KEY (branch_id) REFERENCES BRANCHES(branch_id),
    CONSTRAINT fk_loan_approver FOREIGN KEY (approved_by) REFERENCES EMPLOYEES(employee_id),
    CONSTRAINT chk_loan_type CHECK (loan_type IN ('PERSONAL', 'HOME', 'AUTO', 'BUSINESS', 'EDUCATION')),
    CONSTRAINT chk_loan_status CHECK (status IN ('PENDING', 'APPROVED', 'DISBURSED', 'REJECTED', 'CLOSED', 'DEFAULTED')),
    CONSTRAINT chk_loan_principal CHECK (principal_amount > 0),
    CONSTRAINT chk_loan_term CHECK (term_months > 0),
    CONSTRAINT chk_loan_rate CHECK (interest_rate >= 0)
);

COMMENT ON TABLE LOANS IS 'Loan portfolio records including calculated EMIs and repayment milestones.';

-- ---------------------------------------------------------------------------
-- 7. LOAN_PAYMENTS TABLE
-- EMI repayment ledger tracking principal and interest splits.
-- ---------------------------------------------------------------------------
CREATE TABLE LOAN_PAYMENTS (
    payment_id         NUMBER(10)          NOT NULL,
    loan_id            NUMBER(10)          NOT NULL,
    payment_number     NUMBER(4)           NOT NULL,
    amount_paid        NUMBER(12,2)        NOT NULL,
    principal_paid     NUMBER(12,2)        NOT NULL,
    interest_paid      NUMBER(12,2)        NOT NULL,
    balance_remaining  NUMBER(14,2)        NOT NULL,
    payment_date       DATE DEFAULT SYSDATE NOT NULL,
    source_account_id  NUMBER(10),
    payment_method     VARCHAR2(30) DEFAULT 'AUTO_DEBIT' NOT NULL,
    status             VARCHAR2(20) DEFAULT 'COMPLETED' NOT NULL,
    created_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_loan_payments PRIMARY KEY (payment_id),
    CONSTRAINT fk_pay_loan FOREIGN KEY (loan_id) REFERENCES LOANS(loan_id),
    CONSTRAINT fk_pay_src_acc FOREIGN KEY (source_account_id) REFERENCES ACCOUNTS(account_id),
    CONSTRAINT chk_pay_amount CHECK (amount_paid > 0),
    CONSTRAINT chk_pay_status CHECK (status IN ('COMPLETED', 'FAILED', 'PENDING'))
);

COMMENT ON TABLE LOAN_PAYMENTS IS 'Periodic installment payment ledger for loans.';

-- ---------------------------------------------------------------------------
-- 8. AUDIT_LOG TABLE
-- Security, compliance, and event auditing automatically populated by triggers.
-- ---------------------------------------------------------------------------
CREATE TABLE AUDIT_LOG (
    audit_id           NUMBER(12)          NOT NULL,
    table_name         VARCHAR2(50)        NOT NULL,
    action_type        VARCHAR2(20)        NOT NULL,
    entity_id          VARCHAR2(50)        NOT NULL,
    old_values         CLOB,
    new_values         CLOB,
    changed_by         VARCHAR2(100) DEFAULT USER NOT NULL,
    changed_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    ip_address         VARCHAR2(50),
    description        VARCHAR2(500),
    CONSTRAINT pk_audit_log PRIMARY KEY (audit_id),
    CONSTRAINT chk_audit_action CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE', 'SECURITY', 'PROCEDURE_EXEC'))
);

COMMENT ON TABLE AUDIT_LOG IS 'Immutable audit trail capturing all critical data mutations triggered at database level.';

-- ---------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- Optimize lookups on Foreign Keys, Account Numbers, and frequent filters
-- ---------------------------------------------------------------------------
CREATE INDEX idx_emp_branch_id ON EMPLOYEES(branch_id);
CREATE INDEX idx_cust_branch_id ON CUSTOMERS(branch_id);
CREATE INDEX idx_cust_email ON CUSTOMERS(email);
CREATE INDEX idx_acc_customer_id ON ACCOUNTS(customer_id);
CREATE INDEX idx_acc_branch_id ON ACCOUNTS(branch_id);
CREATE INDEX idx_acc_status ON ACCOUNTS(status);
CREATE INDEX idx_txn_account_id ON TRANSACTIONS(account_id);
CREATE INDEX idx_txn_created_at ON TRANSACTIONS(created_at);
CREATE INDEX idx_txn_type ON TRANSACTIONS(transaction_type);
CREATE INDEX idx_txn_ref ON TRANSACTIONS(reference_number);
CREATE INDEX idx_loan_cust_id ON LOANS(customer_id);
CREATE INDEX idx_loan_acc_id ON LOANS(account_id);
CREATE INDEX idx_loan_status ON LOANS(status);
CREATE INDEX idx_pay_loan_id ON LOAN_PAYMENTS(loan_id);
CREATE INDEX idx_audit_table_action ON AUDIT_LOG(table_name, action_type);
CREATE INDEX idx_audit_changed_at ON AUDIT_LOG(changed_at);
