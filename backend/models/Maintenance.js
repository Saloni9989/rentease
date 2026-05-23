const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    issueType: {
      type: String,
      enum: ['repair', 'replacement', 'cleaning', 'installation', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    scheduledDate: Date,
    resolvedDate: Date,
    technicianNotes: String,
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
