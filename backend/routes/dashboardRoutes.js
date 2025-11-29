const express = require('express');
const { getEmployeeStats, getManagerStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/employee', protect, authorize('employee'), getEmployeeStats);
router.get('/manager', protect, authorize('manager'), getManagerStats);

module.exports = router;