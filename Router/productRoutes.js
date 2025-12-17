// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { upload, validateFileSize } = require('../middleware/mediaUpload');
const checkUserVerified = require("../middleware/checkUserVerified");

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
    getSingleProduct,
    getAllOrdersList,
    deleteOrdersByCategory,
    updateProductMedia,
    updateProduct,
    deleteProduct,
    getOrder,
    getSingleOrder,
    updateVariantAvailability,
    getUnavailables } = require('../Controller/productController');

// ✅ Product Routes
router.post('/createProducts', checkUserVerified, upload.array('media'), validateFileSize, createProducts);
router.get('/get/products', checkUserVerified, getProductsBySubCategoryId);
router.get('/product', checkUserVerified, getSingleProduct);
router.get('/products/unavailable-variants', checkUserVerified, getUnavailables);
router.put('/updateProductMedia/:productId', checkUserVerified, upload.single('media'), validateFileSize, updateProductMedia);
router.put('/updateProduct/:productId', checkUserVerified, updateProduct);
router.delete('/deleteProduct/:productId', checkUserVerified, deleteProduct);

// ✅ Cart Routes
router.post('/add-to-cart', checkUserVerified, addToCart);
router.put('/update-to-cart', checkUserVerified, updateCartItem);
router.get('/get-to-cart', checkUserVerified, getCart);

// ✅ Order Routes
router.post('/place-order', checkUserVerified, placeOrder);            // NEW - Place order
router.put('/update/order', checkUserVerified, updateOrderStatus);     // Update order status
router.get('/order/:orderId', checkUserVerified, getSingleOrder);            // Get single order by ID
router.get('/grouped-orders', checkUserVerified, getOrdersGrouped);    // Grouped & sorted orders
router.get('/all/grouped-orders', checkUserVerified, getAllOrdersList);    // Grouped & sorted orders
router.delete('/deleteOrdersByCtgr', checkUserVerified, deleteOrdersByCategory);  // Delete orders by category
router.get('/get-to-order', checkUserVerified, getOrder);
router.get('/get-to-available', checkUserVerified, updateVariantAvailability);

module.exports = router;
