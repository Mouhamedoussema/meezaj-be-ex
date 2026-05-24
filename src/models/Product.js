const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    story: { type: String },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'TND' },
    availableSizes: [String],
    imageUrls: [String],
    material: { type: String },
    weight: { type: String },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
