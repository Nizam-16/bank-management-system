const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Financial Mutations (Calling PKG_TRANSACTION procedures)
router.post('/deposit', requireRole('ADMIN', 'TELLER', 'MANAGER'), transactionController.deposit);
router.post('/withdraw', requireRole('ADMIN', 'TELLER', 'MANAGER', 'CUSTOMER'), transactionController.withdraw);
router.post('/transfer', requireRole('ADMIN', 'TELLER', 'MANAGER', 'CUSTOMER'), transactionController.transfer);

// History and audit queries
router.get('/history', transactionController.getHistory);

module.exports = router;
