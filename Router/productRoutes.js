// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// ✅ Controller imports
const {
    createProducts,
    addToCart,
    updateCartItem,
    getCart,
    getOrdersGrouped,
    placeOrder,
    updateOrderStatus,
    getProductsBySubCategoryId,
    getSingleProduct
} = require('../Controller/productController');

// ✅ Multer Setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// ✅ Product Routes
router.post('/createProducts', upload.array('images'), createProducts);
router.get('/get/products', getProductsBySubCategoryId);
router.get('/product', getSingleProduct);

// ✅ Cart Routes
router.post('/add-to-cart', addToCart);
router.put('/update-to-cart', updateCartItem);
router.get('/get-to-cart', getCart);

// ✅ Order Routes
router.post('/place-order', placeOrder);            // NEW - Place order
router.put('/update/order', updateOrderStatus);     // Update order status
router.get('/grouped-orders', getOrdersGrouped);    // Grouped & sorted orders

module.exports = router;
