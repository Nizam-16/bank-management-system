-- ============================================================================
-- SCRIPT: 02_sequences.sql
-- DESCRIPTION: Sequences for all primary keys in the Bank Management System.
-- COMPATIBILITY: Oracle Database 19c / 21c XE
-- ============================================================================

-- Drop sequences if they already exist
BEGIN
    FOR s IN (SELECT sequence_name FROM user_sequences WHERE sequence_name IN (
        'SEQ_BRANCH_ID', 'SEQ_EMPLOYEE_ID', 'SEQ_CUSTOMER_ID', 
        'SEQ_ACCOUNT_ID', 'SEQ_TRANSACTION_ID', 'SEQ_LOAN_ID', 
        'SEQ_PAYMENT_ID', 'SEQ_AUDIT_ID'
    )) LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || s.sequence_name;
    END LOOP;
END;
/

-- Sequence for Branch identifiers (e.g., 1, 2, 3...)
CREATE SEQUENCE SEQ_BRANCH_ID
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Sequence for Employee identifiers
CREATE SEQUENCE SEQ_EMPLOYEE_ID
    START WITH 1001
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Sequence for Customer identifiers
CREATE SEQUENCE SEQ_CUSTOMER_ID
    START WITH 2001
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Sequence for Account identifiers
CREATE SEQUENCE SEQ_ACCOUNT_ID
    START WITH 3001
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Sequence for Financial Transaction identifiers
CREATE SEQUENCE SEQ_TRANSACTION_ID
    START WITH 100001
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Sequence for Loan application identifiers
CREATE SEQUENCE SEQ_LOAN_ID
    START WITH 5001
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Sequence for Loan EMI payments
CREATE SEQUENCE SEQ_PAYMENT_ID
    START WITH 7001
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Sequence for Audit Log entries
CREATE SEQUENCE SEQ_AUDIT_ID
    START WITH 900001
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;
