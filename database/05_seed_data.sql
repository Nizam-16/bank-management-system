-- ============================================================================
-- SCRIPT: 05_seed_data.sql
-- DESCRIPTION: Initial seed data for Bank Management System:
--              - 3 Branches
--              - 4 System Employees / Users (Admin, Teller, Loan Officer, Manager)
--              - 25 Detailed Customer profiles
--              - 35 Bank Accounts across multiple currencies and categories
--              - 60+ Financial Transactions (Past 30 days)
--              - 10 Loans across stages with EMI repayments
-- COMPATIBILITY: Oracle Database 19c / 21c XE
-- ============================================================================

-- Disable triggers temporarily during bulk seed to allow explicit ID insertion
ALTER TRIGGER TRG_AUDIT_ACCOUNTS DISABLE;
ALTER TRIGGER TRG_AUDIT_TRANSACTIONS DISABLE;
ALTER TRIGGER TRG_AUDIT_LOANS DISABLE;
ALTER TRIGGER TRG_UPDATE_ACCOUNT_ACTIVITY DISABLE;

-- ---------------------------------------------------------------------------
-- 1. SEED BRANCHES
-- ---------------------------------------------------------------------------
INSERT INTO BRANCHES (branch_id, branch_code, branch_name, ifsc_code, address, city, state, postal_code, phone, email)
VALUES (1, 'NYC01', 'Metropolitan Financial Hub', 'APEX0001001', '100 Wall Street, Floor 14', 'New York', 'NY', '10005', '+1-212-555-0101', 'nyc-hub@apexbank.com');

INSERT INTO BRANCHES (branch_id, branch_code, branch_name, ifsc_code, address, city, state, postal_code, phone, email)
VALUES (2, 'SFO02', 'Silicon Valley Branch', 'APEX0002002', '500 Market Street, Suite 300', 'San Francisco', 'CA', '94105', '+1-415-555-0102', 'sfo-branch@apexbank.com');

INSERT INTO BRANCHES (branch_id, branch_code, branch_name, ifsc_code, address, city, state, postal_code, phone, email)
VALUES (3, 'CHI03', 'Midwest Commercial Center', 'APEX0003003', '233 S Wacker Dr, 22nd Fl', 'Chicago', 'IL', '60606', '+1-312-555-0103', 'chi-center@apexbank.com');

-- ---------------------------------------------------------------------------
-- 2. SEED EMPLOYEES
-- Passwords hashed with bcrypt for "password123" ($2a$10$wKqC... or $2b$10$epRfZG5egPtVU3v9.UvPguL8z9X4gQvP7l0lO5mQzK5ZJb9V3QYm2)
-- ---------------------------------------------------------------------------
INSERT INTO EMPLOYEES (employee_id, branch_id, employee_code, first_name, last_name, email, password_hash, role, status)
VALUES (1001, 1, 'EMP-ADM-01', 'Alexander', 'Vance', 'admin@bank.com', '$2b$10$G0Nf/TfvQom0eAkn2oZ7cOHU6N.V26vVfL3qY4mGqRvyUeZ6cOlyS', 'ADMIN', 'ACTIVE');

INSERT INTO EMPLOYEES (employee_id, branch_id, employee_code, first_name, last_name, email, password_hash, role, status)
VALUES (1002, 1, 'EMP-TEL-01', 'Sarah', 'Jenkins', 'teller@bank.com', '$2b$10$G0Nf/TfvQom0eAkn2oZ7cOHU6N.V26vVfL3qY4mGqRvyUeZ6cOlyS', 'TELLER', 'ACTIVE');

INSERT INTO EMPLOYEES (employee_id, branch_id, employee_code, first_name, last_name, email, password_hash, role, status)
VALUES (1003, 2, 'EMP-LNO-01', 'David', 'Chen', 'loan@bank.com', '$2b$10$G0Nf/TfvQom0eAkn2oZ7cOHU6N.V26vVfL3qY4mGqRvyUeZ6cOlyS', 'LOAN_OFFICER', 'ACTIVE');

INSERT INTO EMPLOYEES (employee_id, branch_id, employee_code, first_name, last_name, email, password_hash, role, status)
VALUES (1004, 3, 'EMP-MGR-01', 'Elena', 'Rostova', 'manager@bank.com', '$2b$10$G0Nf/TfvQom0eAkn2oZ7cOHU6N.V26vVfL3qY4mGqRvyUeZ6cOlyS', 'MANAGER', 'ACTIVE');

