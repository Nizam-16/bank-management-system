const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', customerController.list);
router.get('/:id', customerController.getById);
router.post('/', requireRole('ADMIN', 'TELLER', 'MANAGER'), customerController.create);
router.put('/:id', requireRole('ADMIN', 'TELLER', 'MANAGER'), customerController.update);

module.exports = router;
