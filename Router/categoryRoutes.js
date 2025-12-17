const express = require('express');
const router = express.Router();
const upload = require("../middleware/fileUpload")
const checkUserVerified = require("../middleware/checkUserVerified");

const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../Controller/categoryController');

router.post('/createCategory',checkUserVerified, upload.single("image"), createCategory);
router.get('/getAllCategories',checkUserVerified, getAllCategories);
router.get('/getCategoryById',checkUserVerified, getCategoryById);
router.put('/updateCategory/:id',checkUserVerified, upload.single("image"), updateCategory);
router.delete('/deleteCategory',checkUserVerified, deleteCategory);

module.exports = router;
