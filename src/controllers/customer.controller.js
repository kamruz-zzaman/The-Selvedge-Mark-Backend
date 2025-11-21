const User = require("../models/User");
const Order = require("../models/Order");

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin
exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "user" });

    // Get analytics for each customer
    const customersWithAnalytics = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ user: customer._id });
        const totalSpent = orders.reduce(
          (sum, order) => sum + order.totalPrice,
          0
        );

        return {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone || "",
          orders: orders.length,
          totalSpent: totalSpent,
          dateJoined: customer.createdAt.toISOString().split("T")[0],
          status: customer.status,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: customersWithAnalytics.length,
      data: customersWithAnalytics,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get customer stats
// @route   GET /api/customers/stats
// @access  Private/Admin
exports.getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "user" });

    // New customers this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = await User.countDocuments({
      role: "user",
      createdAt: { $gte: oneWeekAgo },
    });

    // Calculate average lifetime value
    const orders = await Order.find({ payment: "paid" });
    const avgLifetimeValue =
      orders.length > 0
        ? orders.reduce((sum, order) => sum + order.totalPrice, 0) /
          totalCustomers
        : 0;

    // Calculate repeat rate
    const customersWithOrders = await Order.distinct("user");
    const customersWithMultipleOrders = await Order.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);
    const repeatRate =
      customersWithOrders.length > 0
        ? (customersWithMultipleOrders.length / customersWithOrders.length) *
          100
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        newThisWeek,
        avgLifetimeValue: avgLifetimeValue.toFixed(2),
        repeatRate: `${repeatRate.toFixed(0)}%`,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private/Admin
exports.getCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);

    if (!customer || customer.role !== "user") {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    const orders = await Order.find({ user: customer._id });
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.status(200).json({
      success: true,
      data: {
        ...customer.toObject(),
        orders: orders.length,
        totalSpent,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private/Admin
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer || customer.role !== "user") {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};
