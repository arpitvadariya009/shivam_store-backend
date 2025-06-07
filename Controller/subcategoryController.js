const SubCategory = require('../models/subcategoryModel');

// Create SubCategory
exports.createSubCategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        const subCategory = new SubCategory({ name, categoryId, image: req.file && req.file.filename });
        const saved = await subCategory.save();

        res.status(201).json({ success: true, subCategory: saved });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};

// Get All SubCategories
exports.getAllSubCategories = async (req, res) => {
    try {
        const { categoryId } = req.query;
        let query = {}

        if (categoryId) {
            query.categoryId = categoryId
        }
        const subCategories = await SubCategory.find(query).populate('categoryId', 'name');
        res.status(200).json({ success: true, subCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};

// Get Single SubCategory
exports.getSubCategoryById = async (req, res) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id).populate('categoryId', 'name');
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'SubCategory not found' });
        }
        res.status(200).json({ success: true, subCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};

// Update SubCategory
exports.updateSubCategory = async (req, res) => {
    try {
        const { name, categoryId, img, status } = req.body;

        const updated = await SubCategory.findByIdAndUpdate(
            req.params.id,
            { name, categoryId, img, status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'SubCategory not found' });
        }

        res.status(200).json({ success: true, subCategory: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};

// Delete SubCategory
exports.deleteSubCategory = async (req, res) => {
    try {
        const deleted = await SubCategory.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'SubCategory not found' });
        }

        res.status(200).json({ success: true, message: 'SubCategory deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};
