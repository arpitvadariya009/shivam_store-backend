// models/Product.js
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                // Only allow alphanumeric characters (letters and numbers)
                return /^[a-zA-Z0-9]+$/.test(v);
            },
            message: props => `${props.value} is not a valid variant name! Only letters and numbers are allowed.`
        }
    },
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
    type: { type: Number, default: 1 },
    variants: [variantSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
