const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please add a code'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please add promotion type'],
    enum: ['percentage', 'fixed_amount', 'free_shipping']
  },
  value: {
    type: Number,
    required: [true, 'Please add promotion value']
  },
  active: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please add start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add end date']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Promotion', PromotionSchema);