const { reportService } = require('../services/oracleService');

const reportController = {
  async getDashboard(req, res, next) {
    try {
      const metrics = await reportService.getDashboardMetrics();
      const distribution = await reportService.getAccountDistribution();
      res.json({
        success: true,
        data: {
          metrics,
          distribution
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getMonthlyStatement(req, res, next) {
    try {
      const { accountNumber } = req.params;
      const { year, month } = req.query;

      const currentYear = year ? Number(year) : new Date().getFullYear();
      const currentMonth = month ? Number(month) : new Date().getMonth() + 1;

      const result = await reportService.getMonthlyStatement(accountNumber, currentYear, currentMonth);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getBranchPerformance(req, res, next) {
    try {
      const result = await reportService.getBranchPerformance();
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getLoanDefaulters(req, res, next) {
    try {
      const result = await reportService.getLoanDefaulters();
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getAccountDistribution(req, res, next) {
    try {
      const result = await reportService.getAccountDistribution();
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = reportController;
