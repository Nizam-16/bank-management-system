const { transactionService } = require('../services/oracleService');

const transactionController = {
  async deposit(req, res, next) {
    try {
      const { accountNumber, amount, channel, description } = req.body;
      const user = req.user ? req.user.email : 'SYSTEM';

      const result = await transactionService.deposit({
        accountNo: accountNumber,
        amount,
        channel: channel || 'BRANCH',
        description: description || 'Cash Deposit',
        user
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async withdraw(req, res, next) {
    try {
      const { accountNumber, amount, channel, description } = req.body;
      const user = req.user ? req.user.email : 'SYSTEM';

      const result = await transactionService.withdraw({
        accountNo: accountNumber,
        amount,
        channel: channel || 'ATM',
        description: description || 'Cash Withdrawal',
        user
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async transfer(req, res, next) {
    try {
      const { sourceAccount, destinationAccount, amount, description, channel } = req.body;
      const user = req.user ? req.user.email : 'SYSTEM';

      const result = await transactionService.transferFunds({
        sourceAcc: sourceAccount,
        destAcc: destinationAccount,
        amount,
        description: description || 'Fund Transfer',
        channel: channel || 'ONLINE',
        user
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req, res, next) {
    try {
      const { accountNumber, type, channel, startDate, endDate, limit } = req.query;

      const result = await transactionService.getTransactionHistory({
        accountNo: accountNumber,
        type,
        channel,
        startDate,
        endDate,
        limit: limit ? Number(limit) : 50
      });

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

module.exports = transactionController;
