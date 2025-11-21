const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, "Reserved stock cannot be negative"],
    },
    reorderPoint: {
      type: Number,
      default: 10,
      min: [0, "Reorder point cannot be negative"],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for available stock
InventorySchema.virtual("available").get(function () {
  return Math.max(0, this.stock - this.reserved);
});

// Virtual for status
InventorySchema.virtual("status").get(function () {
  const available = this.available;
  if (available === 0) {
    return "out-of-stock";
  } else if (available < this.reorderPoint) {
    return "low-stock";
  }
  return "in-stock";
});

// Update timestamp on save
InventorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Inventory", InventorySchema);
