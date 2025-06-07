const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    productCode: { type: String, required: true },
    variantName: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F'], required: true },
    quantity: { type: Number, default: 0 }
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // format: YYYY-MM-DD
    items: [itemSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
