-- ============================================================================
-- MASTER INITIALIZATION SCRIPT: 00_init.sql
-- DESCRIPTION: Executes all database scripts in strict dependency sequence.
-- USAGE IN SQL*PLUS / SQLCL:
--   sqlplus sys/Oradoc_db1@localhost:1521/XEPDB1 as sysdba
--   @00_init.sql
-- ============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
SET FEEDBACK ON;
SET ECHO ON;

PROMPT ============================================================================
PROMPT 1. CREATING TABLES AND CONSTRAINTS...
PROMPT ============================================================================
@@01_tables.sql

PROMPT ============================================================================
PROMPT 2. CREATING SEQUENCES...
PROMPT ============================================================================
@@02_sequences.sql

PROMPT ============================================================================
PROMPT 3. CREATING PL/SQL PACKAGES (SPECS AND BODIES)...
PROMPT ============================================================================
@@03_packages.sql

PROMPT ============================================================================
PROMPT 4. CREATING DATABASE TRIGGERS...
PROMPT ============================================================================
@@04_triggers.sql

PROMPT ============================================================================
PROMPT 5. SEEDING INITIAL DATA (BRANCHES, USERS, CUSTOMERS, ACCOUNTS, TXNS, LOANS)...
PROMPT ============================================================================
@@05_seed_data.sql

PROMPT ============================================================================
PROMPT 6. CREATING DATABASE VIEWS...
PROMPT ============================================================================
@@06_views.sql

PROMPT ============================================================================
PROMPT DATABASE INITIALIZATION COMPLETE!
PROMPT All tables, sequences, packages, triggers, views, and seed records created.
PROMPT ============================================================================
COMMIT;
