const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const user = await User.findById(req.user.id);
    const balanceKey = leaveType === 'sick' ? 'sickLeave' : leaveType === 'casual' ? 'casualLeave' : 'vacation';
    
    if (user.leaveBalance[balanceKey] < totalDays) {
      return res.status(400).json({ message: 'Insufficient leave balance' });
    }

    const leaveRequest = await LeaveRequest.create({
      userId: req.user.id,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason
    });

    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const request = await LeaveRequest.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeaveBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.leaveBalance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ status: 'pending' }).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { managerComment } = req.body;
    const request = await LeaveRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'approved';
    request.managerComment = managerComment || '';
    await request.save();

    const user = await User.findById(request.userId);
    const balanceKey = request.leaveType === 'sick' ? 'sickLeave' : request.leaveType === 'casual' ? 'casualLeave' : 'vacation';
    user.leaveBalance[balanceKey] -= request.totalDays;
    await user.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { managerComment } = req.body;
    const request = await LeaveRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'rejected';
    request.managerComment = managerComment || '';
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};