const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categpry', // Reference to Category
        required: true
    },
    image: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    },
    type: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SubCategory', subCategorySchema);