-- ---------------------------------------------------------------------------
-- 3. SEED 25 CUSTOMERS
-- ---------------------------------------------------------------------------
INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2001, 1, 'CUST-002001', 'Michael', 'Scott', 'michael.scott@dundermifflin.com', '+1-570-555-0111', 'SSN-901-22-1111', TO_DATE('1975-03-15', 'YYYY-MM-DD'), '1725 Slough Ave', 'Scranton', 'PA', '18503', 'Regional Manager', 75000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2002, 1, 'CUST-002002', 'Jim', 'Halpert', 'jim.halpert@dundermifflin.com', '+1-570-555-0112', 'SSN-901-22-1112', TO_DATE('1982-10-01', 'YYYY-MM-DD'), '421 Linden St', 'Scranton', 'PA', '18503', 'Sales Representative', 68000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2003, 1, 'CUST-002003', 'Pam', 'Beesly', 'pam.beesly@dundermifflin.com', '+1-570-555-0113', 'SSN-901-22-1113', TO_DATE('1983-03-25', 'YYYY-MM-DD'), '421 Linden St', 'Scranton', 'PA', '18503', 'Office Administrator', 52000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2004, 1, 'CUST-002004', 'Dwight', 'Schrute', 'dwight.schrute@schrutebeetfarms.com', '+1-570-555-0114', 'SSN-901-22-1114', TO_DATE('1978-01-20', 'YYYY-MM-DD'), 'Schrute Farms, Route 6', 'Honesdale', 'PA', '18431', 'Agri-Business Owner', 125000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2005, 2, 'CUST-002005', 'Tony', 'Stark', 'tony@starkindustries.io', '+1-310-555-0120', 'SSN-901-33-2001', TO_DATE('1970-05-29', 'YYYY-MM-DD'), '10880 Malibu Point', 'Malibu', 'CA', '90265', 'Chief Executive Officer', 1500000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2006, 2, 'CUST-002006', 'Pepper', 'Potts', 'pepper@starkindustries.io', '+1-310-555-0121', 'SSN-901-33-2002', TO_DATE('1974-09-12', 'YYYY-MM-DD'), '10880 Malibu Point', 'Malibu', 'CA', '90265', 'Corporate Executive', 450000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2007, 2, 'CUST-002007', 'Bruce', 'Wayne', 'bruce@wayneenterprises.com', '+1-201-555-0130', 'SSN-901-44-3001', TO_DATE('1979-02-19', 'YYYY-MM-DD'), '1007 Mountain Drive', 'Gotham', 'NJ', '07001', 'Venture Capitalist', 2500000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2008, 2, 'CUST-002008', 'Clark', 'Kent', 'clark.kent@dailyplanet.com', '+1-212-555-0140', 'SSN-901-44-3002', TO_DATE('1984-06-18', 'YYYY-MM-DD'), '344 Clinton St, Apt 3B', 'Metropolis', 'NY', '10001', 'Investigative Journalist', 62000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2009, 3, 'CUST-002009', 'Natasha', 'Romanoff', 'natasha.r@avengers.org', '+1-212-555-0150', 'SSN-901-55-4001', TO_DATE('1986-11-22', 'YYYY-MM-DD'), '890 Fifth Avenue', 'New York', 'NY', '10021', 'Security Consultant', 140000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2010, 3, 'CUST-002010', 'Peter', 'Parker', 'peter.parker@dailybugle.net', '+1-718-555-0160', 'SSN-901-66-5001', TO_DATE('2001-08-10', 'YYYY-MM-DD'), '20 Ingram St', 'Forest Hills', 'NY', '11375', 'Freelance Photographer', 34000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2011, 1, 'CUST-002011', 'Rachel', 'Green', 'rachel.g@ralphlauren.com', '+1-212-555-0171', 'SSN-901-77-6001', TO_DATE('1985-05-05', 'YYYY-MM-DD'), '495 Grove St, Apt 20', 'New York', 'NY', '10014', 'Fashion Executive', 115000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2012, 1, 'CUST-002012', 'Ross', 'Geller', 'ross.geller@nyu.edu', '+1-212-555-0172', 'SSN-901-77-6002', TO_DATE('1982-10-18', 'YYYY-MM-DD'), 'Washington Square S', 'New York', 'NY', '10012', 'Paleontologist Professor', 98000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2013, 1, 'CUST-002013', 'Chandler', 'Bing', 'chandler.bing@advertising.com', '+1-212-555-0173', 'SSN-901-77-6003', TO_DATE('1982-04-08', 'YYYY-MM-DD'), '15 Westchester Ave', 'Scarsdale', 'NY', '10583', 'Advertising Copywriter', 130000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2014, 2, 'CUST-002014', 'Monica', 'Geller', 'monica.bing@alessandro.com', '+1-212-555-0174', 'SSN-901-77-6004', TO_DATE('1984-03-12', 'YYYY-MM-DD'), '15 Westchester Ave', 'Scarsdale', 'NY', '10583', 'Executive Head Chef', 95000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2015, 2, 'CUST-002015', 'Joey', 'Tribbiani', 'joey@actorsequity.org', '+1-212-555-0175', 'SSN-901-77-6005', TO_DATE('1983-01-09', 'YYYY-MM-DD'), '495 Grove St, Apt 19', 'New York', 'NY', '10014', 'Actor', 78000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2016, 2, 'CUST-002016', 'Phoebe', 'Buffay', 'phoebe.buffay@massagezen.com', '+1-212-555-0176', 'SSN-901-77-6006', TO_DATE('1983-02-16', 'YYYY-MM-DD'), 'Morton St, Apt 4A', 'New York', 'NY', '10014', 'Holistic Therapist', 48000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2017, 3, 'CUST-002017', 'Walter', 'White', 'walter.white@abqchemistry.org', '+1-505-555-0181', 'SSN-901-88-7001', TO_DATE('1968-09-07', 'YYYY-MM-DD'), '308 Negra Arroyo Lane', 'Albuquerque', 'NM', '87104', 'Chemical Engineer', 160000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2018, 3, 'CUST-002018', 'Jesse', 'Pinkman', 'jesse.pinkman@alaskaworker.com', '+1-505-555-0182', 'SSN-901-88-7002', TO_DATE('1989-09-24', 'YYYY-MM-DD'), '9804 Margo St', 'Albuquerque', 'NM', '87104', 'Woodcraft Artisan', 42000.00, 'PENDING', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2019, 3, 'CUST-002019', 'Saul', 'Goodman', 'saul@bettercallsaul.law', '+1-505-555-0183', 'SSN-901-88-7003', TO_DATE('1972-11-12', 'YYYY-MM-DD'), '9800 Montgomery Blvd', 'Albuquerque', 'NM', '87111', 'Senior Attorney', 185000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2020, 1, 'CUST-002020', 'Gustavo', 'Fring', 'g.fring@lospollos.biz', '+1-505-555-0184', 'SSN-901-88-7004', TO_DATE('1965-04-26', 'YYYY-MM-DD'), '12000 Candelaria Rd NE', 'Albuquerque', 'NM', '87112', 'Hospitality Director', 850000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2021, 2, 'CUST-002021', 'Elliot', 'Alderson', 'elliot.a@allsafe.io', '+1-212-555-0191', 'SSN-901-99-8001', TO_DATE('1991-09-17', 'YYYY-MM-DD'), '217 E Broadway', 'New York', 'NY', '10002', 'Cybersecurity Analyst', 105000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2022, 2, 'CUST-002022', 'Angela', 'Moss', 'angela.moss@ecorp.com', '+1-212-555-0192', 'SSN-901-99-8002', TO_DATE('1992-02-27', 'YYYY-MM-DD'), '450 Lexington Ave', 'New York', 'NY', '10017', 'Public Relations Director', 120000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2023, 3, 'CUST-002023', 'Sherlock', 'Holmes', 'sherlock@bakerstreet.co.uk', '+1-312-555-0195', 'SSN-901-00-9001', TO_DATE('1980-01-06', 'YYYY-MM-DD'), '221B Baker St', 'Chicago', 'IL', '60611', 'Consulting Detective', 175000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2024, 3, 'CUST-002024', 'John', 'Watson', 'dr.watson@medicalcenter.org', '+1-312-555-0196', 'SSN-901-00-9002', TO_DATE('1981-07-07', 'YYYY-MM-DD'), '221B Baker St', 'Chicago', 'IL', '60611', 'Medical Doctor', 135000.00, 'VERIFIED', 'ACTIVE');

