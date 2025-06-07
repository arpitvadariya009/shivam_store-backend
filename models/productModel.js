// models/Product.js
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    name: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F'], required: true },
    available: { type: Boolean, default: true }
});

const productSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    },
    image: { type: String },
    setSize: { type: Number, required: true },
    variants: [variantSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
