const Category = require('../models/categoryModel');

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const newCategory = new Category({ name, image: req.file && req.file.filename });
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
        const { name, img, status } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, img, status },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, category: updatedCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};