INSERT INTO CUSTOMERS (customer_id, branch_id, customer_number, first_name, last_name, email, phone, national_id, date_of_birth, address, city, state, postal_code, occupation, annual_income, kyc_status, status)
VALUES (2025, 1, 'CUST-002025', 'Customer', 'Demo', 'customer@bank.com', '+1-212-555-0199', 'SSN-901-00-9999', TO_DATE('1995-12-15', 'YYYY-MM-DD'), '750 Wall Street, Apt 8', 'New York', 'NY', '10005', 'Software Engineer', 145000.00, 'VERIFIED', 'ACTIVE');

-- ---------------------------------------------------------------------------
-- 4. SEED 35 ACCOUNTS
-- ---------------------------------------------------------------------------
INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3001, 2001, 1, 'ACC-NYC01-003001', 'SAVINGS', 15420.50, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-01-10', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3002, 2001, 1, 'ACC-NYC01-003002', 'CURRENT', 4850.00, 'USD', 'ACTIVE', 0.50, TO_DATE('2023-02-15', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3003, 2002, 1, 'ACC-NYC01-003003', 'SAVINGS', 22100.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-03-01', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3004, 2003, 1, 'ACC-NYC01-003004', 'SAVINGS', 12350.75, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-03-10', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3005, 2004, 1, 'ACC-NYC01-003005', 'BUSINESS', 88400.00, 'USD', 'ACTIVE', 1.25, TO_DATE('2022-11-20', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3006, 2005, 2, 'ACC-SFO02-003006', 'BUSINESS', 950000.00, 'USD', 'ACTIVE', 1.25, TO_DATE('2022-05-14', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3007, 2005, 2, 'ACC-SFO02-003007', 'SAVINGS', 250000.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2022-06-01', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3008, 2006, 2, 'ACC-SFO02-003008', 'SAVINGS', 74000.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2022-07-20', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3009, 2007, 2, 'ACC-SFO02-003009', 'CURRENT', 1420000.00, 'USD', 'ACTIVE', 0.50, TO_DATE('2021-08-10', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3010, 2008, 2, 'ACC-SFO02-003010', 'SAVINGS', 8900.25, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-04-12', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3011, 2009, 3, 'ACC-CHI03-003011', 'SAVINGS', 45200.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-01-25', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3012, 2010, 3, 'ACC-CHI03-003012', 'SAVINGS', 2150.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-06-15', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3013, 2011, 1, 'ACC-NYC01-003013', 'SAVINGS', 38200.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-02-18', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3014, 2012, 1, 'ACC-NYC01-003014', 'SAVINGS', 29400.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-02-18', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3015, 2013, 1, 'ACC-NYC01-003015', 'CURRENT', 51000.00, 'USD', 'ACTIVE', 0.50, TO_DATE('2022-12-05', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3016, 2014, 2, 'ACC-SFO02-003016', 'SAVINGS', 34000.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-01-14', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3017, 2015, 2, 'ACC-SFO02-003017', 'SAVINGS', 15200.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-04-02', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3018, 2016, 2, 'ACC-SFO02-003018', 'SAVINGS', 9600.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-03-29', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3019, 2017, 3, 'ACC-CHI03-003019', 'BUSINESS', 380000.00, 'USD', 'ACTIVE', 1.25, TO_DATE('2022-09-08', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3020, 2018, 3, 'ACC-CHI03-003020', 'SAVINGS', 6200.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-05-19', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3021, 2019, 3, 'ACC-CHI03-003021', 'BUSINESS', 125000.00, 'USD', 'ACTIVE', 1.25, TO_DATE('2022-10-10', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3022, 2020, 1, 'ACC-NYC01-003022', 'BUSINESS', 420000.00, 'USD', 'ACTIVE', 1.25, TO_DATE('2022-03-17', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3023, 2021, 2, 'ACC-SFO02-003023', 'SAVINGS', 41800.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-02-01', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3024, 2022, 2, 'ACC-SFO02-003024', 'CURRENT', 28500.00, 'USD', 'ACTIVE', 0.50, TO_DATE('2023-02-15', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3025, 2023, 3, 'ACC-CHI03-003025', 'SAVINGS', 82000.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2022-08-20', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3026, 2024, 3, 'ACC-CHI03-003026', 'SAVINGS', 56000.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2022-08-25', 'YYYY-MM-DD'), SYSTIMESTAMP);

-- Demo Customer Accounts
INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3027, 2025, 1, 'ACC-NYC01-003027', 'SAVINGS', 25400.00, 'USD', 'ACTIVE', 3.50, TO_DATE('2023-01-05', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3028, 2025, 1, 'ACC-NYC01-003028', 'CURRENT', 8200.00, 'USD', 'ACTIVE', 0.50, TO_DATE('2023-02-10', 'YYYY-MM-DD'), SYSTIMESTAMP);

-- Additional Account Types for Distribution Donut Chart
INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3029, 2004, 1, 'ACC-NYC01-003029', 'FIXED_DEPOSIT', 50000.00, 'USD', 'ACTIVE', 6.50, TO_DATE('2023-04-01', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3030, 2002, 1, 'ACC-NYC01-003030', 'SALARY', 6500.00, 'USD', 'ACTIVE', 4.00, TO_DATE('2023-05-01', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3031, 2007, 2, 'ACC-SFO02-003031', 'FIXED_DEPOSIT', 500000.00, 'USD', 'ACTIVE', 6.50, TO_DATE('2022-09-01', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3032, 2011, 1, 'ACC-NYC01-003032', 'SALARY', 9200.00, 'USD', 'ACTIVE', 4.00, TO_DATE('2023-03-01', 'YYYY-MM-DD'), SYSTIMESTAMP);

-- Frozen and Closed demo accounts
INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3033, 2018, 3, 'ACC-CHI03-003033', 'SAVINGS', 150.00, 'USD', 'FROZEN', 3.50, TO_DATE('2023-07-01', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3034, 2020, 1, 'ACC-NYC01-003034', 'SAVINGS', 0.00, 'USD', 'CLOSED', 3.50, TO_DATE('2022-01-10', 'YYYY-MM-DD'), SYSTIMESTAMP);

INSERT INTO ACCOUNTS (account_id, customer_id, branch_id, account_number, account_type, balance, currency, status, interest_rate, opened_date, last_activity_date)
VALUES (3035, 2025, 1, 'ACC-NYC01-003035', 'FIXED_DEPOSIT', 10000.00, 'USD', 'ACTIVE', 6.50, TO_DATE('2023-06-01', 'YYYY-MM-DD'), SYSTIMESTAMP);

-- ---------------------------------------------------------------------------
-- 5. SEED 10 LOANS
-- ---------------------------------------------------------------------------
INSERT INTO LOANS (loan_id, customer_id, account_id, branch_id, loan_reference, loan_type, principal_amount, interest_rate, term_months, emi_amount, total_payable, total_paid, remaining_balance, status, applied_date, approved_date, approved_by, remarks)
VALUES (5001, 2001, 3001, 1, 'LN-2023-05001', 'PERSONAL', 20000.00, 8.50, 24, 909.29, 21822.96, 5455.74, 16367.22, 'DISBURSED', TO_DATE('2023-01-15', 'YYYY-MM-DD'), TO_DATE('2023-01-17', 'YYYY-MM-DD'), 1003, 'Approved for home renovation.');

INSERT INTO LOANS (loan_id, customer_id, account_id, branch_id, loan_reference, loan_type, principal_amount, interest_rate, term_months, emi_amount, total_payable, total_paid, remaining_balance, status, applied_date, approved_date, approved_by, remarks)
VALUES (5002, 2002, 3003, 1, 'LN-2023-05002', 'AUTO', 35000.00, 6.75, 48, 833.91, 40027.68, 6671.28, 33356.40, 'DISBURSED', TO_DATE('2023-02-10', 'YYYY-MM-DD'), TO_DATE('2023-02-12', 'YYYY-MM-DD'), 1003, 'Subaru Outback financing.');

INSERT INTO LOANS (loan_id, customer_id, account_id, branch_id, loan_reference, loan_type, principal_amount, interest_rate, term_months, emi_amount, total_payable, total_paid, remaining_balance, status, applied_date, approved_date, approved_by, remarks)
VALUES (5003, 2004, 3005, 1, 'LN-2023-05003', 'BUSINESS', 100000.00, 7.25, 60, 1991.94, 119516.40, 11951.64, 107564.76, 'DISBURSED', TO_DATE('2022-12-01', 'YYYY-MM-DD'), TO_DATE('2022-12-05', 'YYYY-MM-DD'), 1004, 'Agri-tourism farm expansion.');

INSERT INTO LOANS (loan_id, customer_id, account_id, branch_id, loan_reference, loan_type, principal_amount, interest_rate, term_months, emi_amount, total_payable, total_paid, remaining_balance, status, applied_date, approved_date, approved_by, remarks)
VALUES (5004, 2008, 3010, 2, 'LN-2023-05004', 'EDUCATION', 15000.00, 5.50, 36, 452.93, 16305.48, 2717.58, 13587.90, 'DISBURSED', TO_DATE('2023-03-01', 'YYYY-MM-DD'), TO_DATE('2023-03-03', 'YYYY-MM-DD'), 1003, 'Journalism Masters degree tuition.');

INSERT INTO LOANS (loan_id, customer_id, account_id, branch_id, loan_reference, loan_type, principal_amount, interest_rate, term_months, emi_amount, total_payable, total_paid, remaining_balance, status, applied_date, approved_date, approved_by, remarks)
VALUES (5005, 2010, 3012, 3, 'LN-2023-05005', 'PERSONAL', 5000.00, 9.00, 12, 437.26, 5247.12, 1749.04, 3498.08, 'DISBURSED', TO_DATE('2023-05-10', 'YYYY-MM-DD'), TO_DATE('2023-05-12', 'YYYY-MM-DD'), 1003, 'Photography camera equipment.');

INSERT INTO LOANS (loan_id, customer_id, account_id, branch_id, loan_reference, loan_type, principal_amount, interest_rate, term_months, emi_amount, total_payable, total_paid, remaining_balance, status, applied_date, approved_date, approved_by, remarks)
VALUES (5006, 2013, 3015, 1, 'LN-2023-05006', 'HOME', 350000.00, 6.25, 240, 2559.88, 614371.20, 15359.28, 599011.92, 'DISBURSED', TO_DATE('2023-01-20', 'YYYY-MM-DD'), TO_DATE('2023-01-25', 'YYYY-MM-DD'), 1004, 'Scarsdale residential property mortgage.');

INSERT INTO LOANS (loan_id, customer_id, account_id, branch_id, loan_reference, loan_type, principal_amount, interest_rate, term_months, emi_amount, total_payable, total_paid, remaining_balance, status, applied_date, approved_date, approved_by, remarks)
VALUES (5007, 2018, 3020, 3, 'LN-2023-05007', 'PERSONAL', 12000.00, 11.50, 24, 562.06, 13489.44, 562.06, 12927.38, 'DISBURSED', TO_DATE('2023-04-15', 'YYYY-MM-DD'), TO_DATE('2023-04-18', 'YYYY-MM-DD'), 1003, 'Woodworking workshop setup.');

-- Pending and Approved loans awaiting disbursement
INSERT INTO LOANS (loan_id, customer_id, account_id, branch_id, loan_reference, loan_type, principal_amount, interest_rate, term_months, emi_amount, total_payable, total_paid, remaining_balance, status, applied_date, approved_date, approved_by, remarks)
VALUES (5008, 2021, 3023, 2, 'LN-2023-05008', 'PERSONAL', 18000.00, 8.00, 24, 814.07, 19537.68, 0.00, 19537.68, 'PENDING', TO_DATE('2023-10-20', 'YYYY-MM-DD'), NULL, NULL, 'Pending credit score verification.');

INSERT INTO LOANS (loan_id, customer_id, account_id, branch_id, loan_reference, loan_type, principal_amount, interest_rate, term_months, emi_amount, total_payable, total_paid, remaining_balance, status, applied_date, approved_date, approved_by, remarks)
VALUES (5009, 2022, 3024, 2, 'LN-2023-05009', 'AUTO', 45000.00, 6.50, 60, 880.52, 52831.20, 0.00, 52831.20, 'APPROVED', TO_DATE('2023-10-18', 'YYYY-MM-DD'), TO_DATE('2023-10-22', 'YYYY-MM-DD'), 1003, 'Approved. Ready for disbursement.');

INSERT INTO LOANS (loan_id, customer_id, account_id, branch_id, loan_reference, loan_type, principal_amount, interest_rate, term_months, emi_amount, total_payable, total_paid, remaining_balance, status, applied_date, approved_date, approved_by, remarks)
VALUES (5010, 2025, 3027, 1, 'LN-2023-05010', 'PERSONAL', 25000.00, 7.50, 36, 777.67, 27996.12, 2333.01, 25663.11, 'DISBURSED', TO_DATE('2023-06-01', 'YYYY-MM-DD'), TO_DATE('2023-06-03', 'YYYY-MM-DD'), 1003, 'Tech equipment demo loan.');

-- ---------------------------------------------------------------------------
-- 6. SEED LOAN PAYMENTS
-- ---------------------------------------------------------------------------
INSERT INTO LOAN_PAYMENTS (payment_id, loan_id, payment_number, amount_paid, principal_paid, interest_paid, balance_remaining, payment_date, source_account_id, payment_method, status)
VALUES (7001, 5001, 1, 909.29, 767.62, 141.67, 20913.67, TO_DATE('2023-02-15', 'YYYY-MM-DD'), 3001, 'AUTO_DEBIT', 'COMPLETED');

INSERT INTO LOAN_PAYMENTS (payment_id, loan_id, payment_number, amount_paid, principal_paid, interest_paid, balance_remaining, payment_date, source_account_id, payment_method, status)
VALUES (7002, 5001, 2, 909.29, 773.06, 136.23, 20004.38, TO_DATE('2023-03-15', 'YYYY-MM-DD'), 3001, 'AUTO_DEBIT', 'COMPLETED');

INSERT INTO LOAN_PAYMENTS (payment_id, loan_id, payment_number, amount_paid, principal_paid, interest_paid, balance_remaining, payment_date, source_account_id, payment_method, status)
VALUES (7003, 5001, 3, 909.29, 778.54, 130.75, 19095.09, TO_DATE('2023-04-15', 'YYYY-MM-DD'), 3001, 'ONLINE', 'COMPLETED');

INSERT INTO LOAN_PAYMENTS (payment_id, loan_id, payment_number, amount_paid, principal_paid, interest_paid, balance_remaining, payment_date, source_account_id, payment_method, status)
VALUES (7004, 5010, 1, 777.67, 621.42, 156.25, 27218.45, TO_DATE('2023-07-01', 'YYYY-MM-DD'), 3027, 'ONLINE', 'COMPLETED');

INSERT INTO LOAN_PAYMENTS (payment_id, loan_id, payment_number, amount_paid, principal_paid, interest_paid, balance_remaining, payment_date, source_account_id, payment_method, status)
VALUES (7005, 5010, 2, 777.67, 625.30, 152.37, 26440.78, TO_DATE('2023-08-01', 'YYYY-MM-DD'), 3027, 'ONLINE', 'COMPLETED');

INSERT INTO LOAN_PAYMENTS (payment_id, loan_id, payment_number, amount_paid, principal_paid, interest_paid, balance_remaining, payment_date, source_account_id, payment_method, status)
VALUES (7006, 5010, 3, 777.67, 629.21, 148.46, 25663.11, TO_DATE('2023-09-01', 'YYYY-MM-DD'), 3027, 'ONLINE', 'COMPLETED');

-- ---------------------------------------------------------------------------
-- 7. SEED 65 TRANSACTIONS
-- ---------------------------------------------------------------------------
INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100001, 3001, 'TXN-20231001-100001', 'DEPOSIT', 2500.00, 15420.50, 'BRANCH', 'Payroll Direct Deposit', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '27' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100002, 3001, 'TXN-20231002-100002', 'WITHDRAWAL', 350.00, 15070.50, 'ATM', 'ATM Cash Withdrawal', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '26' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, destination_acc_id, channel, description, status, created_by, created_at)
VALUES (100003, 3001, 'TRF-20231003-100003-OUT', 'TRANSFER_OUT', 500.00, 14570.50, 3002, 'ONLINE', 'Transfer to Checking Account', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '25' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, destination_acc_id, channel, description, status, created_by, created_at)
VALUES (100004, 3002, 'TRF-20231003-100003-IN', 'TRANSFER_IN', 500.00, 4850.00, 3001, 'ONLINE', 'Transfer from Savings Account', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '25' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100005, 3003, 'TXN-20231004-100005', 'DEPOSIT', 3200.00, 22100.00, 'ONLINE', 'Consulting Retainer Fee', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '24' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100006, 3004, 'TXN-20231005-100006', 'WITHDRAWAL', 200.00, 12350.75, 'ATM', 'Supermarket ATM Cash', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '23' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100007, 3005, 'TXN-20231006-100007', 'DEPOSIT', 14500.00, 88400.00, 'BRANCH', 'Agri Produce Wholesale Payment', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '22' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100008, 3006, 'TXN-20231007-100008', 'DEPOSIT', 75000.00, 950000.00, 'ONLINE', 'Defense Contract Payment', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '21' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100009, 3007, 'TXN-20231008-100009', 'WITHDRAWAL', 12000.00, 250000.00, 'ONLINE', 'Wire Transfer Expense', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '20' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100010, 3008, 'TXN-20231009-100010', 'DEPOSIT', 6000.00, 74000.00, 'BRANCH', 'Quarterly Dividend Deposit', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '19' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100011, 3009, 'TXN-20231010-100011', 'DEPOSIT', 150000.00, 1420000.00, 'ONLINE', 'Wayne Corp Capital Distribution', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '18' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100012, 3010, 'TXN-20231011-100012', 'WITHDRAWAL', 120.00, 8900.25, 'ATM', 'Daily Expense Cash', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '17' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100013, 3011, 'TXN-20231012-100013', 'DEPOSIT', 4200.00, 45200.00, 'ONLINE', 'Private Security Honorarium', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '16' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100014, 3012, 'TXN-20231013-100014', 'DEPOSIT', 450.00, 2150.00, 'BRANCH', 'Freelance Photo Rights Payment', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '15' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100015, 3013, 'TXN-20231014-100015', 'DEPOSIT', 5200.00, 38200.00, 'BRANCH', 'Fashion Advisory Invoice', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '14' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100016, 3014, 'TXN-20231015-100016', 'WITHDRAWAL', 400.00, 29400.00, 'ATM', 'Conference Expenses', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '13' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, destination_acc_id, channel, description, status, created_by, created_at)
VALUES (100017, 3015, 'TRF-20231016-100017-OUT', 'TRANSFER_OUT', 1200.00, 51000.00, 3016, 'ONLINE', 'Monthly Household Contribution', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '12' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, destination_acc_id, channel, description, status, created_by, created_at)
VALUES (100018, 3016, 'TRF-20231016-100017-IN', 'TRANSFER_IN', 1200.00, 34000.00, 3015, 'ONLINE', 'Household Contribution Received', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '12' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100019, 3017, 'TXN-20231017-100019', 'DEPOSIT', 2800.00, 15200.00, 'ONLINE', 'Commercial Acting Residuals', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '11' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100020, 3018, 'TXN-20231018-100020', 'WITHDRAWAL', 150.00, 9600.00, 'ATM', 'Aromatherapy Supplies', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '10' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100021, 3019, 'TXN-20231019-100021', 'DEPOSIT', 45000.00, 380000.00, 'BRANCH', 'Industrial Consulting Retainer', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '9' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100022, 3020, 'TXN-20231020-100022', 'WITHDRAWAL', 250.00, 6200.00, 'ATM', 'Workshop Lumber Supplies', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '8' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100023, 3021, 'TXN-20231021-100023', 'DEPOSIT', 8500.00, 125000.00, 'BRANCH', 'Legal Retainer Settlement', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '7' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100024, 3022, 'TXN-20231022-100024', 'DEPOSIT', 25000.00, 420000.00, 'ONLINE', 'Franchise Distribution Revenue', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '6' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100025, 3023, 'TXN-20231023-100025', 'DEPOSIT', 3900.00, 41800.00, 'ONLINE', 'Security Auditing Fee', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '5' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100026, 3024, 'TXN-20231024-100026', 'WITHDRAWAL', 650.00, 28500.00, 'ATM', 'Corporate Travel Advance', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '4' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100027, 3025, 'TXN-20231025-100027', 'DEPOSIT', 9000.00, 82000.00, 'BRANCH', 'Forensic Consultation Retainer', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '3' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100028, 3026, 'TXN-20231026-100028', 'DEPOSIT', 5400.00, 56000.00, 'ONLINE', 'Medical Clinic Honorarium', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '2' DAY);

-- Demo Customer (3027 & 3028) Activity
INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100029, 3027, 'TXN-20231027-100029', 'DEPOSIT', 5000.00, 25400.00, 'ONLINE', 'Salary Direct Deposit', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '1' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, destination_acc_id, channel, description, status, created_by, created_at)
VALUES (100030, 3027, 'TRF-20231027-100030-OUT', 'TRANSFER_OUT', 1500.00, 23900.00, 3028, 'MOBILE', 'Transfer to Checking for Bill Pay', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '18' HOUR);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, destination_acc_id, channel, description, status, created_by, created_at)
VALUES (100031, 3028, 'TRF-20231027-100030-IN', 'TRANSFER_IN', 1500.00, 8200.00, 3027, 'MOBILE', 'Checking Credit from Savings', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '18' HOUR);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100032, 3027, 'EMI-20231027-100032', 'LOAN_REPAYMENT', 777.67, 25400.00, 'ONLINE', 'EMI payment for loan LN-2023-05010', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '12' HOUR);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100033, 3027, 'WTH-20231028-100033', 'WITHDRAWAL', 200.00, 25200.00, 'ATM', 'ATM Cash Withdrawal Downtown', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '3' HOUR);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100034, 3027, 'DEP-20231028-100034', 'DEPOSIT', 200.00, 25400.00, 'BRANCH', 'Cash Deposit via Teller Counter', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '1' HOUR);

