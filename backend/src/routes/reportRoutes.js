const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/dashboard', reportController.getDashboard);
router.get('/statements/:accountNumber', reportController.getMonthlyStatement);
router.get('/branches', reportController.getBranchPerformance);
router.get('/defaulters', reportController.getLoanDefaulters);
router.get('/distribution', reportController.getAccountDistribution);

module.exports = router;
