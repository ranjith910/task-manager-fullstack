const Activity = require("../models/Activity");

// @desc    Latest task activity for the dashboard
// @route   GET /api/activity
// @access  Private
const getActivity = async (req, res) => {
  const activity = await Activity.find({ user: req.user._id })
    .sort({ createdAt: -1, _id: -1 })
    .limit(req.validated.query.limit);

  res.status(200).json({ success: true, data: activity });
};

module.exports = { getActivity };
