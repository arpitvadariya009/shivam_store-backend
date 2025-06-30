// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createProducts, addToOrder, getOrdersGrouped, getProductsBySubCategoryId, getSingleProduct, updateOrderStatus } = require('../Controller/productController');

// ✅ Multer Setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// ✅ Routes
router.post('/createProducts', upload.array('images'), createProducts);
router.post('/add-to-order', addToOrder);
router.get('/grouped-orders', getOrdersGrouped);
router.get('/get/products', getProductsBySubCategoryId);
router.get('/product', getSingleProduct);
router.put('/update/order', updateOrderStatus);

module.exports = router;
