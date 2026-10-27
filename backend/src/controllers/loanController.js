const { loanService } = require('../services/oracleService');

const loanController = {
  async calculateEmi(req, res, next) {
    try {
      const { principal, annualRate, tenureMonths } = req.body;
      const emi = loanService.calculateEmi(principal, annualRate, tenureMonths);
      const totalPayable = Math.round(emi * Number(tenureMonths) * 100) / 100;
      const totalInterest = Math.round((totalPayable - Number(principal)) * 100) / 100;

      res.json({
        success: true,
        data: {
          principal: Number(principal),
          annualRate: Number(annualRate),
          tenureMonths: Number(tenureMonths),
          emi,
          totalInterest,
          totalPayable
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async apply(req, res, next) {
    try {
      const { customerId, accountNumber, loanType, principal, termMonths, interestRate } = req.body;
      const effectiveCustId = customerId || req.user.customer_id;

      const result = await loanService.applyLoan({
        customerId: effectiveCustId,
        accountNo: accountNumber,
        loanType,
        principal,
        termMonths,
        interestRate
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async approve(req, res, next) {
    try {
      const { loanId } = req.params;
      const { action, remarks } = req.body;
      const employeeId = req.user ? req.user.id : 1001;

      const result = await loanService.approveLoan({
        loanId,
        employeeId,
        action,
        remarks
      });

      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async payEmi(req, res, next) {
    try {
      const { loanId } = req.params;
      const { paymentAmount, sourceAccount, paymentMethod } = req.body;
      const user = req.user ? req.user.email : 'SYSTEM';

      const result = await loanService.payEmi({
        loanId,
        paymentAmount,
        sourceAcc: sourceAccount,
        paymentMethod: paymentMethod || 'ONLINE',
        user
      });

      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getSchedule(req, res, next) {
    try {
      const { loanId } = req.params;
      const result = await loanService.getRepaymentSchedule(loanId);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const { status, customerId } = req.query;
      const effectiveCustId = req.user && req.user.role === 'CUSTOMER' ? req.user.customer_id : customerId;

      const result = await loanService.listLoans(status, effectiveCustId);
      res.json({
        success: true,
        count: result.length,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = loanController;
