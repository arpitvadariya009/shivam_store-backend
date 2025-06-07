
const express = require('express');
const router = express.Router();
const upload = require("../middleware/fileUpload")

const {
    createSubCategory,
    getAllSubCategories,
    getSubCategoryById,
    updateSubCategory,
    deleteSubCategory
} = require('../Controller/subcategoryController');

router.post('/createSubCategory', upload.single("image"), createSubCategory);
router.get('/getAllSubCategories', getAllSubCategories);
router.get('/getSubCategoryById', getSubCategoryById);
router.put('/updateSubCategory', updateSubCategory);
router.delete('/deleteSubCategory', deleteSubCategory);

module.exports = router;
