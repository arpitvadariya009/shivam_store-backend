const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firmName: String,
    city: String,
    mobile: String,
    pin: String,
    isverified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash the pin before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('pin')) return next();
    this.pin = await bcrypt.hash(this.pin, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);
