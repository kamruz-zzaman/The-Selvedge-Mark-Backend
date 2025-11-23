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

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private/Admin
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, city, state, postalCode, country } =
      req.body;

    // Check if customer already exists
    const existingCustomer = await User.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: "Customer with this email already exists",
      });
    }

    // Create customer (user with role 'user')
    const customer = await User.create({
      name,
      email,
      password: Math.random().toString(36).slice(-8), // Random password
      role: "user",
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      status: "active",
    });

    res.status(201).json({
      success: true,
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Get customer stats
// @route   GET /api/customers/stats
// @access  Private/Admin
exports.getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "user" });
    const newCustomersThisMonth = await User.countDocuments({
      role: "user",
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    // Get customers with orders
    const customersWithOrders = await Order.distinct("user");

    res.status(200).json({
      success: true,
      data: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
        withOrders: customersWithOrders.length,
        withoutOrders: totalCustomers - customersWithOrders.length,
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

    // Get customer orders
    const orders = await Order.find({ user: customer._id });
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.status(200).json({
      success: true,
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        postalCode: customer.postalCode,
        country: customer.country,
        status: customer.status,
        orders: orders.length,
        totalSpent: totalSpent,
        dateJoined: customer.createdAt,
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
    const customer = await User.findById(req.params.id);

    if (!customer || customer.role !== "user") {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      status,
    } = req.body;

    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    customer.city = city || customer.city;
    customer.state = state || customer.state;
    customer.postalCode = postalCode || customer.postalCode;
    customer.country = country || customer.country;
    customer.status = status || customer.status;

    const updatedCustomer = await customer.save();

    res.status(200).json({
      success: true,
      data: updatedCustomer,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
