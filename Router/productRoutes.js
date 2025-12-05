// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { upload, validateFileSize } = require('../middleware/mediaUpload');

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
    updateVariantAvailability,
    getUnavailables,
    getOrder
} = require('../Controller/productController');

// ✅ Product Routes
router.post('/createProducts', upload.array('media'), validateFileSize, createProducts);
router.get('/get/products', getProductsBySubCategoryId);
router.get('/product', getSingleProduct);
router.get('/products/unavailable-variants', getUnavailables);
router.put('/updateProductMedia/:productId', upload.single('media'), validateFileSize, updateProductMedia);
router.put('/updateProduct/:productId', updateProduct);
router.delete('/deleteProduct/:productId', deleteProduct);

// ✅ Cart Routes
router.post('/add-to-cart', addToCart);
router.put('/update-to-cart', updateCartItem);
router.get('/get-to-cart', getCart);

// ✅ Order Routes
router.post('/place-order', placeOrder);            // NEW - Place order
router.put('/update/order', updateOrderStatus);     // Update order status
router.get('/order/:orderId', getOrder);            // Get single order by ID
router.get('/grouped-orders', getOrdersGrouped);    // Grouped & sorted orders
router.get('/all/grouped-orders', getAllOrdersList);    // Grouped & sorted orders
router.delete('/deleteOrdersByCtgr', deleteOrdersByCategory);  // Delete orders by category
router.get('/get-to-order', getOrder);
router.get('/get-to-available', updateVariantAvailability);

module.exports = router;
