const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
    productCode: { type: String, required: true },
    variantName: { type: String,  required: true },
    quantity: { type: Number, default: 0 }
});

const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    items: [itemSchema],
    totalQuantity: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', CartSchema);
