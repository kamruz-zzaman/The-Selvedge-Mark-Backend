const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
    },
    details: {
      type: String,
    },
    type: {
      type: String,
      enum: ["create", "update", "delete", "auth"],
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ type: 1 });
AuditLogSchema.index({ resource: 1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
