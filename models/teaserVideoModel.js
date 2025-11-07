const mongoose = require('mongoose');

const teaserVideoSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure only one active teaser video at a time
teaserVideoSchema.pre('save', async function(next) {
    if (this.isActive) {
        // Deactivate all other videos when setting this one as active
        await mongoose.model('TeaserVideo').updateMany(
            { _id: { $ne: this._id } },
            { isActive: false }
        );
    }
    next();
});

module.exports = mongoose.model('TeaserVideo', teaserVideoSchema);