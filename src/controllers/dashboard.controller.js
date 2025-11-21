const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total revenue from all paid orders
    const revenueResult = await Order.aggregate([
      { $match: { payment: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get order counts
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const processingOrders = await Order.countDocuments({
      status: "processing",
    });

    // Get customer count
    const totalCustomers = await User.countDocuments({ role: "user" });

    // Get new customers this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newCustomersThisWeek = await User.countDocuments({
      role: "user",
      createdAt: { $gte: oneWeekAgo },
    });

    // Get product count
    const totalProducts = await Product.countDocuments();

    // Get low stock count
    const inventory = await Inventory.find().populate("product");
    const lowStockCount = inventory.filter((inv) => {
      const available = inv.stock - inv.reserved;
      return available < inv.reorderPoint && available > 0;
    }).length;

    res.status(200).json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          change: "+20.1% from last month", // TODO: Calculate actual change
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
        },
        customers: {
          total: totalCustomers,
          newThisWeek: newCustomersThisWeek,
        },
        products: {
          total: totalProducts,
          lowStock: lowStockCount,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Private/Admin
exports.getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const orders = await Order.find()
      .sort("-createdAt")
      .limit(limit)
      .populate("user", "name email");

    const formattedOrders = orders.map((order) => ({
      id: `#${order._id.toString().slice(-4).toUpperCase()}`,
      customer: order.user.name,
      date: order.createdAt.toISOString().split("T")[0],
      total: `$${order.totalPrice.toFixed(2)}`,
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
