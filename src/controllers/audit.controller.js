const AuditLog = require("../models/AuditLog");

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private/Admin
exports.getAuditLogs = async (req, res) => {
  try {
    const { type, user, search } = req.query;

    let query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (user) {
      query.user = user;
    }

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { resource: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }

    const logs = await AuditLog.find(query)
      .populate("user", "name email")
      .sort("-createdAt")
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create audit log
// @route   POST /api/audit
// @access  Private
exports.createAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.create({
      ...req.body,
      user: req.user.id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Helper function to log actions (can be used in other controllers)
exports.logAction = async (
  userId,
  action,
  resource,
  resourceId,
  details,
  type,
  ipAddress
) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      resource,
      resourceId,
      details,
      type,
      ipAddress,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};
