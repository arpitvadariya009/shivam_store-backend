const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Favorite = require('../models/favoriteModel');
const { detectMediaType } = require('../middleware/mediaUpload');

exports.createProducts = async (req, res) => {
    try {
        // Validate request body
        if (!req.body.products) {
            return res.status(400).json({
                success: false,
                message: 'Products data is required in request body',
            });
        }

        let productArray;
        try {
            productArray = JSON.parse(req.body.products);
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON in products field. Please check your request data.',
                error: parseError.message
            });
        }

        if (!Array.isArray(productArray) || productArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Products must be a non-empty array',
            });
        }

        const files = req.files || [];

        // Validate files array
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Media files are required. Please upload at least one file.',
            });
        }

        if (files.length !== productArray.length) {
            return res.status(400).json({
                success: false,
                message: `Number of files (${files.length}) does not match number of products (${productArray.length})`,
            });
        }

        const results = [];

        for (let i = 0; i < productArray.length; i++) {
            const p = productArray[i];
            const file = files[i];

            // Validation
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: `Media file is required for product ${i + 1}`,
                });
            }

            if (!p.categoryId) {
                return res.status(400).json({
                    success: false,
                    message: `CategoryId is required for product ${i + 1}`,
                });
            }

            // Detect media type from file extension
            const mediaType = detectMediaType(file.filename);
            if (!mediaType) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid file type for product ${i + 1}. Only images and videos are allowed.`,
                });
            }

            // Process variants - default to 'A' with setSize 1 if no variants provided
            let variants = [];
            if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
                variants = p.variants.map(variant => ({
                    name: variant.name || 'A',
                    setSize: variant.setSize || 1
                }));
            } else {
                // Default: start with variant 'A'
                variants = [{
                    name: 'A',
                    setSize: 1
                }];
            }

            const newProduct = new Product({
                code: p.code,
                subCategoryId: p.subCategoryId,
                categoryId: p.categoryId,
                media: file.filename,
                mediaType: mediaType,
                type: p.type || 1,
                variants: variants
            });

            await newProduct.save();
            results.push(newProduct);
        }

        res.status(201).json({
            success: true,
            message: 'Products created successfully',
            data: results
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

// exports.getProductsBySubCategoryId = async (req, res) => {
//     try {
//         const { subCategoryId, userId } = req.query;

//         if (!subCategoryId) {
//             return res.status(400).json({ success: false, error: 'subCategoryId is required' });
//         }

//         // Fetch all products of the subcategory
//         const products = await Product.find({ subCategoryId });

//         let favoriteProductIds = [];

//         if (userId) {
//             // Get favorite products for the user
//             const favorites = await Favorite.find({ userId }).select('productId');
//             favoriteProductIds = favorites.map(fav => fav.productId.toString());
//         }

//         // Add isFavorite field to each product
//         const updatedProducts = products.map(product => {
//             const isFavorite = favoriteProductIds.includes(product._id.toString());
//             return {
//                 ...product.toObject(),
//                 isFavorite
//             };
//         });

//         res.status(200).json({
//             success: true,
//             message: 'Products fetched successfully',
//             data: updatedProducts
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// };

exports.getProductsBySubCategoryId = async (req, res) => {
    try {
        const { subCategoryId, userId } = req.query;

        if (!subCategoryId) {
            return res.status(400).json({ success: false, error: 'subCategoryId is required' });
        }

        // Fetch all products of the subcategory
        const products = await Product.find({ subCategoryId });

        let favoriteProductIds = [];
        let cartItems = [];

        if (userId) {
            // Get favorites
            const favorites = await Favorite.find({ userId }).select('productId');
            favoriteProductIds = favorites.map(fav => fav.productId.toString());

            // User cart
            const cart = await Cart.findOne({ userId, status: 0 });
            if (cart && cart.items) {
                cartItems = cart.items;
            }
        }

        // Build final product list
        const updatedProducts = products.map(product => {
            const productIdStr = product._id.toString();
            const isFavorite = favoriteProductIds.includes(productIdStr);

            // Clone product
            const prodObj = product.toObject();

            // Inject quantity in variants
            prodObj.variants = prodObj.variants.map(variant => {
                const cartItem = cartItems.find(
                    item =>
                        item.productId.toString() === productIdStr &&
                        item.variantName === variant.name
                );

                return {
                    ...variant,
                    quantity: cartItem ? cartItem.quantity : 0  
                };
            });

            return {
                ...prodObj,
                isFavorite
            };
        });

        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: updatedProducts
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


exports.updateVariantAvailability = async (req, res) => {
    try {
        const { productId, variantId, available } = req.query;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const variant = product.variants.id(variantId);

        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        variant.available = available;
        await product.save();

        return res.status(200).json({ message: 'Variant availability updated successfully', product });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getSingleProduct = async (req, res) => {
    try {
        const { productId } = req.query;

        if (!productId) {
            return res.status(400).json({ success: false, error: 'productId is required' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Product fetched successfully',
            data: product
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, categoryId, productCode, variantName, increment = 1 } = req.body;
        const today = new Date().toISOString().split('T')[0];

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            if (increment <= 0) {
                return res.status(400).json({ success: false, message: "Cannot decrement item that doesn't exist." });
            }
            cart = new Cart({ userId, date: today, items: [], totalQuantity: 0 });
        }

        const existingItemIndex = cart.items.findIndex(
            (item) => item.productCode === productCode && item.variantName === variantName
        );

        if (existingItemIndex > -1) {
            const newQty = cart.items[existingItemIndex].quantity + increment;

            if (newQty <= 0) {
                cart.totalQuantity -= cart.items[existingItemIndex].quantity;
                cart.items.splice(existingItemIndex, 1);
            } else {
                cart.totalQuantity += increment;
                cart.items[existingItemIndex].quantity = newQty;
            }
        } else {
            if (increment > 0) {
                cart.items.push({ productId, categoryId, productCode, variantName, quantity: increment });
                cart.totalQuantity += increment;
            } else {
                return res.status(400).json({ success: false, message: "Cannot decrement non-existing item." });
            }
        }

        if (cart.items.length === 0) {
            await Cart.deleteOne({ _id: cart._id });
            return res.status(200).json({ success: false, message: 'Cart deleted as no items remain.' });
        }

        await cart.save();
        res.status(200).json({ success: true, message: 'Cart updated', cart });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { userId, productCode, variantName, increment = 1 } = req.body;
        const today = new Date().toISOString().split('T')[0];

        if (increment === 0) {
            return res.status(400).json({ success: false, message: "Increment cannot be zero." });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.productCode === productCode && item.variantName === variantName
        );

        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Item not found in cart." });
        }

        const currentQty = cart.items[itemIndex].quantity;
        const newQty = currentQty + increment;

        if (newQty <= 0) {
            // Remove the item
            cart.totalQuantity -= currentQty;
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = newQty;
            cart.totalQuantity += increment;
        }

        if (cart.items.length === 0) {
            await Cart.deleteOne({ _id: cart._id });
            return res.status(200).json({ success: false, message: 'Cart deleted as all items removed.' });
        }

        await cart.save();
        res.status(200).json({ success: true, message: "Cart item updated via increment.", cart });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const { userId } = req.query;
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || !cart.items.length) {
            return res.status(404).json({ success: false, message: "Cart is empty." });
        }

        const productMap = {};

        for (const item of cart.items) {
            const product = item.productId;
            if (!product) continue;

            const productIdStr = product._id.toString();

            if (!productMap[productIdStr]) {
                productMap[productIdStr] = {
                    ...product.toObject(),
                    variants: product.variants.map(v => ({
                        ...v.toObject(),
                        quantity: 0
                    }))
                };
            }

            const variantList = productMap[productIdStr].variants;
            const variantIndex = variantList.findIndex(v => v.name === item.variantName);

            if (variantIndex !== -1) {
                variantList[variantIndex].quantity += item.quantity;
            } else {
                console.warn(`Variant ${item.variantName} not found for product ${product.code}`);
            }
        }

        res.status(200).json({
            success: true,
            cart: Object.values(productMap)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const { orderId } = req.query;
        const cart = await Order.findById(orderId).populate('items.productId');

        if (!cart || !cart.items.length) {
            return res.status(404).json({ success: false, message: "Order is empty." });
        }

        const productMap = {};

        for (const item of cart.items) {
            const product = item.productId;
            if (!product) continue;

            const productIdStr = product._id.toString();

            if (!productMap[productIdStr]) {
                const { __v, ...productData } = product.toObject();
                productMap[productIdStr] = {
                    ...productData,
                    variants: product.variants
                        // .filter(v => v.available)
                        .map(v => ({
                            _id: v._id,
                            name: v?.name,
                            setSize: v?.setSize,
                            available: v?.available,
                            quantity: 0
                        }))
                };
            }

            // Add quantity to correct variant
            const variantList = productMap[productIdStr].variants;
            const variantIndex = variantList.findIndex(v => v.name === item.variantName);
            if (variantIndex !== -1) {
                variantList[variantIndex].quantity += item.quantity;
            } else {
                console.warn(`Variant ${item.variantName} not found for product ${product.code}`);
            }
        }

        const responseCart = Object.values(productMap);

        res.status(200).json({
            success: true,
            cart: responseCart
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// exports.getOrdersGrouped = async (req, res) => {
//     try {
//         const { userId } = req.query;

//         const orders = await Order.find({ userId }).populate('items.productId');

//         const groupedByDate = {};

//         for (const order of orders) {
//             const date = order.date;

//             if (!groupedByDate[date]) {
//                 groupedByDate[date] = {
//                     id: order._id,   // First order's id for that date
//                     status: order.status || "0",
//                     products: {}
//                 };
//             }

//             for (const item of order.items) {
//                 const key = item.productCode;

//                 if (!groupedByDate[date].products[key]) {
//                     groupedByDate[date].products[key] = {};
//                 }

//                 groupedByDate[date].products[key][item.variantName] =
//                     (groupedByDate[date].products[key][item.variantName] || 0) + item.quantity;
//             }
//         }

//         const result = Object.keys(groupedByDate)
//             .sort((a, b) => new Date(b) - new Date(a)) // latest date first
//             .map((date) => {
//                 const productsArr = Object.entries(groupedByDate[date].products).map(([code, variants]) => {
//                     const variantStr = Object.entries(variants)
//                         .map(([v, qty]) => `${v} - ${qty}`)
//                         .join(' / ');
//                     return `${code} → ${variantStr}`;
//                 });

//                 return {
//                     id: groupedByDate[date].id,
//                     date,
//                     status: groupedByDate[date].status,
//                     products: productsArr,
//                 };
//             });

//         res.status(200).json({ success: true, message: 'Grouped orders', data: result });
//     } catch (err) {
//         res.status(500).json({ success: false, error: err.message });
//     }
// };

exports.submitCartToOrder = async (req, res) => {
    try {
        const { userId } = req.body;
        const today = new Date().toISOString().split('T')[0];

        const cart = await Cart.findOne({ userId, date: today });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty." });
        }

        let order = await Order.findOne({ userId, date: today });

        if (!order) {
            order = new Order({
                userId,
                date: today,
                items: cart.items,
                status: 0
            });
        } else {
            // Merge cart items into existing order
            for (const cartItem of cart.items) {
                const existingIndex = order.items.findIndex(
                    (item) =>
                        item.productCode === cartItem.productCode &&
                        item.variantName === cartItem.variantName
                );

                if (existingIndex > -1) {
                    order.items[existingIndex].quantity += cartItem.quantity;
                } else {
                    order.items.push(cartItem);
                }
            }
        }

        await order.save();
        await Cart.deleteOne({ _id: cart._id });

        res.status(200).json({ success: true, message: "Order placed successfully.", order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Order ID and status are required." });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        order.status = status;
        await order.save();

        res.status(200).json({ success: true, message: "Order status updated successfully.", order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.placeOrder = async (req, res) => {
    try {
        const { userId } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const cart = await Cart.findOne({ userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty." });
        }

        const newOrder = new Order({
            userId,
            date: today,
            items: cart.items,
            note: req.body.note,
            totalQuantity: cart.totalQuantity,
            status: 0, // default pending
        });

        await newOrder.save();
        await Cart.deleteOne({ _id: cart._id });

        res.status(200).json({ success: true, message: "Order placed successfully.", order: newOrder });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        const updated = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

        if (!updated) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        res.status(200).json({ success: true, message: "Order status updated.", order: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
exports.getOrdersGrouped = async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { userId } : {};

        const orders = await Order.find(filter)
            .populate('items.productId', 'productCode') // only get productCode from Product
            .sort({ createdAt: -1 });

        if (!orders.length) {
            return res.status(404).json({ success: false, message: "No orders found." });
        }

        // Group by date in a simplified structure
        const groupedOrders = {};

        for (const order of orders) {
            const date = order.date;

            if (!groupedOrders[date]) {
                groupedOrders[date] = [];
            }

            // Combine items for the same productCode into a single string like: "1005 → C - 6 / D - 6 / E - 12"
            const productMap = {};

            order.items.forEach(item => {
                const code = item.productCode || (item.productId?.productCode ?? 'N/A');
                if (!productMap[code]) {
                    productMap[code] = [];
                }
                productMap[code].push(`${item.variantName} - ${item.quantity}`);
            });

            Object.entries(productMap).forEach(([code, variants]) => {
                groupedOrders[date].push(`${code} → ${variants.join(' / ')}`);
            });
        }

        res.status(200).json({
            success: true,
            groupedOrders
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
exports.getAllOrdersList = async (req, res) => {
    try {
        const { status, category, date } = req.query;

        // Build base filter
        const filter = {};
        if (status !== undefined && status !== '') {
            filter.status = Number(status);
        }
        if (date && date.trim() !== '') {
            filter.date = date;
        }

        // Fetch orders with population
        const orders = await Order.find(filter)
            .populate('userId', 'firmName city')
            .populate('items.productId', 'name')
            .populate('items.categoryId', 'name colorCode')
            .sort({ createdAt: -1 });

        if (!orders.length) {
            return res.status(200).json({
                success: true,
                message: "No orders found.",
                total: 0,
                orders: []
            });
        }

        const formattedOrders = [];

        for (const order of orders) {
            for (const item of order.items) {
                console.log(item);

                if (category && category.trim() !== '') {
                    if (!item.categoryId?.name ||
                        item.categoryId.name.toLowerCase() !== category.toLowerCase()) {
                        continue;
                    }
                }

                formattedOrders.push({
                    orderId: order._id,
                    note: order.note,
                    date: order.date,
                    city: order.userId?.city || 'Unknown',
                    firmName: order.userId?.firmName || 'Unknown',
                    category: item.categoryId?.name || 'Unknown',
                    colorCode: item.categoryId?.colorCode,
                    productName: item.productId?.name || 'Unknown',
                    productCode: item.productCode || 'Unknown',
                    variantName: item.variantName,
                    quantity: item.quantity,
                    status: getStatusText(order.status),
                });
            }
        }

        if (!formattedOrders.length) {
            return res.status(200).json({
                success: true,
                message: "No matching orders found.",
                total: 0,
                orders: []
            });
        }

        res.status(200).json({
            success: true,
            total: formattedOrders.length,
            orders: formattedOrders
        });

    } catch (err) {
        console.error("Error in getAllOrdersList:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ✅ Delete Orders by Category - Remove orders with "Unknown" category
exports.deleteOrdersByCategory = async (req, res) => {
    try {
        const { category = 'Unknown' } = req.body;

        console.log(`🗑️  Starting deletion of orders with category: ${category}`);

        // Find all orders
        const orders = await Order.find({})
            .populate('items.categoryId', 'name');

        let deletedOrdersCount = 0;
        let deletedItemsCount = 0;
        let ordersToDelete = [];
        let ordersToUpdate = [];

        for (const order of orders) {
            let itemsToKeep = [];
            let hasUnknownItems = false;

            for (const item of order.items) {
                const itemCategory = item.categoryId?.name || 'Unknown';

                if (itemCategory === category) {
                    hasUnknownItems = true;
                    deletedItemsCount++;
                    console.log(`🗑️  Found item with ${category} category:`, {
                        orderId: order._id,
                        productCode: item.productCode,
                        category: itemCategory
                    });
                } else {
                    itemsToKeep.push(item);
                }
            }

            if (hasUnknownItems) {
                if (itemsToKeep.length === 0) {
                    // Delete entire order if all items are "Unknown"
                    ordersToDelete.push(order._id);
                    deletedOrdersCount++;
                } else {
                    // Update order to remove only "Unknown" items
                    ordersToUpdate.push({
                        orderId: order._id,
                        newItems: itemsToKeep,
                        newTotalQuantity: itemsToKeep.reduce((sum, item) => sum + item.quantity, 0)
                    });
                }
            }
        }

        // Execute deletions
        if (ordersToDelete.length > 0) {
            await Order.deleteMany({ _id: { $in: ordersToDelete } });
            console.log(`🗑️  Deleted ${ordersToDelete.length} complete orders`);
        }

        // Execute updates
        for (const update of ordersToUpdate) {
            await Order.findByIdAndUpdate(update.orderId, {
                items: update.newItems,
                totalQuantity: update.newTotalQuantity
            });
        }

        console.log(`🗑️  Updated ${ordersToUpdate.length} orders (removed items only)`);

        res.status(200).json({
            success: true,
            message: `Successfully deleted orders/items with category "${category}"`,
            summary: {
                deletedCompleteOrders: deletedOrdersCount,
                updatedOrders: ordersToUpdate.length,
                deletedItems: deletedItemsCount,
                category: category
            }
        });

    } catch (err) {
        console.error("Error in deleteOrdersByCategory:", err);
        res.status(500).json({
            success: false,
            error: err.message,
            message: "Failed to delete orders by category"
        });
    }
};

// ✅ Status Code → Text Mapping
function getStatusText(status) {
    switch (status) {
        case 0: return 'PENDING';
        case 1: return 'IN PROCESS';
        case 2: return 'DONE';
        default: return 'UNKNOWN';
    }
}

// ✅ Update Product Media (Image/Video)
exports.updateProductMedia = async (req, res) => {
    try {
        const { productId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Media file is required'
            });
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Detect media type from file extension
        const mediaType = detectMediaType(file.filename);
        if (!mediaType) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only images and videos are allowed.'
            });
        }

        // Delete old media file
        const fs = require('fs');
        const path = require('path');
        if (product.media) {
            const oldFilePath = path.join(__dirname, '../uploads', product.media);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
                console.log(`🗑️ Deleted old media file: ${product.media}`);
            }
        }

        // Update product with new media
        product.media = file.filename;
        product.mediaType = mediaType;
        await product.save();

        console.log(`✅ Updated product ${productId} media: ${file.filename}`);

        res.status(200).json({
            success: true,
            message: 'Product media updated successfully',
            data: product
        });

    } catch (err) {
        console.error('Error updating product media:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

// ✅ Update Product (Code, Category, Subcategory, Type, Variants)
exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { code, categoryId, subCategoryId, type, variants } = req.body;

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Validate and update code if provided
        if (code !== undefined) {
            if (!code.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Product code cannot be empty'
                });
            }

            // Check if code already exists (excluding current product)
            const existingProduct = await Product.findOne({
                code: code.trim(),
                _id: { $ne: productId }
            });
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'Product code already exists'
                });
            }

            product.code = code.trim();
        }

        // Update categoryId if provided
        if (categoryId !== undefined) {
            product.categoryId = categoryId;
        }

        // Update subCategoryId if provided
        if (subCategoryId !== undefined) {
            product.subCategoryId = subCategoryId;
        }

        // Update type if provided (1-6)
        if (type !== undefined) {
            if (![1, 2, 3, 4, 5, 6].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Product type must be between 1 and 6'
                });
            }
            product.type = type;
        }

        // Update variants if provided
        if (variants !== undefined) {
            if (!Array.isArray(variants)) {
                return res.status(400).json({
                    success: false,
                    message: 'Variants must be an array'
                });
            }

            // Validate variants
            for (let variant of variants) {
                if (!variant.name || typeof variant.name !== 'string') {
                    return res.status(400).json({
                        success: false,
                        message: 'Each variant must have a valid name'
                    });
                }

                if (variant.setSize === undefined || variant.setSize < 0 || variant.setSize > 100) {
                    return res.status(400).json({
                        success: false,
                        message: 'Variant setSize must be between 0 and 100'
                    });
                }
            }

            product.variants = variants;
        }

        await product.save();

        console.log(`✅ Updated product ${productId}`);

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });

    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

// ✅ Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete media file if exists
        const fs = require('fs');
        const path = require('path');
        if (product.media) {
            const filePath = path.join(__dirname, '../uploads', product.media);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Deleted media file: ${product.media}`);
            }
        }

        // Delete product from database
        await Product.findByIdAndDelete(productId);

        console.log(`✅ Deleted product ${productId}`);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};