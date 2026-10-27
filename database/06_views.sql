-- ============================================================================
-- SCRIPT: 06_views.sql
-- DESCRIPTION: Database Views for reporting, statements, and operational overview
-- COMPATIBILITY: Oracle Database 19c / 21c XE
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. VW_MONTHLY_STATEMENTS
-- Consolidated view of monthly account statement summaries
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_MONTHLY_STATEMENTS AS
SELECT 
    TO_CHAR(t.created_at, 'YYYY-MM') AS statement_month,
    a.account_id,
    a.account_number,
    a.account_type,
    c.customer_id,
    c.customer_number,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.email AS customer_email,
    b.branch_name,
    COUNT(t.transaction_id) AS total_transactions,
    NVL(SUM(CASE WHEN t.transaction_type IN ('DEPOSIT', 'TRANSFER_IN', 'LOAN_DISBURSEMENT') THEN t.amount ELSE 0 END), 0) AS total_credits,
    NVL(SUM(CASE WHEN t.transaction_type IN ('WITHDRAWAL', 'TRANSFER_OUT', 'LOAN_REPAYMENT', 'FEE') THEN t.amount ELSE 0 END), 0) AS total_debits,
    MAX(t.balance_after) KEEP (DENSE_RANK LAST ORDER BY t.created_at) AS closing_balance
FROM ACCOUNTS a
JOIN CUSTOMERS c ON a.customer_id = c.customer_id
JOIN BRANCHES b  ON a.branch_id = b.branch_id
LEFT JOIN TRANSACTIONS t ON a.account_id = t.account_id
GROUP BY 
    TO_CHAR(t.created_at, 'YYYY-MM'),
    a.account_id,
    a.account_number,
    a.account_type,
    c.customer_id,
    c.customer_number,
    c.first_name,
    c.last_name,
    c.email,
    b.branch_name;

COMMENT ON TABLE VW_MONTHLY_STATEMENTS IS 'Aggregated monthly statement data per account with credit/debit breakdowns.';

-- ---------------------------------------------------------------------------
-- 2. VW_LOAN_SUMMARY
-- Real-time loan portfolio overview with progress metrics
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_LOAN_SUMMARY AS
SELECT 
    l.loan_id,
    l.loan_reference,
    l.loan_type,
    l.principal_amount,
    l.interest_rate,
    l.term_months,
    l.emi_amount,
    l.total_payable,
    l.total_paid,
    l.remaining_balance,
    CASE 
        WHEN l.total_payable > 0 THEN ROUND((l.total_paid / l.total_payable) * 100, 2)
        ELSE 0 
    END AS repayment_progress_pct,
    l.status,
    l.applied_date,
    l.approved_date,
    c.customer_id,
    c.customer_number,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.phone AS customer_phone,
    c.email AS customer_email,
    a.account_number,
    b.branch_code,
    b.branch_name,
    COUNT(p.payment_id) AS total_installments_paid,
    MAX(p.payment_date) AS last_payment_date
FROM LOANS l
JOIN CUSTOMERS c ON l.customer_id = c.customer_id
JOIN ACCOUNTS a  ON l.account_id = a.account_id
JOIN BRANCHES b  ON l.branch_id = b.branch_id
LEFT JOIN LOAN_PAYMENTS p ON l.loan_id = p.loan_id
GROUP BY 
    l.loan_id,
    l.loan_reference,
    l.loan_type,
    l.principal_amount,
    l.interest_rate,
    l.term_months,
    l.emi_amount,
    l.total_payable,
    l.total_paid,
    l.remaining_balance,
    l.status,
    l.applied_date,
    l.approved_date,
    c.customer_id,
    c.customer_number,
    c.first_name,
    c.last_name,
    c.phone,
    c.email,
    a.account_number,
    b.branch_code,
    b.branch_name;

COMMENT ON TABLE VW_LOAN_SUMMARY IS 'Holistic view of all loan portfolios, progress percentage, and payments.';

-- ---------------------------------------------------------------------------
-- 3. VW_BRANCH_PERFORMANCE
-- Cross-branch deposit and loan volume comparison
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_BRANCH_PERFORMANCE AS
SELECT 
    b.branch_id,
    b.branch_code,
    b.branch_name,
    b.city,
    b.state,
    COUNT(DISTINCT c.customer_id)   AS total_customers,
    COUNT(DISTINCT a.account_id)    AS total_accounts,
    NVL(SUM(a.balance), 0)          AS total_deposits,
    COUNT(DISTINCT l.loan_id)       AS total_loans,
    NVL(SUM(l.principal_amount), 0) AS total_loan_disbursed,
    NVL(SUM(l.remaining_balance), 0) AS outstanding_loan_risk
FROM BRANCHES b
LEFT JOIN CUSTOMERS c ON b.branch_id = c.branch_id
LEFT JOIN ACCOUNTS a  ON b.branch_id = a.branch_id AND a.status <> 'CLOSED'
LEFT JOIN LOANS l     ON b.branch_id = l.branch_id AND l.status IN ('APPROVED', 'DISBURSED')
GROUP BY 
    b.branch_id,
    b.branch_code,
    b.branch_name,
    b.city,
    b.state;

COMMENT ON TABLE VW_BRANCH_PERFORMANCE IS 'High-level branch performance metrics for executive reporting.';

-- ---------------------------------------------------------------------------
-- 4. VW_ACCOUNT_OVERVIEW
-- Comprehensive account information with customer and balance health
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_ACCOUNT_OVERVIEW AS
SELECT 
    a.account_id,
    a.account_number,
    a.account_type,
    a.balance,
    a.currency,
    a.status,
    a.interest_rate,
    a.opened_date,
    a.last_activity_date,
    c.customer_id,
    c.customer_number,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.email,
    c.phone,
    c.kyc_status,
    b.branch_id,
    b.branch_code,
    b.branch_name,
    (SELECT COUNT(1) FROM TRANSACTIONS t WHERE t.account_id = a.account_id) AS total_transactions_count
FROM ACCOUNTS a
JOIN CUSTOMERS c ON a.customer_id = c.customer_id
JOIN BRANCHES b  ON a.branch_id = b.branch_id;

COMMENT ON TABLE VW_ACCOUNT_OVERVIEW IS 'Detailed view linking accounts, holders, branches and transaction counts.';
