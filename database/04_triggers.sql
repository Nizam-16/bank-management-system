-- ============================================================================
-- SCRIPT: 04_triggers.sql
-- DESCRIPTION: Database Triggers for:
--              1. Preventing negative balance (BEFORE UPDATE/INSERT)
--              2. Auto-updating account last_activity_date (AFTER INSERT ON TRANSACTIONS)
--              3. Audit logging for ACCOUNTS mutations
--              4. Audit logging for financial TRANSACTIONS
--              5. Audit logging for LOANS state changes
-- COMPATIBILITY: Oracle Database 19c / 21c XE
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. TRG_CHECK_ACCOUNT_BALANCE
-- BEFORE INSERT OR UPDATE ON ACCOUNTS
-- Enforces integrity by rejecting any negative balance at the trigger layer.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_CHECK_ACCOUNT_BALANCE
BEFORE INSERT OR UPDATE OF balance ON ACCOUNTS
FOR EACH ROW
BEGIN
    IF :NEW.balance < 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 
            'Trigger Violation: Account balance cannot fall below zero. Account: ' || 
            :NEW.account_number || ', Rejected Balance: ' || :NEW.balance
        );
    END IF;
END;
/

-- ---------------------------------------------------------------------------
-- 2. TRG_UPDATE_ACCOUNT_ACTIVITY
-- AFTER INSERT ON TRANSACTIONS
-- Automatically refreshes the last_activity_date on the impacted account.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_UPDATE_ACCOUNT_ACTIVITY
AFTER INSERT ON TRANSACTIONS
FOR EACH ROW
BEGIN
    UPDATE ACCOUNTS
    SET last_activity_date = :NEW.created_at
    WHERE account_id = :NEW.account_id;
END;
/

-- ---------------------------------------------------------------------------
-- 3. TRG_AUDIT_ACCOUNTS
-- AFTER INSERT OR UPDATE OR DELETE ON ACCOUNTS
-- Automatically captures lifecycle and balance changes into AUDIT_LOG.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_AUDIT_ACCOUNTS
AFTER INSERT OR UPDATE OR DELETE ON ACCOUNTS
FOR EACH ROW
DECLARE
    v_action VARCHAR2(20);
    v_desc   VARCHAR2(500);
    v_entity VARCHAR2(50);
BEGIN
    IF INSERTING THEN
        v_action := 'INSERT';
        v_entity := :NEW.account_number;
        v_desc   := 'New account created. Initial Balance: ' || :NEW.balance || ' ' || :NEW.currency;
    ELSIF UPDATING THEN
        v_action := 'UPDATE';
        v_entity := :NEW.account_number;
        IF :OLD.balance <> :NEW.balance THEN
            v_desc := 'Balance updated from ' || :OLD.balance || ' to ' || :NEW.balance;
        ELSIF :OLD.status <> :NEW.status THEN
            v_desc := 'Status changed from ' || :OLD.status || ' to ' || :NEW.status;
        ELSE
            v_desc := 'Account profile modified.';
        END IF;
    ELSIF DELETING THEN
        v_action := 'DELETE';
        v_entity := :OLD.account_number;
        v_desc   := 'Account deleted. Final balance: ' || :OLD.balance;
    END IF;

    INSERT INTO AUDIT_LOG (
        audit_id, table_name, action_type, entity_id,
        changed_by, changed_at, description
    ) VALUES (
        SEQ_AUDIT_ID.NEXTVAL, 'ACCOUNTS', v_action, v_entity,
        USER, SYSTIMESTAMP, v_desc
    );
END;
/

-- ---------------------------------------------------------------------------
-- 4. TRG_AUDIT_TRANSACTIONS
-- AFTER INSERT ON TRANSACTIONS
-- Captures each financial transaction into compliance AUDIT_LOG.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_AUDIT_TRANSACTIONS
AFTER INSERT ON TRANSACTIONS
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOG (
        audit_id, table_name, action_type, entity_id,
        changed_by, changed_at, description
    ) VALUES (
        SEQ_AUDIT_ID.NEXTVAL, 'TRANSACTIONS', 'INSERT', :NEW.reference_number,
        NVL(:NEW.created_by, USER), SYSTIMESTAMP,
        :NEW.transaction_type || ' of ' || :NEW.amount || ' via ' || :NEW.channel || 
        '. Balance after: ' || :NEW.balance_after
    );
END;
/

-- ---------------------------------------------------------------------------
-- 5. TRG_AUDIT_LOANS
-- AFTER UPDATE OF status ON LOANS
-- Records loan state transitions (e.g., PENDING -> DISBURSED, CLOSED).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_AUDIT_LOANS
AFTER UPDATE OF status ON LOANS
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOG (
        audit_id, table_name, action_type, entity_id,
        changed_by, changed_at, description
    ) VALUES (
        SEQ_AUDIT_ID.NEXTVAL, 'LOANS', 'UPDATE', :NEW.loan_reference,
        USER, SYSTIMESTAMP,
        'Loan status transitioned from ' || :OLD.status || ' to ' || :NEW.status ||
        '. Remaining Balance: ' || :NEW.remaining_balance
    );
END;
/
