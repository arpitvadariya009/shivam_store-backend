const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const favoriteSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

}, {
    timestamps: true
});

module.exports = mongoose.model('favorite', favoriteSchema);
