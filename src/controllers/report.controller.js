const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private/Admin
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, period = "6months" } = req.query;

    // Calculate date range
    let start, end;
    end = new Date();

    switch (period) {
      case "7days":
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3months":
        start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "6months":
        start = new Date(end.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case "1year":
        start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = startDate
          ? new Date(startDate)
          : new Date(end.getTime() - 180 * 24 * 60 * 60 * 1000);
        end = endDate ? new Date(endDate) : end;
    }

    // Get orders in date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $ne: "cancelled" },
    });

    // Calculate metrics
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by month
    const salesByMonth = {};
    orders.forEach((order) => {
      const month = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!salesByMonth[month]) {
        salesByMonth[month] = { revenue: 0, orders: 0 };
      }
      salesByMonth[month].revenue += order.totalPrice;
      salesByMonth[month].orders += 1;
    });

    const salesData = Object.keys(salesByMonth)
      .sort()
      .map((month) => ({
        month: new Date(month).toLocaleDateString("en-US", { month: "short" }),
        revenue: salesByMonth[month].revenue,
        orders: salesByMonth[month].orders,
      }));

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        salesData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get top products
// @route   GET /api/reports/products/top
// @access  Private/Admin
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          sales: { $sum: "$products.quantity" },
          revenue: {
            $sum: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          name: "$productInfo.name",
          sales: 1,
          revenue: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get top customers
// @route   GET /api/reports/customers/top
// @access  Private/Admin
exports.getTopCustomers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const topCustomers = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$user",
          orders: { $sum: 1 },
          spent: { $sum: "$totalPrice" },
        },
      },
      { $sort: { spent: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          name: "$userInfo.name",
          orders: 1,
          spent: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: topCustomers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
