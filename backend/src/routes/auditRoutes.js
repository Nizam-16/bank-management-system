const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(requireRole('ADMIN', 'MANAGER'));

router.get('/', auditController.list);

module.exports = router;
