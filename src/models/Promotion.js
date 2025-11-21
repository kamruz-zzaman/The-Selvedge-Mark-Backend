const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Promotion code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping"],
      required: [true, "Promotion type is required"],
    },
    value: {
      type: Number,
      required: [true, "Promotion value is required"],
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["active", "scheduled", "expired", "disabled"],
      default: function () {
        const now = new Date();
        if (this.startDate > now) return "scheduled";
        if (this.endDate < now) return "expired";
        return "active";
      },
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if promotion is valid
PromotionSchema.virtual("isValid").get(function () {
  const now = new Date();
  return (
    this.status === "active" &&
    this.startDate <= now &&
    this.endDate >= now &&
    (this.usageLimit === null || this.usageCount < this.usageLimit)
  );
});

// Virtual for usage display
PromotionSchema.virtual("usage").get(function () {
  if (this.usageLimit === null) {
    return `${this.usageCount}/∞`;
  }
  return `${this.usageCount}/${this.usageLimit}`;
});

// Method to check if promotion can be applied
PromotionSchema.methods.canApplyToOrder = function (orderTotal) {
  return this.isValid && orderTotal >= this.minOrderValue;
};

// Method to calculate discount
PromotionSchema.methods.calculateDiscount = function (orderTotal) {
  if (!this.canApplyToOrder(orderTotal)) {
    return 0;
  }

  switch (this.type) {
    case "percentage":
      return (orderTotal * this.value) / 100;
    case "fixed":
      return Math.min(this.value, orderTotal);
    case "free_shipping":
      return 0; // Shipping discount handled separately
    default:
      return 0;
  }
};

// Update status before saving
PromotionSchema.pre("save", function (next) {
  const now = new Date();
  if (this.status !== "disabled") {
    if (this.startDate > now) {
      this.status = "scheduled";
    } else if (this.endDate < now) {
      this.status = "expired";
    } else if (this.status === "scheduled") {
      this.status = "active";
    }
  }
  next();
});

// Ensure virtuals are included in JSON
PromotionSchema.set("toJSON", { virtuals: true });
PromotionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Promotion", PromotionSchema);
