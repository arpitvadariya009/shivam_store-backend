const Category = require('../models/categoryModel');
const { getUploadsUrl } = require('../config/baseUrl');

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, colorCode } = req.body;

        const newCategory = new Category({ colorCode, name, image: req.file && req.file.filename });
        const savedCategory = await newCategory.save();

        res.status(201).json({ success: true, category: savedCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};

// Get single category
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};


// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { name, status, colorCode } = req.body;

        // Prepare update data
        const updateData = { name, status,colorCode };

        // If a file is uploaded, include it in the update
        if (req.file) {
            updateData.image = req.file.filename;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({
            success: true,
            category: updatedCategory,
            message: 'Category updated successfully',
            thumbnailUrl: req.file ? getUploadsUrl(req.file.filename) : (updatedCategory.image ? getUploadsUrl(updatedCategory.image) : null)
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.query.id);

        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};