-- Transactions 35 to 65 for diverse account trends
INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100035, 3001, 'TXN-20231028-100035', 'DEPOSIT', 350.00, 15420.50, 'BRANCH', 'Reimbursement check deposit', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '40' MINUTE);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100036, 3002, 'TXN-20231028-100036', 'WITHDRAWAL', 75.00, 4775.00, 'ATM', 'Coffee & Dining debit', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '30' MINUTE);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100037, 3005, 'TXN-20231028-100037', 'DEPOSIT', 5200.00, 88400.00, 'ONLINE', 'Farm Supply Customer Settlement', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '20' MINUTE);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100038, 3006, 'TXN-20231028-100038', 'WITHDRAWAL', 25000.00, 925000.00, 'ONLINE', 'Hardware Procurement vendor payment', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '15' MINUTE);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100039, 3009, 'TXN-20231028-100039', 'DEPOSIT', 80000.00, 1420000.00, 'BRANCH', 'Charitable Trust dividend credit', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '10' MINUTE);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100040, 3011, 'TXN-20231028-100040', 'WITHDRAWAL', 320.00, 44880.00, 'ATM', 'Travel incidental expenses', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '5' MINUTE);

-- 25 more historical transactions to reach 65 total
INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100041, 3001, 'TXN-20230915-100041', 'DEPOSIT', 1800.00, 14200.50, 'BRANCH', 'Performance Incentive', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '43' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100042, 3002, 'TXN-20230916-100042', 'WITHDRAWAL', 220.00, 4600.00, 'ATM', 'Utility Payment', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '42' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100043, 3003, 'TXN-20230917-100043', 'DEPOSIT', 4000.00, 20500.00, 'ONLINE', 'Design Retainer', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '41' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100044, 3004, 'TXN-20230918-100044', 'WITHDRAWAL', 350.00, 11800.75, 'ATM', 'Art Supplies purchase', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '40' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100045, 3005, 'TXN-20230919-100045', 'DEPOSIT', 9500.00, 83000.00, 'BRANCH', 'Autumn Harvest delivery payment', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '39' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100046, 3007, 'TXN-20230920-100046', 'DEPOSIT', 30000.00, 248000.00, 'ONLINE', 'Patent Royalty licensing', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '38' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100047, 3008, 'TXN-20230921-100047', 'WITHDRAWAL', 1500.00, 72500.00, 'ONLINE', 'Corporate Board dinner', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '37' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100048, 3010, 'TXN-20230922-100048', 'DEPOSIT', 1200.00, 8750.25, 'BRANCH', 'Syndicated Article payment', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '36' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100049, 3012, 'TXN-20230923-100049', 'WITHDRAWAL', 100.00, 1950.00, 'ATM', 'Transit Pass reload', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '35' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100050, 3013, 'TXN-20230924-100050', 'DEPOSIT', 6800.00, 37500.00, 'ONLINE', 'Runway Consultation contract', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '34' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100051, 3014, 'TXN-20230925-100051', 'DEPOSIT', 3200.00, 28800.00, 'ONLINE', 'Journal Research Grant payment', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '33' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100052, 3015, 'TXN-20230926-100052', 'DEPOSIT', 7500.00, 50200.00, 'ONLINE', 'Ad Campaign completion fee', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '32' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100053, 3016, 'TXN-20230927-100053', 'DEPOSIT', 4100.00, 33500.00, 'BRANCH', 'Restaurant Catering check', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '31' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100054, 3017, 'TXN-20230928-100054', 'WITHDRAWAL', 600.00, 14900.00, 'ATM', 'Voice Coaching session fee', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '30' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100055, 3019, 'TXN-20230929-100055', 'DEPOSIT', 32000.00, 365000.00, 'BRANCH', 'Lab Contract quarterly payout', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '29' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100056, 3021, 'TXN-20230930-100056', 'WITHDRAWAL', 2400.00, 122000.00, 'ONLINE', 'Office Space Lease Payment', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '28' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100057, 3022, 'TXN-20231001-100057', 'WITHDRAWAL', 15000.00, 412000.00, 'ONLINE', 'Poultry Fleet Maintenance invoice', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '27' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100058, 3023, 'TXN-20231002-100058', 'WITHDRAWAL', 380.00, 41200.00, 'ATM', 'Server Hardware accessories', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '26' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100059, 3025, 'TXN-20231003-100059', 'WITHDRAWAL', 850.00, 81000.00, 'ONLINE', 'Crime scene lab chemical imports', 'COMPLETED', 'USER', SYSTIMESTAMP - INTERVAL '25' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100060, 3026, 'TXN-20231004-100060', 'WITHDRAWAL', 450.00, 55200.00, 'ATM', 'Medical Journal Subscription annual', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '24' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100061, 3029, 'TXN-20231005-100061', 'DEPOSIT', 50000.00, 50000.00, 'BRANCH', 'Fixed Deposit Certificate placement', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '23' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100062, 3030, 'TXN-20231006-100062', 'DEPOSIT', 6500.00, 6500.00, 'ONLINE', 'Monthly Corporate Salary', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '22' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100063, 3031, 'TXN-20231007-100063', 'DEPOSIT', 500000.00, 500000.00, 'BRANCH', 'Jumbo Fixed Deposit term contract', 'COMPLETED', 'EMP-MGR-01', SYSTIMESTAMP - INTERVAL '21' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100064, 3032, 'TXN-20231008-100064', 'DEPOSIT', 9200.00, 9200.00, 'ONLINE', 'Executive Compensation direct credit', 'COMPLETED', 'SYSTEM', SYSTIMESTAMP - INTERVAL '20' DAY);

