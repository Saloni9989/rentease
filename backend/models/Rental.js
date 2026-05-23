const mongoose = require('mongoose');

const rentalItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: String, // snapshot at time of order
  monthlyRent: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  tenureMonths: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const rentalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [rentalItemSchema],
    status: {
      type: String,
      enum: [
        'pending',       // order placed, awaiting confirmation
        'confirmed',     // confirmed by admin
        'delivered',     // items delivered to user
        'active',        // rental in progress
        'return_requested', // user requested return
        'returned',      // items returned
        'cancelled',     // order cancelled
        'extended',      // tenure extended
      ],
      default: 'pending',
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    actualReturnDate: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    totalMonthlyRent: {
      type: Number,
      required: true,
    },
    totalSecurityDeposit: {
      type: Number,
      required: true,
    },
    tenureMonths: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number, // total rent for full tenure
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'partial'],
      default: 'pending',
    },
    notes: String,
    adminNotes: String,
    damageReport: String,
    damageCharges: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rental', rentalSchema);
