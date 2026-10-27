const { customers, accounts, branches, logAudit } = require('../services/mockPlsqlEngine');

const customerController = {
  async list(req, res, next) {
    try {
      const { search, kycStatus, status } = req.query;

      let list = customers.map(c => {
        const branch = branches.find(b => b.branch_id === c.branch_id);
        const custAccounts = accounts.filter(a => a.customer_id === c.customer_id && a.status !== 'CLOSED');
        const totalBalance = custAccounts.reduce((sum, a) => sum + a.balance, 0);

        return {
          customer_id: c.customer_id,
          branch_id: c.branch_id,
          branch_name: branch ? branch.branch_name : 'Main Branch',
          customer_number: c.customer_number,
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          phone: c.phone,
          national_id: c.national_id,
          date_of_birth: c.date_of_birth,
          address: c.address,
          city: c.city,
          state: c.state,
          occupation: c.occupation,
          annual_income: c.annual_income,
          kyc_status: c.kyc_status,
          status: c.status,
          accounts_count: custAccounts.length,
          total_balance: Math.round(totalBalance * 100) / 100
        };
      });

      if (search) {
        const s = search.toLowerCase();
        list = list.filter(c =>
          c.first_name.toLowerCase().includes(s) ||
          c.last_name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.customer_number.toLowerCase().includes(s) ||
          c.phone.includes(s)
        );
      }

      if (kycStatus) {
        list = list.filter(c => c.kyc_status === kycStatus);
      }

      if (status) {
        list = list.filter(c => c.status === status);
      }

      res.json({
        success: true,
        count: list.length,
        data: list
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const c = customers.find(cust => cust.customer_id === Number(id));

      if (!c) {
        return res.status(404).json({ success: false, error: `Customer with ID ${id} not found.` });
      }

      const branch = branches.find(b => b.branch_id === c.branch_id);
      const custAccounts = accounts.filter(a => a.customer_id === c.customer_id);

      res.json({
        success: true,
        data: {
          ...c,
          password_hash: undefined,
          branch_name: branch ? branch.branch_name : '',
          accounts: custAccounts
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { firstName, lastName, email, phone, nationalId, dateOfBirth, address, city, state, postalCode, occupation, annualIncome, branchId } = req.body;

      if (!firstName || !lastName || !email || !nationalId) {
        return res.status(400).json({ success: false, error: 'First name, last name, email, and national ID are required.' });
      }

      // Check unique constraints
      if (customers.some(c => c.email.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({ success: false, error: 'Customer with this email already exists.' });
      }

      const newId = 2000 + customers.length + 1;
      const newCust = {
        customer_id: newId,
        branch_id: Number(branchId) || 1,
        customer_number: `CUST-${String(newId).padStart(6, '0')}`,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || '',
        national_id: nationalId,
        date_of_birth: dateOfBirth || '1990-01-01',
        address: address || '',
        city: city || '',
        state: state || '',
        postal_code: postalCode || '',
        occupation: occupation || '',
        annual_income: Number(annualIncome) || 0,
        kyc_status: 'VERIFIED',
        status: 'ACTIVE'
      };

      customers.unshift(newCust);
      logAudit('CUSTOMERS', 'INSERT', newCust.customer_number, `New customer registered: ${firstName} ${lastName}`);

      res.status(201).json({
        success: true,
        data: newCust
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const c = customers.find(cust => cust.customer_id === Number(id));

      if (!c) {
        return res.status(404).json({ success: false, error: 'Customer not found.' });
      }

      const { firstName, lastName, phone, address, city, state, occupation, annualIncome, kycStatus, status } = req.body;

      if (firstName) c.first_name = firstName;
      if (lastName) c.last_name = lastName;
      if (phone) c.phone = phone;
      if (address) c.address = address;
      if (city) c.city = city;
      if (state) c.state = state;
      if (occupation) c.occupation = occupation;
      if (annualIncome !== undefined) c.annual_income = Number(annualIncome);
      if (kycStatus) c.kyc_status = kycStatus;
      if (status) c.status = status;

      logAudit('CUSTOMERS', 'UPDATE', c.customer_number, `Customer profile updated for ${c.first_name} ${c.last_name}`);

      res.json({
        success: true,
        data: c
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = customerController;