INSERT INTO TRANSACTIONS (transaction_id, account_id, reference_number, transaction_type, amount, balance_after, channel, description, status, created_by, created_at)
VALUES (100065, 3035, 'TXN-20231009-100065', 'DEPOSIT', 10000.00, 10000.00, 'BRANCH', 'Demo Term Deposit initial funds', 'COMPLETED', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '19' DAY);

-- ---------------------------------------------------------------------------
-- 8. SEED INITIAL AUDIT LOG ENTRIES
-- ---------------------------------------------------------------------------
INSERT INTO AUDIT_LOG (audit_id, table_name, action_type, entity_id, changed_by, changed_at, description)
VALUES (900001, 'SYSTEM', 'PROCEDURE_EXEC', 'INIT_SYSTEM', 'DBA_ADMIN', SYSTIMESTAMP - INTERVAL '30' DAY, 'Bank Management System core database initialized.');

INSERT INTO AUDIT_LOG (audit_id, table_name, action_type, entity_id, changed_by, changed_at, description)
VALUES (900002, 'ACCOUNTS', 'INSERT', 'ACC-NYC01-003001', 'EMP-ADM-01', SYSTIMESTAMP - INTERVAL '29' DAY, 'Primary savings account registered for Michael Scott.');

INSERT INTO AUDIT_LOG (audit_id, table_name, action_type, entity_id, changed_by, changed_at, description)
VALUES (900003, 'LOANS', 'UPDATE', 'LN-2023-05001', 'EMP-LNO-01', SYSTIMESTAMP - INTERVAL '28' DAY, 'Loan application approved and funds scheduled for disbursement.');

INSERT INTO AUDIT_LOG (audit_id, table_name, action_type, entity_id, changed_by, changed_at, description)
VALUES (900004, 'TRANSACTIONS', 'INSERT', 'TXN-20231001-100001', 'EMP-TEL-01', SYSTIMESTAMP - INTERVAL '27' DAY, 'DEPOSIT of $2500.00 successfully completed.');

INSERT INTO AUDIT_LOG (audit_id, table_name, action_type, entity_id, changed_by, changed_at, description)
VALUES (900005, 'SECURITY', 'PROCEDURE_EXEC', 'SEC_LOGIN_ADMIN', 'admin@bank.com', SYSTIMESTAMP - INTERVAL '1' DAY, 'Successful administrative console sign-in.');

-- Re-enable triggers
ALTER TRIGGER TRG_AUDIT_ACCOUNTS ENABLE;
ALTER TRIGGER TRG_AUDIT_TRANSACTIONS ENABLE;
ALTER TRIGGER TRG_AUDIT_LOANS ENABLE;
ALTER TRIGGER TRG_UPDATE_ACCOUNT_ACTIVITY ENABLE;

COMMIT;
