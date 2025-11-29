const express = require('express');
const {
  applyLeave,
  getMyRequests,
  cancelRequest,
  getLeaveBalance,
  getAllRequests,
  getPendingRequests,
  approveRequest,
  rejectRequest
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, authorize('employee'), applyLeave);
router.get('/my-requests', protect, authorize('employee'), getMyRequests);
router.delete('/:id', protect, authorize('employee'), cancelRequest);
router.get('/balance', protect, authorize('employee'), getLeaveBalance);

router.get('/all', protect, authorize('manager'), getAllRequests);
router.get('/pending', protect, authorize('manager'), getPendingRequests);
router.put('/:id/approve', protect, authorize('manager'), approveRequest);
router.put('/:id/reject', protect, authorize('manager'), rejectRequest);

module.exports = router;