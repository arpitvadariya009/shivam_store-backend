// models/Product.js
const mongoose = require('mongoose');

const variantNames = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

const variantSchema = new mongoose.Schema({
    name: { type: String, enum: variantNames, required: true },
    setSize: { type: Number, default: 1, required: true },
    available: { type: Boolean, default: true }
});

const productSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    media: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    type: { type: Number, enum: [1, 2, 3, 4, 5, 6], default: 1 },
    variants: [variantSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
