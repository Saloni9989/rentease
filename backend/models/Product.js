const mongoose = require('mongoose');

const tenureOptionSchema = new mongoose.Schema({
  months: { type: Number, required: true },
  monthlyRent: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // percentage discount
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Furniture', 'Appliances'],
    },
    subCategory: {
      type: String,
      required: [true, 'Sub-category is required'],
      // Furniture: Bed, Sofa, Table, Chair, Wardrobe, Desk
      // Appliances: Refrigerator, Washing Machine, TV, AC, Microwave, Geyser
    },
    brand: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String, // URL or path
      },
    ],
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: 0,
    },
    tenureOptions: [tenureOptionSchema],
    availableQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    features: [String],
    specifications: {
      type: Map,
      of: String,
    },
    serviceAreas: [String], // cities where available
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Virtual for base monthly rent (shortest tenure)
productSchema.virtual('baseMonthlyRent').get(function () {
  if (!this.tenureOptions || this.tenureOptions.length === 0) return 0;
  return Math.min(...this.tenureOptions.map((t) => t.monthlyRent));
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
