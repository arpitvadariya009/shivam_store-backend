
const express = require('express');
const router = express.Router();
const upload = require("../middleware/fileUpload")
const checkUserVerified = require("../middleware/checkUserVerified");

const {
    createSubCategory,
    getAllSubCategories,
    getSubCategoryById,
    updateSubCategory,
    deleteSubCategory
} = require('../Controller/subcategoryController');

router.post('/createSubCategory',checkUserVerified, upload.single("image"), createSubCategory);
router.get('/getAllSubCategories',checkUserVerified, getAllSubCategories);
router.get('/getSubCategoryById',checkUserVerified, getSubCategoryById);
router.put('/updateSubCategory/:id',checkUserVerified, upload.single("image"), updateSubCategory);
router.delete('/deleteSubCategory/:id',checkUserVerified, deleteSubCategory);

module.exports = router;
