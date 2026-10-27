const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Read routes
router.get('/', accountController.listAllAccounts);
router.get('/customer/:customerId?', accountController.listCustomerAccounts);
router.get('/:accountNumber', accountController.getAccountDetails);

// Mutations
router.post('/open', requireRole('ADMIN', 'TELLER', 'MANAGER'), accountController.openAccount);
router.put('/:accountNumber/freeze', requireRole('ADMIN', 'MANAGER'), accountController.freezeAccount);
router.put('/:accountNumber/activate', requireRole('ADMIN', 'MANAGER'), accountController.activateAccount);
router.put('/:accountNumber/close', requireRole('ADMIN', 'MANAGER'), accountController.closeAccount);

module.exports = router;
