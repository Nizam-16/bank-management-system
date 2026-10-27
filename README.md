# PL/SQL Bank Management System

## Project Overview
This project is a complete PL/SQL-based Bank Management System designed for Oracle Database. It handles customer registration, account opening, monetary transactions (deposits, withdrawals, transfers), and account balance inquiries with robust transaction safety and exception handling.

## Files Included
- `bank_management_system.sql`: The complete SQL script containing:
  - Table definitions (`customers`, `accounts`, `transactions`)
  - PL/SQL Package Specification (`bank_pkg`)
  - PL/SQL Package Body (`bank_pkg`)
  - Test Block for verification

## Setup & Execution Guide
1. Open your Oracle Database IDE (Oracle SQL Developer, SQL*Plus, or Oracle Live SQL).
2. Connect to your database instance.
3. Open `bank_management_system.sql`.
4. Ensure `SET SERVEROUTPUT ON;` is enabled to view output logs.
5. Execute the script to create tables, compile the package, and run the test block.
