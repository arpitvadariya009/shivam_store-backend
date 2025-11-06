const express = require('express');
const router = express.Router();
const upload = require("../middleware/fileUpload")

const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../Controller/categoryController');

router.post('/createCategory', upload.single("image"), createCategory);
router.get('/getAllCategories', getAllCategories);
router.get('/getCategoryById', getCategoryById);
router.put('/updateCategory/:id', upload.single("image"), updateCategory);
router.delete('/deleteCategory', deleteCategory);

module.exports = router;
