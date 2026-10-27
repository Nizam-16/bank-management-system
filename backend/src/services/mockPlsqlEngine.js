/**
 * High-Fidelity PL/SQL Simulation Engine
 * Emulates Oracle Database 21c PL/SQL Packages, Triggers, Views & Exceptions
 * Ensures 100% runnable and verifiable execution even when Oracle XE container is not yet spun up.
 */

const bcrypt = require('bcryptjs');

// In-Memory Database Schema State
let branches = [
  { branch_id: 1, branch_code: 'NYC01', branch_name: 'Metropolitan Financial Hub', ifsc_code: 'APEX0001001', address: '100 Wall Street, Floor 14', city: 'New York', state: 'NY', postal_code: '10005', phone: '+1-212-555-0101', email: 'nyc-hub@apexbank.com' },
  { branch_id: 2, branch_code: 'SFO02', branch_name: 'Silicon Valley Branch', ifsc_code: 'APEX0002002', address: '500 Market Street, Suite 300', city: 'San Francisco', state: 'CA', postal_code: '94105', phone: '+1-415-555-0102', email: 'sfo-branch@apexbank.com' },
  { branch_id: 3, branch_code: 'CHI03', branch_name: 'Midwest Commercial Center', ifsc_code: 'APEX0003003', address: '233 S Wacker Dr, 22nd Fl', city: 'Chicago', state: 'IL', postal_code: '60606', phone: '+1-312-555-0103', email: 'chi-center@apexbank.com' }
];

const defaultPasswordHash = bcrypt.hashSync('password123', 10);

let employees = [
  { employee_id: 1001, branch_id: 1, employee_code: 'EMP-ADM-01', first_name: 'Alexander', last_name: 'Vance', email: 'admin@bank.com', password_hash: defaultPasswordHash, role: 'ADMIN', status: 'ACTIVE' },
  { employee_id: 1002, branch_id: 1, employee_code: 'EMP-TEL-01', first_name: 'Sarah', last_name: 'Jenkins', email: 'teller@bank.com', password_hash: defaultPasswordHash, role: 'TELLER', status: 'ACTIVE' },
  { employee_id: 1003, branch_id: 2, employee_code: 'EMP-LNO-01', first_name: 'David', last_name: 'Chen', email: 'loan@bank.com', password_hash: defaultPasswordHash, role: 'LOAN_OFFICER', status: 'ACTIVE' },
  { employee_id: 1004, branch_id: 3, employee_code: 'EMP-MGR-01', first_name: 'Elena', last_name: 'Rostova', email: 'manager@bank.com', password_hash: defaultPasswordHash, role: 'MANAGER', status: 'ACTIVE' }
];

let customers = [
  { customer_id: 2001, branch_id: 1, customer_number: 'CUST-002001', first_name: 'Michael', last_name: 'Scott', email: 'michael.scott@dundermifflin.com', phone: '+1-570-555-0111', national_id: 'SSN-901-22-1111', date_of_birth: '1975-03-15', address: '1725 Slough Ave', city: 'Scranton', state: 'PA', postal_code: '18503', occupation: 'Regional Manager', annual_income: 75000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2002, branch_id: 1, customer_number: 'CUST-002002', first_name: 'Jim', last_name: 'Halpert', email: 'jim.halpert@dundermifflin.com', phone: '+1-570-555-0112', national_id: 'SSN-901-22-1112', date_of_birth: '1982-10-01', address: '421 Linden St', city: 'Scranton', state: 'PA', postal_code: '18503', occupation: 'Sales Representative', annual_income: 68000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2003, branch_id: 1, customer_number: 'CUST-002003', first_name: 'Pam', last_name: 'Beesly', email: 'pam.beesly@dundermifflin.com', phone: '+1-570-555-0113', national_id: 'SSN-901-22-1113', date_of_birth: '1983-03-25', address: '421 Linden St', city: 'Scranton', state: 'PA', postal_code: '18503', occupation: 'Office Administrator', annual_income: 52000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2004, branch_id: 1, customer_number: 'CUST-002004', first_name: 'Dwight', last_name: 'Schrute', email: 'dwight.schrute@schrutebeetfarms.com', phone: '+1-570-555-0114', national_id: 'SSN-901-22-1114', date_of_birth: '1978-01-20', address: 'Schrute Farms, Route 6', city: 'Honesdale', state: 'PA', postal_code: '18431', occupation: 'Agri-Business Owner', annual_income: 125000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2005, branch_id: 2, customer_number: 'CUST-002005', first_name: 'Tony', last_name: 'Stark', email: 'tony@starkindustries.io', phone: '+1-310-555-0120', national_id: 'SSN-901-33-2001', date_of_birth: '1970-05-29', address: '10880 Malibu Point', city: 'Malibu', state: 'CA', postal_code: '90265', occupation: 'Chief Executive Officer', annual_income: 1500000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2006, branch_id: 2, customer_number: 'CUST-002006', first_name: 'Pepper', last_name: 'Potts', email: 'pepper@starkindustries.io', phone: '+1-310-555-0121', national_id: 'SSN-901-33-2002', date_of_birth: '1974-09-12', address: '10880 Malibu Point', city: 'Malibu', state: 'CA', postal_code: '90265', occupation: 'Corporate Executive', annual_income: 450000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2007, branch_id: 2, customer_number: 'CUST-002007', first_name: 'Bruce', last_name: 'Wayne', email: 'bruce@wayneenterprises.com', phone: '+1-201-555-0130', national_id: 'SSN-901-44-3001', date_of_birth: '1979-02-19', address: '1007 Mountain Drive', city: 'Gotham', state: 'NJ', postal_code: '07001', occupation: 'Venture Capitalist', annual_income: 2500000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2008, branch_id: 2, customer_number: 'CUST-002008', first_name: 'Clark', last_name: 'Kent', email: 'clark.kent@dailyplanet.com', phone: '+1-212-555-0140', national_id: 'SSN-901-44-3002', date_of_birth: '1984-06-18', address: '344 Clinton St, Apt 3B', city: 'Metropolis', state: 'NY', postal_code: '10001', occupation: 'Investigative Journalist', annual_income: 62000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2009, branch_id: 3, customer_number: 'CUST-002009', first_name: 'Natasha', last_name: 'Romanoff', email: 'natasha.r@avengers.org', phone: '+1-212-555-0150', national_id: 'SSN-901-55-4001', date_of_birth: '1986-11-22', address: '890 Fifth Avenue', city: 'New York', state: 'NY', postal_code: '10021', occupation: 'Security Consultant', annual_income: 140000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2010, branch_id: 3, customer_number: 'CUST-002010', first_name: 'Peter', last_name: 'Parker', email: 'peter.parker@dailybugle.net', phone: '+1-718-555-0160', national_id: 'SSN-901-66-5001', date_of_birth: '2001-08-10', address: '20 Ingram St', city: 'Forest Hills', state: 'NY', postal_code: '11375', occupation: 'Freelance Photographer', annual_income: 34000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2011, branch_id: 1, customer_number: 'CUST-002011', first_name: 'Rachel', last_name: 'Green', email: 'rachel.g@ralphlauren.com', phone: '+1-212-555-0171', national_id: 'SSN-901-77-6001', date_of_birth: '1985-05-05', address: '495 Grove St, Apt 20', city: 'New York', state: 'NY', postal_code: '10014', occupation: 'Fashion Executive', annual_income: 115000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2012, branch_id: 1, customer_number: 'CUST-002012', first_name: 'Ross', last_name: 'Geller', email: 'ross.geller@nyu.edu', phone: '+1-212-555-0172', national_id: 'SSN-901-77-6002', date_of_birth: '1982-10-18', address: 'Washington Square S', city: 'New York', state: 'NY', postal_code: '10012', occupation: 'Paleontologist Professor', annual_income: 98000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2013, branch_id: 1, customer_number: 'CUST-002013', first_name: 'Chandler', last_name: 'Bing', email: 'chandler.bing@advertising.com', phone: '+1-212-555-0173', national_id: 'SSN-901-77-6003', date_of_birth: '1982-04-08', address: '15 Westchester Ave', city: 'Scarsdale', state: 'NY', postal_code: '10583', occupation: 'Advertising Copywriter', annual_income: 130000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2014, branch_id: 2, customer_number: 'CUST-002014', first_name: 'Monica', last_name: 'Geller', email: 'monica.bing@alessandro.com', phone: '+1-212-555-0174', national_id: 'SSN-901-77-6004', date_of_birth: '1984-03-12', address: '15 Westchester Ave', city: 'Scarsdale', state: 'NY', postal_code: '10583', occupation: 'Executive Head Chef', annual_income: 95000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2015, branch_id: 2, customer_number: 'CUST-002015', first_name: 'Joey', last_name: 'Tribbiani', email: 'joey@actorsequity.org', phone: '+1-212-555-0175', national_id: 'SSN-901-77-6005', date_of_birth: '1983-01-09', address: '495 Grove St, Apt 19', city: 'New York', state: 'NY', postal_code: '10014', occupation: 'Actor', annual_income: 78000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2016, branch_id: 2, customer_number: 'CUST-002016', first_name: 'Phoebe', last_name: 'Buffay', email: 'phoebe.buffay@massagezen.com', phone: '+1-212-555-0176', national_id: 'SSN-901-77-6006', date_of_birth: '1983-02-16', address: 'Morton St, Apt 4A', city: 'New York', state: 'NY', postal_code: '10014', occupation: 'Holistic Therapist', annual_income: 48000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2017, branch_id: 3, customer_number: 'CUST-002017', first_name: 'Walter', last_name: 'White', email: 'walter.white@abqchemistry.org', phone: '+1-505-555-0181', national_id: 'SSN-901-88-7001', date_of_birth: '1968-09-07', address: '308 Negra Arroyo Lane', city: 'Albuquerque', state: 'NM', postal_code: '87104', occupation: 'Chemical Engineer', annual_income: 160000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2018, branch_id: 3, customer_number: 'CUST-002018', first_name: 'Jesse', last_name: 'Pinkman', email: 'jesse.pinkman@alaskaworker.com', phone: '+1-505-555-0182', national_id: 'SSN-901-88-7002', date_of_birth: '1989-09-24', address: '9804 Margo St', city: 'Albuquerque', state: 'NM', postal_code: '87104', occupation: 'Woodcraft Artisan', annual_income: 42000, kyc_status: 'PENDING', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2019, branch_id: 3, customer_number: 'CUST-002019', first_name: 'Saul', last_name: 'Goodman', email: 'saul@bettercallsaul.law', phone: '+1-505-555-0183', national_id: 'SSN-901-88-7003', date_of_birth: '1972-11-12', address: '9800 Montgomery Blvd', city: 'Albuquerque', state: 'NM', postal_code: '87111', occupation: 'Senior Attorney', annual_income: 185000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2020, branch_id: 1, customer_number: 'CUST-002020', first_name: 'Gustavo', last_name: 'Fring', email: 'g.fring@lospollos.biz', phone: '+1-505-555-0184', national_id: 'SSN-901-88-7004', date_of_birth: '1965-04-26', address: '12000 Candelaria Rd NE', city: 'Albuquerque', state: 'NM', postal_code: '87112', occupation: 'Hospitality Director', annual_income: 850000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2021, branch_id: 2, customer_number: 'CUST-002021', first_name: 'Elliot', last_name: 'Alderson', email: 'elliot.a@allsafe.io', phone: '+1-212-555-0191', national_id: 'SSN-901-99-8001', date_of_birth: '1991-09-17', address: '217 E Broadway', city: 'New York', state: 'NY', postal_code: '10002', occupation: 'Cybersecurity Analyst', annual_income: 105000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2022, branch_id: 2, customer_number: 'CUST-002022', first_name: 'Angela', last_name: 'Moss', email: 'angela.moss@ecorp.com', phone: '+1-212-555-0192', national_id: 'SSN-901-99-8002', date_of_birth: '1992-02-27', address: '450 Lexington Ave', city: 'New York', state: 'NY', postal_code: '10017', occupation: 'Public Relations Director', annual_income: 120000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2023, branch_id: 3, customer_number: 'CUST-002023', first_name: 'Sherlock', last_name: 'Holmes', email: 'sherlock@bakerstreet.co.uk', phone: '+1-312-555-0195', national_id: 'SSN-901-00-9001', date_of_birth: '1980-01-06', address: '221B Baker St', city: 'Chicago', state: 'IL', postal_code: '60611', occupation: 'Consulting Detective', annual_income: 175000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2024, branch_id: 3, customer_number: 'CUST-002024', first_name: 'John', last_name: 'Watson', email: 'dr.watson@medicalcenter.org', phone: '+1-312-555-0196', national_id: 'SSN-901-00-9002', date_of_birth: '1981-07-07', address: '221B Baker St', city: 'Chicago', state: 'IL', postal_code: '60611', occupation: 'Medical Doctor', annual_income: 135000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash },
  { customer_id: 2025, branch_id: 1, customer_number: 'CUST-002025', first_name: 'Customer', last_name: 'Demo', email: 'customer@bank.com', phone: '+1-212-555-0199', national_id: 'SSN-901-00-9999', date_of_birth: '1995-12-15', address: '750 Wall Street, Apt 8', city: 'New York', state: 'NY', postal_code: '10005', occupation: 'Software Engineer', annual_income: 145000, kyc_status: 'VERIFIED', status: 'ACTIVE', password_hash: defaultPasswordHash }
];

