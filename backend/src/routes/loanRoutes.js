const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Public calculations
router.post('/calculate-emi', loanController.calculateEmi);

// Loan Lifecycle
router.get('/', loanController.list);
router.get('/:loanId/schedule', loanController.getSchedule);
router.post('/apply', requireRole('ADMIN', 'TELLER', 'LOAN_OFFICER', 'MANAGER', 'CUSTOMER'), loanController.apply);
router.put('/:loanId/approve', requireRole('ADMIN', 'LOAN_OFFICER', 'MANAGER'), loanController.approve);
router.post('/:loanId/pay-emi', requireRole('ADMIN', 'TELLER', 'CUSTOMER'), loanController.payEmi);

module.exports = router;
