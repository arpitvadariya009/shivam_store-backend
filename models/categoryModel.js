const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const categorySchema = new mongoose.Schema({
    name: String,
    image: String,
    colorCode : String,
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('category', categorySchema);