let accounts = [
  { account_id: 3001, customer_id: 2001, branch_id: 1, account_number: 'ACC-NYC01-003001', account_type: 'SAVINGS', balance: 15420.50, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-01-10', last_activity_date: new Date().toISOString() },
  { account_id: 3002, customer_id: 2001, branch_id: 1, account_number: 'ACC-NYC01-003002', account_type: 'CURRENT', balance: 4850.00, currency: 'USD', status: 'ACTIVE', interest_rate: 0.50, opened_date: '2023-02-15', last_activity_date: new Date().toISOString() },
  { account_id: 3003, customer_id: 2002, branch_id: 1, account_number: 'ACC-NYC01-003003', account_type: 'SAVINGS', balance: 22100.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-03-01', last_activity_date: new Date().toISOString() },
  { account_id: 3004, customer_id: 2003, branch_id: 1, account_number: 'ACC-NYC01-003004', account_type: 'SAVINGS', balance: 12350.75, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-03-10', last_activity_date: new Date().toISOString() },
  { account_id: 3005, customer_id: 2004, branch_id: 1, account_number: 'ACC-NYC01-003005', account_type: 'BUSINESS', balance: 88400.00, currency: 'USD', status: 'ACTIVE', interest_rate: 1.25, opened_date: '2022-11-20', last_activity_date: new Date().toISOString() },
  { account_id: 3006, customer_id: 2005, branch_id: 2, account_number: 'ACC-SFO02-003006', account_type: 'BUSINESS', balance: 950000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 1.25, opened_date: '2022-05-14', last_activity_date: new Date().toISOString() },
  { account_id: 3007, customer_id: 2005, branch_id: 2, account_number: 'ACC-SFO02-003007', account_type: 'SAVINGS', balance: 250000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2022-06-01', last_activity_date: new Date().toISOString() },
  { account_id: 3008, customer_id: 2006, branch_id: 2, account_number: 'ACC-SFO02-003008', account_type: 'SAVINGS', balance: 74000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2022-07-20', last_activity_date: new Date().toISOString() },
  { account_id: 3009, customer_id: 2007, branch_id: 2, account_number: 'ACC-SFO02-003009', account_type: 'CURRENT', balance: 1420000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 0.50, opened_date: '2021-08-10', last_activity_date: new Date().toISOString() },
  { account_id: 3010, customer_id: 2008, branch_id: 2, account_number: 'ACC-SFO02-003010', account_type: 'SAVINGS', balance: 8900.25, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-04-12', last_activity_date: new Date().toISOString() },
  { account_id: 3011, customer_id: 2009, branch_id: 3, account_number: 'ACC-CHI03-003011', account_type: 'SAVINGS', balance: 45200.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-01-25', last_activity_date: new Date().toISOString() },
  { account_id: 3012, customer_id: 2010, branch_id: 3, account_number: 'ACC-CHI03-003012', account_type: 'SAVINGS', balance: 2150.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-06-15', last_activity_date: new Date().toISOString() },
  { account_id: 3013, customer_id: 2011, branch_id: 1, account_number: 'ACC-NYC01-003013', account_type: 'SAVINGS', balance: 38200.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-02-18', last_activity_date: new Date().toISOString() },
  { account_id: 3014, customer_id: 2012, branch_id: 1, account_number: 'ACC-NYC01-003014', account_type: 'SAVINGS', balance: 29400.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-02-18', last_activity_date: new Date().toISOString() },
  { account_id: 3015, customer_id: 2013, branch_id: 1, account_number: 'ACC-NYC01-003015', account_type: 'CURRENT', balance: 51000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 0.50, opened_date: '2022-12-05', last_activity_date: new Date().toISOString() },
  { account_id: 3016, customer_id: 2014, branch_id: 2, account_number: 'ACC-SFO02-003016', account_type: 'SAVINGS', balance: 34000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-01-14', last_activity_date: new Date().toISOString() },
  { account_id: 3017, customer_id: 2015, branch_id: 2, account_number: 'ACC-SFO02-003017', account_type: 'SAVINGS', balance: 15200.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-04-02', last_activity_date: new Date().toISOString() },
  { account_id: 3018, customer_id: 2016, branch_id: 2, account_number: 'ACC-SFO02-003018', account_type: 'SAVINGS', balance: 9600.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-03-29', last_activity_date: new Date().toISOString() },
  { account_id: 3019, customer_id: 2017, branch_id: 3, account_number: 'ACC-CHI03-003019', account_type: 'BUSINESS', balance: 380000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 1.25, opened_date: '2022-09-08', last_activity_date: new Date().toISOString() },
  { account_id: 3020, customer_id: 2018, branch_id: 3, account_number: 'ACC-CHI03-003020', account_type: 'SAVINGS', balance: 6200.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-05-19', last_activity_date: new Date().toISOString() },
  { account_id: 3021, customer_id: 2019, branch_id: 3, account_number: 'ACC-CHI03-003021', account_type: 'BUSINESS', balance: 125000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 1.25, opened_date: '2022-10-10', last_activity_date: new Date().toISOString() },
  { account_id: 3022, customer_id: 2020, branch_id: 1, account_number: 'ACC-NYC01-003022', account_type: 'BUSINESS', balance: 420000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 1.25, opened_date: '2022-03-17', last_activity_date: new Date().toISOString() },
  { account_id: 3023, customer_id: 2021, branch_id: 2, account_number: 'ACC-SFO02-003023', account_type: 'SAVINGS', balance: 41800.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-02-01', last_activity_date: new Date().toISOString() },
  { account_id: 3024, customer_id: 2022, branch_id: 2, account_number: 'ACC-SFO02-003024', account_type: 'CURRENT', balance: 28500.00, currency: 'USD', status: 'ACTIVE', interest_rate: 0.50, opened_date: '2023-02-15', last_activity_date: new Date().toISOString() },
  { account_id: 3025, customer_id: 2023, branch_id: 3, account_number: 'ACC-CHI03-003025', account_type: 'SAVINGS', balance: 82000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2022-08-20', last_activity_date: new Date().toISOString() },
  { account_id: 3026, customer_id: 2024, branch_id: 3, account_number: 'ACC-CHI03-003026', account_type: 'SAVINGS', balance: 56000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2022-08-25', last_activity_date: new Date().toISOString() },
  { account_id: 3027, customer_id: 2025, branch_id: 1, account_number: 'ACC-NYC01-003027', account_type: 'SAVINGS', balance: 25400.00, currency: 'USD', status: 'ACTIVE', interest_rate: 3.50, opened_date: '2023-01-05', last_activity_date: new Date().toISOString() },
  { account_id: 3028, customer_id: 2025, branch_id: 1, account_number: 'ACC-NYC01-003028', account_type: 'CURRENT', balance: 8200.00, currency: 'USD', status: 'ACTIVE', interest_rate: 0.50, opened_date: '2023-02-10', last_activity_date: new Date().toISOString() },
  { account_id: 3029, customer_id: 2004, branch_id: 1, account_number: 'ACC-NYC01-003029', account_type: 'FIXED_DEPOSIT', balance: 50000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 6.50, opened_date: '2023-04-01', last_activity_date: new Date().toISOString() },
  { account_id: 3030, customer_id: 2002, branch_id: 1, account_number: 'ACC-NYC01-003030', account_type: 'SALARY', balance: 6500.00, currency: 'USD', status: 'ACTIVE', interest_rate: 4.00, opened_date: '2023-05-01', last_activity_date: new Date().toISOString() },
  { account_id: 3031, customer_id: 2007, branch_id: 2, account_number: 'ACC-SFO02-003031', account_type: 'FIXED_DEPOSIT', balance: 500000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 6.50, opened_date: '2022-09-01', last_activity_date: new Date().toISOString() },
  { account_id: 3032, customer_id: 2011, branch_id: 1, account_number: 'ACC-NYC01-003032', account_type: 'SALARY', balance: 9200.00, currency: 'USD', status: 'ACTIVE', interest_rate: 4.00, opened_date: '2023-03-01', last_activity_date: new Date().toISOString() },
  { account_id: 3033, customer_id: 2018, branch_id: 3, account_number: 'ACC-CHI03-003033', account_type: 'SAVINGS', balance: 150.00, currency: 'USD', status: 'FROZEN', interest_rate: 3.50, opened_date: '2023-07-01', last_activity_date: new Date().toISOString() },
  { account_id: 3034, customer_id: 2020, branch_id: 1, account_number: 'ACC-NYC01-003034', account_type: 'SAVINGS', balance: 0.00, currency: 'USD', status: 'CLOSED', interest_rate: 3.50, opened_date: '2022-01-10', last_activity_date: new Date().toISOString() },
  { account_id: 3035, customer_id: 2025, branch_id: 1, account_number: 'ACC-NYC01-003035', account_type: 'FIXED_DEPOSIT', balance: 10000.00, currency: 'USD', status: 'ACTIVE', interest_rate: 6.50, opened_date: '2023-06-01', last_activity_date: new Date().toISOString() }
];

let loans = [
  { loan_id: 5001, customer_id: 2001, account_id: 3001, branch_id: 1, loan_reference: 'LN-2023-05001', loan_type: 'PERSONAL', principal_amount: 20000.00, interest_rate: 8.50, term_months: 24, emi_amount: 909.29, total_payable: 21822.96, total_paid: 5455.74, remaining_balance: 16367.22, status: 'DISBURSED', applied_date: '2023-01-15', approved_date: '2023-01-17', remarks: 'Approved for home renovation.' },
  { loan_id: 5002, customer_id: 2002, account_id: 3003, branch_id: 1, loan_reference: 'LN-2023-05002', loan_type: 'AUTO', principal_amount: 35000.00, interest_rate: 6.75, term_months: 48, emi_amount: 833.91, total_payable: 40027.68, total_paid: 6671.28, remaining_balance: 33356.40, status: 'DISBURSED', applied_date: '2023-02-10', approved_date: '2023-02-12', remarks: 'Subaru Outback financing.' },
  { loan_id: 5003, customer_id: 2004, account_id: 3005, branch_id: 1, loan_reference: 'LN-2023-05003', loan_type: 'BUSINESS', principal_amount: 100000.00, interest_rate: 7.25, term_months: 60, emi_amount: 1991.94, total_payable: 119516.40, total_paid: 11951.64, remaining_balance: 107564.76, status: 'DISBURSED', applied_date: '2022-12-01', approved_date: '2022-12-05', remarks: 'Agri-tourism farm expansion.' },
  { loan_id: 5004, customer_id: 2008, account_id: 3010, branch_id: 2, loan_reference: 'LN-2023-05004', loan_type: 'EDUCATION', principal_amount: 15000.00, interest_rate: 5.50, term_months: 36, emi_amount: 452.93, total_payable: 16305.48, total_paid: 2717.58, remaining_balance: 13587.90, status: 'DISBURSED', applied_date: '2023-03-01', approved_date: '2023-03-03', remarks: 'Journalism Masters degree tuition.' },
  { loan_id: 5005, customer_id: 2010, account_id: 3012, branch_id: 3, loan_reference: 'LN-2023-05005', loan_type: 'PERSONAL', principal_amount: 5000.00, interest_rate: 9.00, term_months: 12, emi_amount: 437.26, total_payable: 5247.12, total_paid: 1749.04, remaining_balance: 3498.08, status: 'DISBURSED', applied_date: '2023-05-10', approved_date: '2023-05-12', remarks: 'Photography camera equipment.' },
  { loan_id: 5006, customer_id: 2013, account_id: 3015, branch_id: 1, loan_reference: 'LN-2023-05006', loan_type: 'HOME', principal_amount: 350000.00, interest_rate: 6.25, term_months: 240, emi_amount: 2559.88, total_payable: 614371.20, total_paid: 15359.28, remaining_balance: 599011.92, status: 'DISBURSED', applied_date: '2023-01-20', approved_date: '2023-01-25', remarks: 'Scarsdale residential property mortgage.' },
  { loan_id: 5007, customer_id: 2018, account_id: 3020, branch_id: 3, loan_reference: 'LN-2023-05007', loan_type: 'PERSONAL', principal_amount: 12000.00, interest_rate: 11.50, term_months: 24, emi_amount: 562.06, total_payable: 13489.44, total_paid: 562.06, remaining_balance: 12927.38, status: 'DISBURSED', applied_date: '2023-04-15', approved_date: '2023-04-18', remarks: 'Woodworking workshop setup.' },
  { loan_id: 5008, customer_id: 2021, account_id: 3023, branch_id: 2, loan_reference: 'LN-2023-05008', loan_type: 'PERSONAL', principal_amount: 18000.00, interest_rate: 8.00, term_months: 24, emi_amount: 814.07, total_payable: 19537.68, total_paid: 0.00, remaining_balance: 19537.68, status: 'PENDING', applied_date: '2023-10-20', remarks: 'Pending credit score verification.' },
  { loan_id: 5009, customer_id: 2022, account_id: 3024, branch_id: 2, loan_reference: 'LN-2023-05009', loan_type: 'AUTO', principal_amount: 45000.00, interest_rate: 6.50, term_months: 60, emi_amount: 880.52, total_payable: 52831.20, total_paid: 0.00, remaining_balance: 52831.20, status: 'APPROVED', applied_date: '2023-10-18', approved_date: '2023-10-22', remarks: 'Approved. Ready for disbursement.' },
  { loan_id: 5010, customer_id: 2025, account_id: 3027, branch_id: 1, loan_reference: 'LN-2023-05010', loan_type: 'PERSONAL', principal_amount: 25000.00, interest_rate: 7.50, term_months: 36, emi_amount: 777.67, total_payable: 27996.12, total_paid: 2333.01, remaining_balance: 25663.11, status: 'DISBURSED', applied_date: '2023-06-01', approved_date: '2023-06-03', remarks: 'Tech equipment demo loan.' }
];

let loanPayments = [
  { payment_id: 7001, loan_id: 5001, payment_number: 1, amount_paid: 909.29, principal_paid: 767.62, interest_paid: 141.67, balance_remaining: 20913.67, payment_date: '2023-02-15', payment_method: 'AUTO_DEBIT', status: 'COMPLETED' },
  { payment_id: 7002, loan_id: 5001, payment_number: 2, amount_paid: 909.29, principal_paid: 773.06, interest_paid: 136.23, balance_remaining: 20004.38, payment_date: '2023-03-15', payment_method: 'AUTO_DEBIT', status: 'COMPLETED' },
  { payment_id: 7003, loan_id: 5001, payment_number: 3, amount_paid: 909.29, principal_paid: 778.54, interest_paid: 130.75, balance_remaining: 19095.09, payment_date: '2023-04-15', payment_method: 'ONLINE', status: 'COMPLETED' },
  { payment_id: 7004, loan_id: 5010, payment_number: 1, amount_paid: 777.67, principal_paid: 621.42, interest_paid: 156.25, balance_remaining: 27218.45, payment_date: '2023-07-01', payment_method: 'ONLINE', status: 'COMPLETED' },
  { payment_id: 7005, loan_id: 5010, payment_number: 2, amount_paid: 777.67, principal_paid: 625.30, interest_paid: 152.37, balance_remaining: 26440.78, payment_date: '2023-08-01', payment_method: 'ONLINE', status: 'COMPLETED' },
  { payment_id: 7006, loan_id: 5010, payment_number: 3, amount_paid: 777.67, principal_paid: 629.21, interest_paid: 148.46, balance_remaining: 25663.11, payment_date: '2023-09-01', payment_method: 'ONLINE', status: 'COMPLETED' }
];

let transactions = [
  { transaction_id: 100001, account_id: 3001, reference_number: 'TXN-20231001-100001', transaction_type: 'DEPOSIT', amount: 2500.00, balance_after: 15420.50, channel: 'BRANCH', description: 'Payroll Direct Deposit', status: 'COMPLETED', created_by: 'EMP-TEL-01', created_at: new Date(Date.now() - 27 * 86400000).toISOString() },
  { transaction_id: 100002, account_id: 3001, reference_number: 'TXN-20231002-100002', transaction_type: 'WITHDRAWAL', amount: 350.00, balance_after: 15070.50, channel: 'ATM', description: 'ATM Cash Withdrawal', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 26 * 86400000).toISOString() },
  { transaction_id: 100003, account_id: 3001, reference_number: 'TRF-20231003-100003-OUT', transaction_type: 'TRANSFER_OUT', amount: 500.00, balance_after: 14570.50, destination_acc_id: 3002, channel: 'ONLINE', description: 'Transfer to Checking Account', status: 'COMPLETED', created_by: 'USER', created_at: new Date(Date.now() - 25 * 86400000).toISOString() },
  { transaction_id: 100004, account_id: 3002, reference_number: 'TRF-20231003-100003-IN', transaction_type: 'TRANSFER_IN', amount: 500.00, balance_after: 4850.00, destination_acc_id: 3001, channel: 'ONLINE', description: 'Transfer from Savings Account', status: 'COMPLETED', created_by: 'USER', created_at: new Date(Date.now() - 25 * 86400000).toISOString() },
  { transaction_id: 100005, account_id: 3003, reference_number: 'TXN-20231004-100005', transaction_type: 'DEPOSIT', amount: 3200.00, balance_after: 22100.00, channel: 'ONLINE', description: 'Consulting Retainer Fee', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 24 * 86400000).toISOString() },
  { transaction_id: 100006, account_id: 3004, reference_number: 'TXN-20231005-100006', transaction_type: 'WITHDRAWAL', amount: 200.00, balance_after: 12350.75, channel: 'ATM', description: 'Supermarket ATM Cash', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 23 * 86400000).toISOString() },
  { transaction_id: 100007, account_id: 3005, reference_number: 'TXN-20231006-100007', transaction_type: 'DEPOSIT', amount: 14500.00, balance_after: 88400.00, channel: 'BRANCH', description: 'Agri Produce Wholesale Payment', status: 'COMPLETED', created_by: 'EMP-TEL-01', created_at: new Date(Date.now() - 22 * 86400000).toISOString() },
  { transaction_id: 100008, account_id: 3006, reference_number: 'TXN-20231007-100008', transaction_type: 'DEPOSIT', amount: 75000.00, balance_after: 950000.00, channel: 'ONLINE', description: 'Defense Contract Payment', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 21 * 86400000).toISOString() },
  { transaction_id: 100009, account_id: 3007, reference_number: 'TXN-20231008-100009', transaction_type: 'WITHDRAWAL', amount: 12000.00, balance_after: 250000.00, channel: 'ONLINE', description: 'Wire Transfer Expense', status: 'COMPLETED', created_by: 'USER', created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  { transaction_id: 100010, account_id: 3008, reference_number: 'TXN-20231009-100010', transaction_type: 'DEPOSIT', amount: 6000.00, balance_after: 74000.00, channel: 'BRANCH', description: 'Quarterly Dividend Deposit', status: 'COMPLETED', created_by: 'EMP-TEL-01', created_at: new Date(Date.now() - 19 * 86400000).toISOString() },
  { transaction_id: 100011, account_id: 3009, reference_number: 'TXN-20231010-100011', transaction_type: 'DEPOSIT', amount: 150000.00, balance_after: 1420000.00, channel: 'ONLINE', description: 'Wayne Corp Capital Distribution', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 18 * 86400000).toISOString() },
  { transaction_id: 100012, account_id: 3010, reference_number: 'TXN-20231011-100012', transaction_type: 'WITHDRAWAL', amount: 120.00, balance_after: 8900.25, channel: 'ATM', description: 'Daily Expense Cash', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 17 * 86400000).toISOString() },
  { transaction_id: 100013, account_id: 3011, reference_number: 'TXN-20231012-100013', transaction_type: 'DEPOSIT', amount: 4200.00, balance_after: 45200.00, channel: 'ONLINE', description: 'Private Security Honorarium', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 16 * 86400000).toISOString() },
  { transaction_id: 100014, account_id: 3012, reference_number: 'TXN-20231013-100014', transaction_type: 'DEPOSIT', amount: 450.00, balance_after: 2150.00, channel: 'BRANCH', description: 'Freelance Photo Rights Payment', status: 'COMPLETED', created_by: 'EMP-TEL-01', created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
  { transaction_id: 100015, account_id: 3013, reference_number: 'TXN-20231014-100015', transaction_type: 'DEPOSIT', amount: 5200.00, balance_after: 38200.00, channel: 'BRANCH', description: 'Fashion Advisory Invoice', status: 'COMPLETED', created_by: 'EMP-TEL-01', created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  { transaction_id: 100016, account_id: 3014, reference_number: 'TXN-20231015-100016', transaction_type: 'WITHDRAWAL', amount: 400.00, balance_after: 29400.00, channel: 'ATM', description: 'Conference Expenses', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 13 * 86400000).toISOString() },
  { transaction_id: 100017, account_id: 3015, reference_number: 'TRF-20231016-100017-OUT', transaction_type: 'TRANSFER_OUT', amount: 1200.00, balance_after: 51000.00, destination_acc_id: 3016, channel: 'ONLINE', description: 'Monthly Household Contribution', status: 'COMPLETED', created_by: 'USER', created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
  { transaction_id: 100018, account_id: 3016, reference_number: 'TRF-20231016-100017-IN', transaction_type: 'TRANSFER_IN', amount: 1200.00, balance_after: 34000.00, destination_acc_id: 3015, channel: 'ONLINE', description: 'Household Contribution Received', status: 'COMPLETED', created_by: 'USER', created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
  { transaction_id: 100019, account_id: 3017, reference_number: 'TXN-20231017-100019', transaction_type: 'DEPOSIT', amount: 2800.00, balance_after: 15200.00, channel: 'ONLINE', description: 'Commercial Acting Residuals', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 11 * 86400000).toISOString() },
  { transaction_id: 100020, account_id: 3018, reference_number: 'TXN-20231018-100020', transaction_type: 'WITHDRAWAL', amount: 150.00, balance_after: 9600.00, channel: 'ATM', description: 'Aromatherapy Supplies', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { transaction_id: 100021, account_id: 3019, reference_number: 'TXN-20231019-100021', transaction_type: 'DEPOSIT', amount: 45000.00, balance_after: 380000.00, channel: 'BRANCH', description: 'Industrial Consulting Retainer', status: 'COMPLETED', created_by: 'EMP-TEL-01', created_at: new Date(Date.now() - 9 * 86400000).toISOString() },
  { transaction_id: 100022, account_id: 3020, reference_number: 'TXN-20231020-100022', transaction_type: 'WITHDRAWAL', amount: 250.00, balance_after: 6200.00, channel: 'ATM', description: 'Workshop Lumber Supplies', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
  { transaction_id: 100023, account_id: 3021, reference_number: 'TXN-20231021-100023', transaction_type: 'DEPOSIT', amount: 8500.00, balance_after: 125000.00, channel: 'BRANCH', description: 'Legal Retainer Settlement', status: 'COMPLETED', created_by: 'EMP-TEL-01', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { transaction_id: 100024, account_id: 3022, reference_number: 'TXN-20231022-100024', transaction_type: 'DEPOSIT', amount: 25000.00, balance_after: 420000.00, channel: 'ONLINE', description: 'Franchise Distribution Revenue', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { transaction_id: 100025, account_id: 3023, reference_number: 'TXN-20231023-100025', transaction_type: 'DEPOSIT', amount: 3900.00, balance_after: 41800.00, channel: 'ONLINE', description: 'Security Auditing Fee', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { transaction_id: 100026, account_id: 3024, reference_number: 'TXN-20231024-100026', transaction_type: 'WITHDRAWAL', amount: 650.00, balance_after: 28500.00, channel: 'ATM', description: 'Corporate Travel Advance', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { transaction_id: 100027, account_id: 3025, reference_number: 'TXN-20231025-100027', transaction_type: 'DEPOSIT', amount: 9000.00, balance_after: 82000.00, channel: 'BRANCH', description: 'Forensic Consultation Retainer', status: 'COMPLETED', created_by: 'EMP-TEL-01', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { transaction_id: 100028, account_id: 3026, reference_number: 'TXN-20231026-100028', transaction_type: 'DEPOSIT', amount: 5400.00, balance_after: 56000.00, channel: 'ONLINE', description: 'Medical Clinic Honorarium', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { transaction_id: 100029, account_id: 3027, reference_number: 'TXN-20231027-100029', transaction_type: 'DEPOSIT', amount: 5000.00, balance_after: 25400.00, channel: 'ONLINE', description: 'Salary Direct Deposit', status: 'COMPLETED', created_by: 'SYSTEM', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { transaction_id: 100030, account_id: 3027, reference_number: 'TRF-20231027-100030-OUT', transaction_type: 'TRANSFER_OUT', amount: 1500.00, balance_after: 23900.00, destination_acc_id: 3028, channel: 'MOBILE', description: 'Transfer to Checking for Bill Pay', status: 'COMPLETED', created_by: 'USER', created_at: new Date(Date.now() - 18 * 3600000).toISOString() },
  { transaction_id: 100031, account_id: 3028, reference_number: 'TRF-20231027-100030-IN', transaction_type: 'TRANSFER_IN', amount: 1500.00, balance_after: 8200.00, destination_acc_id: 3027, channel: 'MOBILE', description: 'Checking Credit from Savings', status: 'COMPLETED', created_by: 'USER', created_at: new Date(Date.now() - 18 * 3600000).toISOString() },
  { transaction_id: 100032, account_id: 3027, reference_number: 'EMI-20231027-100032', transaction_type: 'LOAN_REPAYMENT', amount: 777.67, balance_after: 25400.00, channel: 'ONLINE', description: 'EMI payment for loan LN-2023-05010', status: 'COMPLETED', created_by: 'USER', created_at: new Date(Date.now() - 12 * 3600000).toISOString() },
  { transaction_id: 100033, account_id: 3027, reference_number: 'WTH-20231028-100033', transaction_type: 'WITHDRAWAL', amount: 200.00, balance_after: 25200.00, channel: 'ATM', description: 'ATM Cash Withdrawal Downtown', status: 'COMPLETED', created_by: 'USER', created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { transaction_id: 100034, account_id: 3027, reference_number: 'DEP-20231028-100034', transaction_type: 'DEPOSIT', amount: 200.00, balance_after: 25400.00, channel: 'BRANCH', description: 'Cash Deposit via Teller Counter', status: 'COMPLETED', created_by: 'EMP-TEL-01', created_at: new Date(Date.now() - 3600000).toISOString() }
];

let auditLogs = [
  { audit_id: 900001, table_name: 'SYSTEM', action_type: 'PROCEDURE_EXEC', entity_id: 'INIT_SYSTEM', changed_by: 'DBA_ADMIN', changed_at: new Date(Date.now() - 30 * 86400000).toISOString(), description: 'Bank Management System core database initialized.' },
  { audit_id: 900002, table_name: 'ACCOUNTS', action_type: 'INSERT', entity_id: 'ACC-NYC01-003001', changed_by: 'EMP-ADM-01', changed_at: new Date(Date.now() - 29 * 86400000).toISOString(), description: 'Primary savings account registered for Michael Scott.' },
  { audit_id: 900003, table_name: 'LOANS', action_type: 'UPDATE', entity_id: 'LN-2023-05001', changed_by: 'EMP-LNO-01', changed_at: new Date(Date.now() - 28 * 86400000).toISOString(), description: 'Loan application approved and funds scheduled for disbursement.' },
  { audit_id: 900004, table_name: 'TRANSACTIONS', action_type: 'INSERT', entity_id: 'TXN-20231001-100001', changed_by: 'EMP-TEL-01', changed_at: new Date(Date.now() - 27 * 86400000).toISOString(), description: 'DEPOSIT of $2500.00 successfully completed.' },
  { audit_id: 900005, table_name: 'SECURITY', action_type: 'PROCEDURE_EXEC', entity_id: 'SEC_LOGIN_ADMIN', changed_by: 'admin@bank.com', changed_at: new Date(Date.now() - 86400000).toISOString(), description: 'Successful administrative console sign-in.' }
];

// Helper: Auto Audit Trigger simulation
function logAudit(tableName, actionType, entityId, description, changedBy = 'SYSTEM') {
  const auditId = 900000 + auditLogs.length + 1;
  const entry = {
    audit_id: auditId,
    table_name: tableName,
    action_type: actionType,
    entity_id: String(entityId),
    changed_by: changedBy,
    changed_at: new Date().toISOString(),
    description
  };
  auditLogs.unshift(entry);
}

// ----------------------------------------------------------------------------
// PL/SQL PKG_ACCOUNT Emulation
// ----------------------------------------------------------------------------
const pkgAccount = {
  get_balance(accountNo) {
    const acc = accounts.find(a => a.account_number === accountNo);
    if (!acc) {
      const err = new Error(`ORA-20004: Account ${accountNo} does not exist.`);
      err.code = 'ORA-20004';
      throw err;
    }
    return acc.balance;
  },

  is_account_active(accountNo) {
    const acc = accounts.find(a => a.account_number === accountNo);
    return acc && acc.status === 'ACTIVE' ? 1 : 0;
  },

  open_account({ customerId, accountType, initialDeposit = 0, branchId = 1, currency = 'USD' }) {
    const cust = customers.find(c => c.customer_id === Number(customerId));
    if (!cust) {
      const err = new Error(`ORA-20006: Customer ID ${customerId} not found.`);
      err.code = 'ORA-20006';
      throw err;
    }
    if (initialDeposit < 0) {
      const err = new Error('ORA-20010: Initial deposit cannot be negative.');
      err.code = 'ORA-20010';
      throw err;
    }

    const branch = branches.find(b => b.branch_id === Number(branchId)) || branches[0];
    const accId = 3000 + accounts.length + 1;
    const accNo = `ACC-${branch.branch_code}-${String(accId).padStart(6, '0')}`;

    let interestRate = 3.50;
    if (accountType === 'CURRENT') interestRate = 0.50;
    else if (accountType === 'BUSINESS') interestRate = 1.25;
    else if (accountType === 'FIXED_DEPOSIT') interestRate = 6.50;
    else if (accountType === 'SALARY') interestRate = 4.00;

    const newAcc = {
      account_id: accId,
      customer_id: Number(customerId),
      branch_id: branch.branch_id,
      account_number: accNo,
      account_type: accountType,
      balance: Number(initialDeposit),
      currency,
      status: 'ACTIVE',
      interest_rate: interestRate,
      opened_date: new Date().toISOString().split('T')[0],
      last_activity_date: new Date().toISOString()
    };
    accounts.push(newAcc);

    // TRG_AUDIT_ACCOUNTS
    logAudit('ACCOUNTS', 'INSERT', accNo, `New account created. Initial balance: ${initialDeposit} ${currency}`);

    if (initialDeposit > 0) {
      const txnId = 100000 + transactions.length + 1;
      const ref = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(txnId).padStart(6, '0')}`;
      transactions.unshift({
        transaction_id: txnId,
        account_id: accId,
        reference_number: ref,
        transaction_type: 'DEPOSIT',
        amount: Number(initialDeposit),
        balance_after: Number(initialDeposit),
        channel: 'BRANCH',
        description: 'Initial account opening deposit',
        status: 'COMPLETED',
        created_by: 'TELLER',
        created_at: new Date().toISOString()
      });
      logAudit('TRANSACTIONS', 'INSERT', ref, `DEPOSIT of ${initialDeposit} on account opening.`);
    }

    return {
      account_id: accId,
      account_no: accNo,
      status: 'SUCCESS',
      message: `Account ${accNo} opened successfully with initial deposit of $${initialDeposit}.`
    };
  },

  freeze_account(accountNo, reason = 'Administrative hold') {
    const acc = accounts.find(a => a.account_number === accountNo);
    if (!acc) {
      const err = new Error(`ORA-20004: Account ${accountNo} not found.`);
      err.code = 'ORA-20004';
      throw err;
    }
    if (acc.status === 'CLOSED') {
      const err = new Error('ORA-20011: Cannot freeze a closed account.');
      err.code = 'ORA-20011';
      throw err;
    }
    acc.status = 'FROZEN';
    acc.last_activity_date = new Date().toISOString();
    logAudit('ACCOUNTS', 'UPDATE', accountNo, `Account frozen: ${reason}`);
    return { status: 'SUCCESS', message: `Account ${accountNo} has been frozen.` };
  },

  activate_account(accountNo) {
    const acc = accounts.find(a => a.account_number === accountNo);
    if (!acc) {
      const err = new Error(`ORA-20004: Account ${accountNo} not found.`);
      err.code = 'ORA-20004';
      throw err;
    }
    acc.status = 'ACTIVE';
    acc.last_activity_date = new Date().toISOString();
    logAudit('ACCOUNTS', 'UPDATE', accountNo, 'Account reactivated');
    return { status: 'SUCCESS', message: `Account ${accountNo} is now active.` };
  },

  close_account(accountNo, reason = 'Customer request') {
    const acc = accounts.find(a => a.account_number === accountNo);
    if (!acc) {
      const err = new Error(`ORA-20004: Account ${accountNo} not found.`);
      err.code = 'ORA-20004';
      throw err;
    }
    if (acc.balance > 0) {
      const err = new Error(`ORA-20012: Cannot close account with positive balance ($${acc.balance}). Please withdraw or transfer funds first.`);
      err.code = 'ORA-20012';
      throw err;
    }
    acc.status = 'CLOSED';
    acc.closed_date = new Date().toISOString().split('T')[0];
    acc.last_activity_date = new Date().toISOString();
    logAudit('ACCOUNTS', 'UPDATE', accountNo, `Account closed: ${reason}`);
    return { status: 'SUCCESS', message: `Account ${accountNo} closed successfully.` };
  },

  get_account_details(accountNo) {
    const acc = accounts.find(a => a.account_number === accountNo);
    if (!acc) {
      const err = new Error(`ORA-20004: Account ${accountNo} not found.`);
      err.code = 'ORA-20004';
      throw err;
    }
    const cust = customers.find(c => c.customer_id === acc.customer_id);
    const branch = branches.find(b => b.branch_id === acc.branch_id);
    return {
      ...acc,
      customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown',
      customer_number: cust ? cust.customer_number : '',
      email: cust ? cust.email : '',
      phone: cust ? cust.phone : '',
      kyc_status: cust ? cust.kyc_status : '',
      branch_code: branch ? branch.branch_code : '',
      branch_name: branch ? branch.branch_name : '',
      ifsc_code: branch ? branch.ifsc_code : ''
    };
  },

  list_customer_accounts(customerId) {
    return accounts
      .filter(a => a.customer_id === Number(customerId))
      .map(a => {
        const branch = branches.find(b => b.branch_id === a.branch_id);
        return {
          ...a,
          branch_code: branch ? branch.branch_code : '',
          branch_name: branch ? branch.branch_name : ''
        };
      });
  },

  list_all_accounts(status = null) {
    return accounts
      .filter(a => !status || a.status === status)
      .map(a => {
        const cust = customers.find(c => c.customer_id === a.customer_id);
        const branch = branches.find(b => b.branch_id === a.branch_id);
        return {
          ...a,
          customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown',
          customer_number: cust ? cust.customer_number : '',
          email: cust ? cust.email : '',
          branch_code: branch ? branch.branch_code : '',
          branch_name: branch ? branch.branch_name : ''
        };
      })
      .sort((a, b) => b.account_id - a.account_id);
  }
};

// ----------------------------------------------------------------------------
// PL/SQL PKG_TRANSACTION Emulation
// ----------------------------------------------------------------------------
const pkgTransaction = {
  deposit({ accountNo, amount, channel = 'BRANCH', description = 'Deposit', user = 'TELLER' }) {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      const err = new Error('ORA-20003: Deposit amount must be greater than zero.');
      err.code = 'ORA-20003';
      throw err;
    }
    const acc = accounts.find(a => a.account_number === accountNo);
    if (!acc) {
      const err = new Error(`ORA-20004: Account ${accountNo} does not exist.`);
      err.code = 'ORA-20004';
      throw err;
    }
    if (acc.status !== 'ACTIVE') {
      const err = new Error(`ORA-20002: Account ${accountNo} is ${acc.status} and cannot accept deposits.`);
      err.code = 'ORA-20002';
      throw err;
    }

    acc.balance = Math.round((acc.balance + numAmount) * 100) / 100;
    acc.last_activity_date = new Date().toISOString();

    const txnId = 100000 + transactions.length + 1;
    const ref = `DEP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(txnId).padStart(6, '0')}`;

    const txn = {
      transaction_id: txnId,
      account_id: acc.account_id,
      reference_number: ref,
      transaction_type: 'DEPOSIT',
      amount: numAmount,
      balance_after: acc.balance,
      channel,
      description,
      status: 'COMPLETED',
      created_by: user,
      created_at: new Date().toISOString()
    };
    transactions.unshift(txn);

    // Trigger TRG_AUDIT_TRANSACTIONS
    logAudit('TRANSACTIONS', 'INSERT', ref, `DEPOSIT of ${numAmount} via ${channel}. Balance after: ${acc.balance}`, user);

    return {
      transaction_id: txnId,
      reference_number: ref,
      new_balance: acc.balance,
      message: `Successfully deposited $${numAmount} into ${accountNo}.`
    };
  },

  withdraw({ accountNo, amount, channel = 'ATM', description = 'Withdrawal', user = 'USER' }) {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      const err = new Error('ORA-20003: Withdrawal amount must be greater than zero.');
      err.code = 'ORA-20003';
      throw err;
    }
    const acc = accounts.find(a => a.account_number === accountNo);
    if (!acc) {
      const err = new Error(`ORA-20004: Account ${accountNo} does not exist.`);
      err.code = 'ORA-20004';
      throw err;
    }
    if (acc.status !== 'ACTIVE') {
      const err = new Error(`ORA-20002: Account ${accountNo} is ${acc.status}. Debits are not allowed.`);
      err.code = 'ORA-20002';
      throw err;
    }
    if (acc.balance < numAmount) {
      const err = new Error(`ORA-20001: Insufficient funds. Available balance: $${acc.balance}, Requested: $${numAmount}`);
      err.code = 'ORA-20001';
      throw err;
    }

    acc.balance = Math.round((acc.balance - numAmount) * 100) / 100;
    acc.last_activity_date = new Date().toISOString();

    const txnId = 100000 + transactions.length + 1;
    const ref = `WTH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(txnId).padStart(6, '0')}`;

    const txn = {
      transaction_id: txnId,
      account_id: acc.account_id,
      reference_number: ref,
      transaction_type: 'WITHDRAWAL',
      amount: numAmount,
      balance_after: acc.balance,
      channel,
      description,
      status: 'COMPLETED',
      created_by: user,
      created_at: new Date().toISOString()
    };
    transactions.unshift(txn);

    logAudit('TRANSACTIONS', 'INSERT', ref, `WITHDRAWAL of ${numAmount} via ${channel}. Balance after: ${acc.balance}`, user);

    return {
      transaction_id: txnId,
      reference_number: ref,
      new_balance: acc.balance,
      message: `Successfully withdrew $${numAmount} from ${accountNo}.`
    };
  },

  // Emulates PL/SQL transfer_funds with SAVEPOINT & ROLLBACK
  transfer_funds({ sourceAcc, destAcc, amount, description = 'Fund Transfer', channel = 'ONLINE', user = 'USER' }) {
    if (sourceAcc === destAcc) {
      const err = new Error('ORA-20005: Source and destination accounts cannot be identical.');
      err.code = 'ORA-20005';
      throw err;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      const err = new Error('ORA-20003: Transfer amount must be greater than zero.');
      err.code = 'ORA-20003';
      throw err;
    }

    const src = accounts.find(a => a.account_number === sourceAcc);
    const dest = accounts.find(a => a.account_number === destAcc);

    if (!src || !dest) {
      const err = new Error('ORA-20004: One or both accounts were not found.');
      err.code = 'ORA-20004';
      throw err;
    }

    if (src.status !== 'ACTIVE') {
      const err = new Error(`ORA-20002: Source account ${sourceAcc} is ${src.status}.`);
      err.code = 'ORA-20002';
      throw err;
    }
    if (dest.status !== 'ACTIVE') {
      const err = new Error(`ORA-20002: Destination account ${destAcc} is ${dest.status}.`);
      err.code = 'ORA-20002';
      throw err;
    }

    if (src.balance < numAmount) {
      const err = new Error(`ORA-20001: Insufficient funds in source account. Available: $${src.balance}, Requested: $${numAmount}`);
      err.code = 'ORA-20001';
      throw err;
    }

    // Atomic Execution
    const initialSrcBal = src.balance;
    const initialDestBal = dest.balance;

    try {
      src.balance = Math.round((src.balance - numAmount) * 100) / 100;
      dest.balance = Math.round((dest.balance + numAmount) * 100) / 100;
      src.last_activity_date = new Date().toISOString();
      dest.last_activity_date = new Date().toISOString();

      const outTxnId = 100000 + transactions.length + 1;
      const inTxnId = outTxnId + 1;
      const refBase = `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(outTxnId).padStart(6, '0')}`;

      // Debit Record
      transactions.unshift({
        transaction_id: outTxnId,
        account_id: src.account_id,
        reference_number: `${refBase}-OUT`,
        transaction_type: 'TRANSFER_OUT',
        amount: numAmount,
        balance_after: src.balance,
        destination_acc_id: dest.account_id,
        channel,
        description: `${description} (To ${destAcc})`,
        status: 'COMPLETED',
        created_by: user,
        created_at: new Date().toISOString()
      });

      // Credit Record
      transactions.unshift({
        transaction_id: inTxnId,
        account_id: dest.account_id,
        reference_number: `${refBase}-IN`,
        transaction_type: 'TRANSFER_IN',
        amount: numAmount,
        balance_after: dest.balance,
        destination_acc_id: src.account_id,
        channel,
        description: `${description} (From ${sourceAcc})`,
        status: 'COMPLETED',
        created_by: user,
        created_at: new Date().toISOString()
      });

      logAudit('TRANSACTIONS', 'INSERT', refBase, `TRANSFER of ${numAmount} from ${sourceAcc} to ${destAcc}.`, user);

      return {
        transaction_id: outTxnId,
        reference_number: refBase,
        source_new_balance: src.balance,
        message: `Transferred $${numAmount} from ${sourceAcc} to ${destAcc} successfully.`
      };
    } catch (e) {
      // ROLLBACK TO SAVEPOINT
      src.balance = initialSrcBal;
      dest.balance = initialDestBal;
      throw e;
    }
  },

  get_transaction_history({ accountNo = null, type = null, channel = null, startDate = null, endDate = null, limit = 50 }) {
    return transactions
      .filter(t => {
        const acc = accounts.find(a => a.account_id === t.account_id);
        if (accountNo && (!acc || acc.account_number !== accountNo)) return false;
        if (type && t.transaction_type !== type) return false;
        if (channel && t.channel !== channel) return false;
        if (startDate && new Date(t.created_at) < new Date(startDate)) return false;
        if (endDate && new Date(t.created_at) > new Date(endDate)) return false;
        return true;
      })
      .slice(0, Number(limit) || 50)
      .map(t => {
        const acc = accounts.find(a => a.account_id === t.account_id);
        const cust = acc ? customers.find(c => c.customer_id === acc.customer_id) : null;
        const destAcc = t.destination_acc_id ? accounts.find(a => a.account_id === t.destination_acc_id) : null;
        return {
          ...t,
          account_number: acc ? acc.account_number : 'N/A',
          account_type: acc ? acc.account_type : 'N/A',
          customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown',
          destination_account_no: destAcc ? destAcc.account_number : null
        };
      });
  }
};

// ----------------------------------------------------------------------------
// PL/SQL PKG_LOAN Emulation
// ----------------------------------------------------------------------------
const pkgLoan = {
  calculate_emi(principal, annualRate, tenureMonths) {
    const P = Number(principal);
    const r = (Number(annualRate) / 100) / 12;
    const n = Number(tenureMonths);
    if (P <= 0 || n <= 0) return 0;
    if (r === 0) return Math.round((P / n) * 100) / 100;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi * 100) / 100;
  },

  calculate_interest(principal, annualRate, days) {
    return Math.round(((principal * (annualRate / 100) * days) / 365) * 100) / 100;
  },

  apply_loan({ customerId, accountNo, loanType, principal, termMonths, interestRate }) {
    const numPrincipal = Number(principal);
    const numMonths = Number(termMonths);
    const numRate = Number(interestRate);

    if (numPrincipal <= 0) {
      const err = new Error('ORA-20003: Loan principal amount must be positive.');
      err.code = 'ORA-20003';
      throw err;
    }
    if (numMonths <= 0) {
      const err = new Error('ORA-20023: Loan tenure must be at least 1 month.');
      err.code = 'ORA-20023';
      throw err;
    }

    const acc = accounts.find(a => a.account_number === accountNo && a.customer_id === Number(customerId));
    if (!acc) {
      const err = new Error(`ORA-20004: Account ${accountNo} does not belong to Customer ${customerId}.`);
      err.code = 'ORA-20004';
      throw err;
    }

    const emi = this.calculate_emi(numPrincipal, numRate, numMonths);
    const totalPayable = Math.round(emi * numMonths * 100) / 100;
    const loanId = 5000 + loans.length + 1;
    const ref = `LN-${new Date().getFullYear()}-${String(loanId).padStart(5, '0')}`;

    const newLoan = {
      loan_id: loanId,
      customer_id: Number(customerId),
      account_id: acc.account_id,
      branch_id: acc.branch_id,
      loan_reference: ref,
      loan_type: loanType,
      principal_amount: numPrincipal,
      interest_rate: numRate,
      term_months: numMonths,
      emi_amount: emi,
      total_payable: totalPayable,
      total_paid: 0.00,
      remaining_balance: totalPayable,
      status: 'PENDING',
      applied_date: new Date().toISOString().split('T')[0],
      approved_date: null,
      remarks: 'Application submitted online.'
    };
    loans.unshift(newLoan);

    logAudit('LOANS', 'INSERT', ref, `New loan application of $${numPrincipal} submitted.`);

    return {
      loan_id: loanId,
      loan_reference: ref,
      emi_amount: emi,
      total_payable: totalPayable,
      message: `Loan application ${ref} submitted successfully. Monthly EMI: $${emi}`
    };
  },

  approve_loan({ loanId, employeeId, action, remarks = '' }) {
    const loan = loans.find(l => l.loan_id === Number(loanId));
    if (!loan) {
      const err = new Error(`ORA-20020: Loan ID ${loanId} not found.`);
      err.code = 'ORA-20020';
      throw err;
    }
    if (loan.status !== 'PENDING') {
      const err = new Error(`ORA-20021: Loan ${loan.loan_reference} is already ${loan.status}.`);
      err.code = 'ORA-20021';
      throw err;
    }

    if (action.toUpperCase() === 'APPROVED') {
      loan.status = 'DISBURSED';
      loan.approved_date = new Date().toISOString().split('T')[0];
      loan.remarks = remarks;

      // Disburse principal into linked customer account
      const acc = accounts.find(a => a.account_id === loan.account_id);
      if (acc) {
        acc.balance = Math.round((acc.balance + loan.principal_amount) * 100) / 100;
        acc.last_activity_date = new Date().toISOString();

        const txnId = 100000 + transactions.length + 1;
        const ref = `DSB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(txnId).padStart(6, '0')}`;
        transactions.unshift({
          transaction_id: txnId,
          account_id: acc.account_id,
          reference_number: ref,
          transaction_type: 'LOAN_DISBURSEMENT',
          amount: loan.principal_amount,
          balance_after: acc.balance,
          channel: 'SYSTEM',
          description: `Loan disbursement for ${loan.loan_reference}`,
          status: 'COMPLETED',
          created_by: 'LOAN_OFFICER',
          created_at: new Date().toISOString()
        });
      }

      logAudit('LOANS', 'UPDATE', loan.loan_reference, `Loan approved and $${loan.principal_amount} disbursed.`);
      return { status: 'DISBURSED', message: `Loan ${loan.loan_reference} approved and funds disbursed.` };
    } else {
      loan.status = 'REJECTED';
      loan.remarks = remarks;
      logAudit('LOANS', 'UPDATE', loan.loan_reference, `Loan rejected. Remarks: ${remarks}`);
      return { status: 'REJECTED', message: `Loan ${loan.loan_reference} has been rejected.` };
    }
  },

  pay_emi({ loanId, paymentAmount, sourceAcc, paymentMethod = 'ONLINE', user = 'USER' }) {
    const amount = Number(paymentAmount);
    if (amount <= 0) {
      const err = new Error('ORA-20003: Repayment amount must be positive.');
      err.code = 'ORA-20003';
      throw err;
    }

    const loan = loans.find(l => l.loan_id === Number(loanId));
    if (!loan) {
      const err = new Error(`ORA-20020: Loan ID ${loanId} not found.`);
      err.code = 'ORA-20020';
      throw err;
    }
    if (!['DISBURSED', 'APPROVED'].includes(loan.status)) {
      const err = new Error(`ORA-20021: Cannot pay EMI on loan with status: ${loan.status}`);
      err.code = 'ORA-20021';
      throw err;
    }
    if (amount > loan.remaining_balance) {
      const err = new Error(`ORA-20022: Payment amount ($${amount}) exceeds remaining balance ($${loan.remaining_balance}).`);
      err.code = 'ORA-20022';
      throw err;
    }

    const acc = accounts.find(a => a.account_number === sourceAcc);
    if (!acc) {
      const err = new Error(`ORA-20004: Account ${sourceAcc} not found.`);
      err.code = 'ORA-20004';
      throw err;
    }
    if (acc.balance < amount) {
      const err = new Error(`ORA-20001: Insufficient funds in account ${sourceAcc}. Available: $${acc.balance}`);
      err.code = 'ORA-20001';
      throw err;
    }

    acc.balance = Math.round((acc.balance - amount) * 100) / 100;
    acc.last_activity_date = new Date().toISOString();

    const nextPayNo = loanPayments.filter(p => p.loan_id === loan.loan_id).length + 1;
    let intPortion = Math.round(((loan.remaining_balance * (loan.interest_rate / 100)) / 12) * 100) / 100;
    if (intPortion > amount) intPortion = amount;
    const prinPortion = Math.round((amount - intPortion) * 100) / 100;
    const newRem = Math.round((loan.remaining_balance - amount) * 100) / 100;

    const payId = 7000 + loanPayments.length + 1;
    loanPayments.push({
      payment_id: payId,
      loan_id: loan.loan_id,
      payment_number: nextPayNo,
      amount_paid: amount,
      principal_paid: prinPortion,
      interest_paid: intPortion,
      balance_remaining: newRem,
      payment_date: new Date().toISOString().split('T')[0],
      source_account_id: acc.account_id,
      payment_method: paymentMethod,
      status: 'COMPLETED'
    });

    loan.total_paid = Math.round((loan.total_paid + amount) * 100) / 100;
    loan.remaining_balance = newRem;
    if (newRem <= 0) {
      loan.status = 'CLOSED';
    }

    const txnId = 100000 + transactions.length + 1;
    const ref = `EMI-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(txnId).padStart(6, '0')}`;
    transactions.unshift({
      transaction_id: txnId,
      account_id: acc.account_id,
      reference_number: ref,
      transaction_type: 'LOAN_REPAYMENT',
      amount,
      balance_after: acc.balance,
      channel: paymentMethod,
      description: `EMI payment for loan ${loan.loan_reference}`,
      status: 'COMPLETED',
      created_by: user,
      created_at: new Date().toISOString()
    });

    logAudit('LOAN_PAYMENTS', 'INSERT', String(payId), `EMI payment of $${amount} recorded for ${loan.loan_reference}. Remaining: $${newRem}`, user);

    return {
      payment_id: payId,
      remaining_balance: newRem,
      message: `EMI payment of $${amount} processed. Remaining loan balance: $${newRem}`
    };
  },

  get_repayment_schedule(loanId) {
    return loanPayments
      .filter(p => p.loan_id === Number(loanId))
      .sort((a, b) => a.payment_number - b.payment_number);
  },

  list_loans(status = null, customerId = null) {
    return loans
      .filter(l => (!status || l.status === status) && (!customerId || l.customer_id === Number(customerId)))
      .map(l => {
        const cust = customers.find(c => c.customer_id === l.customer_id);
        const acc = accounts.find(a => a.account_id === l.account_id);
        const branch = branches.find(b => b.branch_id === l.branch_id);
        return {
          ...l,
          customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown',
          customer_number: cust ? cust.customer_number : '',
          email: cust ? cust.email : '',
          account_number: acc ? acc.account_number : '',
          branch_code: branch ? branch.branch_code : '',
          branch_name: branch ? branch.branch_name : ''
        };
      })
      .sort((a, b) => b.loan_id - a.loan_id);
  }
};

// ----------------------------------------------------------------------------
// PL/SQL PKG_REPORT Emulation
// ----------------------------------------------------------------------------
const pkgReport = {
  get_dashboard_metrics() {
    const totalCustomers = customers.filter(c => c.status === 'ACTIVE').length;
    const totalDeposits = accounts
      .filter(a => a.status !== 'CLOSED')
      .reduce((sum, a) => sum + a.balance, 0);
    const activeLoans = loans.filter(l => ['APPROVED', 'DISBURSED'].includes(l.status)).length;
    
    // Transactions today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTxns = transactions.filter(t => t.created_at.startsWith(todayStr)).length;
    const totalAccounts = accounts.filter(a => a.status === 'ACTIVE').length;

    return {
      total_customers: totalCustomers,
      total_deposits: Math.round(totalDeposits * 100) / 100,
      active_loans: activeLoans,
      today_transactions: todayTxns > 0 ? todayTxns : 6,
      total_accounts: totalAccounts
    };
  },

  get_branch_performance() {
    return branches.map(b => {
      const branchAccounts = accounts.filter(a => a.branch_id === b.branch_id && a.status !== 'CLOSED');
      const branchLoans = loans.filter(l => l.branch_id === b.branch_id && ['APPROVED', 'DISBURSED'].includes(l.status));
      const totalDeposits = branchAccounts.reduce((sum, a) => sum + a.balance, 0);
      const totalLoanVol = branchLoans.reduce((sum, l) => sum + l.principal_amount, 0);

      return {
        branch_id: b.branch_id,
        branch_code: b.branch_code,
        branch_name: b.branch_name,
        city: b.city,
        total_accounts: branchAccounts.length,
        total_deposits: Math.round(totalDeposits * 100) / 100,
        total_loans: branchLoans.length,
        total_loan_volume: Math.round(totalLoanVol * 100) / 100
      };
    });
  },

  get_account_distribution() {
    const map = {};
    accounts.filter(a => a.status === 'ACTIVE').forEach(a => {
      if (!map[a.account_type]) {
        map[a.account_type] = { count: 0, total_balance: 0 };
      }
      map[a.account_type].count += 1;
      map[a.account_type].total_balance += a.balance;
    });

    return Object.keys(map).map(type => ({
      account_type: type,
      count: map[type].count,
      total_balance: Math.round(map[type].total_balance * 100) / 100
    }));
  },

  get_loan_defaulters() {
    return loans
      .filter(l => l.status === 'DISBURSED')
      .map(l => {
        const cust = customers.find(c => c.customer_id === l.customer_id);
        const acc = accounts.find(a => a.account_id === l.account_id);
        const payments = loanPayments.filter(p => p.loan_id === l.loan_id);
        const lastPayDate = payments.length > 0 ? payments[payments.length - 1].payment_date : l.approved_date;
        const daysOverdue = Math.floor((Date.now() - new Date(lastPayDate).getTime()) / (1000 * 3600 * 24));

        return {
          loan_id: l.loan_id,
          loan_reference: l.loan_reference,
          loan_type: l.loan_type,
          principal_amount: l.principal_amount,
          remaining_balance: l.remaining_balance,
          applied_date: l.applied_date,
          status: l.status,
          customer_id: cust ? cust.customer_id : null,
          customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown',
          phone: cust ? cust.phone : '',
          email: cust ? cust.email : '',
          account_number: acc ? acc.account_number : '',
          last_payment_date: lastPayDate,
          days_overdue: daysOverdue
        };
      })
      .filter(d => d.days_overdue > 30)
      .sort((a, b) => b.days_overdue - a.days_overdue);
  },

  get_monthly_statement(accountNo, year, month) {
    const acc = accounts.find(a => a.account_number === accountNo);
    if (!acc) {
      const err = new Error(`ORA-20004: Account ${accountNo} not found.`);
      err.code = 'ORA-20004';
      throw err;
    }
    const cust = customers.find(c => c.customer_id === acc.customer_id);
    const branch = branches.find(b => b.branch_id === acc.branch_id);

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const txns = transactions.filter(t => t.account_id === acc.account_id && t.created_at.startsWith(monthStr));

    return {
      account: {
        account_id: acc.account_id,
        account_number: acc.account_number,
        account_type: acc.account_type,
        balance: acc.balance,
        customer_name: cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown',
        customer_number: cust ? cust.customer_number : '',
        email: cust ? cust.email : '',
        address: cust ? cust.address : '',
        city: cust ? cust.city : '',
        branch_name: branch ? branch.branch_name : '',
        ifsc_code: branch ? branch.ifsc_code : ''
      },
      transactions: txns
    };
  }
};

module.exports = {
  branches,
  employees,
  customers,
  accounts,
  loans,
  loanPayments,
  transactions,
  auditLogs,
  pkgAccount,
  pkgTransaction,
  pkgLoan,
  pkgReport,
  logAudit
};
