const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      products,
      shippingAddress,
      paymentMethod,
      user,
      totalPrice: providedTotal,
      payment,
      status,
      notes,
      customerEmail,
      customerName,
      customerPhone,
    } = req.body;

    // Support both 'orderItems' and 'products' field names
    const items = orderItems || products;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No order items",
      });
    }

    let customerId = user;

    // If no user ID provided but we have customer info, create or find customer
    if (!customerId && (customerEmail || req.user)) {
      const email = customerEmail || req.user.email;
      const name = customerName || req.user.name;
      const phone = customerPhone || req.user.phone;

      // Check if customer exists
      let customer = await User.findOne({ email });

      if (!customer) {
        // Create new customer
        customer = await User.create({
          name: name || "Guest Customer",
          email,
          phone: phone || "",
          password: Math.random().toString(36).slice(-8), // Random password
          role: "user",
          address: shippingAddress?.address || "",
          city: shippingAddress?.city || "",
          state: shippingAddress?.state || "",
          postalCode: shippingAddress?.postalCode || "",
          country: shippingAddress?.country || "",
          status: "active",
        });
      }

      customerId = customer._id;
    }

    // If still no customer ID, use authenticated user
    if (!customerId && req.user) {
      customerId = req.user._id;
    }

    // Calculate prices and check stock
    let totalPrice = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product: ${product.name}`,
        });
      }

      // Decrement stock
      product.stock -= item.quantity;
      await product.save();

      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price || product.price,
      });

      totalPrice += (item.price || product.price) * item.quantity;
    }

    const order = new Order({
      user: customerId,
      products: processedItems,
      shippingAddress,
      paymentMethod,
      totalPrice: providedTotal || totalPrice,
      payment: payment || "pending",
      status: status || "pending",
    });

    const createdOrder = await order.save();

    res.status(201).json({
      success: true,
      data: createdOrder,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("products.product", "name price sku images");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Make sure user is order owner or admin
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "id name");
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    order.status = status;

    if (status === "delivered") {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Make sure user is order owner or admin
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        error: "Not authorized to update this order",
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    order.status = "delivered";
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
