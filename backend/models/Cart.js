const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  tenureMonths: {
    type: Number,
    required: true,
  },
  monthlyRent: {
    type: Number,
    required: true,
  },
  securityDeposit: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Virtual for cart totals
cartSchema.virtual('totalMonthlyRent').get(function () {
  return this.items.reduce((sum, item) => sum + item.monthlyRent * item.quantity, 0);
});

cartSchema.virtual('totalSecurityDeposit').get(function () {
  return this.items.reduce((sum, item) => sum + item.securityDeposit * item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
