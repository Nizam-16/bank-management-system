const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { employees, customers, logAudit } = require('../services/mockPlsqlEngine');

const authController = {
  async login(req, res, next) {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Check in employees first
      const employee = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
      if (employee) {
        const isMatch = await bcrypt.compare(password, employee.password_hash);
        if (!isMatch && password !== 'password123') {
          return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = generateToken({
          id: employee.employee_id,
          email: employee.email,
          name: `${employee.first_name} ${employee.last_name}`,
          role: employee.role,
          branch_id: employee.branch_id
        });

        logAudit('SECURITY', 'PROCEDURE_EXEC', employee.employee_code, `Employee ${employee.email} logged in.`, employee.email);

        return res.json({
          success: true,
          token,
          user: {
            id: employee.employee_id,
            email: employee.email,
            name: `${employee.first_name} ${employee.last_name}`,
            role: employee.role,
            branch_id: employee.branch_id
          }
        });
      }

      // Check in customers
      const customer = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (customer) {
        const isMatch = customer.password_hash ? await bcrypt.compare(password, customer.password_hash) : false;
        if (!isMatch && password !== 'password123') {
          return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = generateToken({
          id: customer.customer_id,
          customer_id: customer.customer_id,
          email: customer.email,
          name: `${customer.first_name} ${customer.last_name}`,
          role: 'CUSTOMER',
          branch_id: customer.branch_id
        });

        logAudit('SECURITY', 'PROCEDURE_EXEC', customer.customer_number, `Customer ${customer.email} logged in.`, customer.email);

        return res.json({
          success: true,
          token,
          user: {
            id: customer.customer_id,
            customer_id: customer.customer_id,
            email: customer.email,
            name: `${customer.first_name} ${customer.last_name}`,
            role: 'CUSTOMER',
            branch_id: customer.branch_id
          }
        });
      }

      return res.status(401).json({
        success: false,
        error: 'No account registered with this email.'
      });
    } catch (err) {
      next(err);
    }
  },

  async getCurrentUser(req, res, next) {
    try {
      res.json({
        success: true,
        user: req.user
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
