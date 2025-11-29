const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

exports.getEmployeeStats = async (req, res) => {
  try {
    const totalRequests = await LeaveRequest.countDocuments({ userId: req.user.id });
    const pendingRequests = await LeaveRequest.countDocuments({ userId: req.user.id, status: 'pending' });
    const approvedRequests = await LeaveRequest.countDocuments({ userId: req.user.id, status: 'approved' });
    const rejectedRequests = await LeaveRequest.countDocuments({ userId: req.user.id, status: 'rejected' });

    const user = await User.findById(req.user.id);

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      leaveBalance: user.leaveBalance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getManagerStats = async (req, res) => {
  try {
    const totalRequests = await LeaveRequest.countDocuments();
    const pendingRequests = await LeaveRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await LeaveRequest.countDocuments({ status: 'approved' });
    const rejectedRequests = await LeaveRequest.countDocuments({ status: 'rejected' });
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalEmployees
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};