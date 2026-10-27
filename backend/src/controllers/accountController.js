const { accountService } = require('../services/oracleService');

const accountController = {
  async openAccount(req, res, next) {
    try {
      const { customerId, accountType, initialDeposit, branchId, currency } = req.body;
      const effectiveBranchId = branchId || req.user.branch_id || 1;

      const result = await accountService.openAccount({
        customerId,
        accountType,
        initialDeposit: initialDeposit || 0,
        branchId: effectiveBranchId,
        currency: currency || 'USD'
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async freezeAccount(req, res, next) {
    try {
      const { accountNumber } = req.params;
      const { reason } = req.body;

      const result = await accountService.freezeAccount(accountNumber, reason);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async activateAccount(req, res, next) {
    try {
      const { accountNumber } = req.params;
      const result = await accountService.activateAccount(accountNumber);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async closeAccount(req, res, next) {
    try {
      const { accountNumber } = req.params;
      const { reason } = req.body;
      const result = await accountService.closeAccount(accountNumber, reason);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getAccountDetails(req, res, next) {
    try {
      const { accountNumber } = req.params;
      const result = await accountService.getAccountDetails(accountNumber);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async listCustomerAccounts(req, res, next) {
    try {
      const customerId = req.params.customerId || req.user.customer_id;
      const result = await accountService.listCustomerAccounts(customerId);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async listAllAccounts(req, res, next) {
    try {
      const { status } = req.query;
      const result = await accountService.listAllAccounts(status);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = accountController;
