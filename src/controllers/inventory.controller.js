const Inventory = require("../models/Inventory");
const Product = require("../models/Product");

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate("product", "name sku");

    const formattedInventory = inventory.map((inv) => ({
      _id: inv._id,
      product: inv.product.name,
      sku: inv.product.sku,
      stock: inv.stock,
      reserved: inv.reserved,
      available: inv.available,
      reorderPoint: inv.reorderPoint,
      status: inv.status,
    }));

    res.status(200).json({
      success: true,
      count: formattedInventory.length,
      data: formattedInventory,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get inventory stats
// @route   GET /api/inventory/stats
// @access  Private/Admin
exports.getInventoryStats = async (req, res) => {
  try {
    const inventory = await Inventory.find();

    const stats = {
      totalProducts: inventory.length,
      lowStock: inventory.filter((inv) => inv.status === "low-stock").length,
      outOfStock: inventory.filter((inv) => inv.status === "out-of-stock")
        .length,
      totalValue: 0, // TODO: Calculate based on product prices
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update inventory
// @route   PUT /api/inventory/:id
// @access  Private/Admin
exports.updateInventory = async (req, res) => {
  try {
    const { stock, reserved, reorderPoint } = req.body;

    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { stock, reserved, reorderPoint },
      { new: true, runValidators: true }
    ).populate("product", "name sku");

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: "Inventory item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Create inventory for product
// @route   POST /api/inventory
// @access  Private/Admin
exports.createInventory = async (req, res) => {
  try {
    const inventory = await Inventory.create(req.body);

    res.status(201).json({
      success: true,
      data: inventory,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};
