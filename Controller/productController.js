const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Favorite = require('../models/favoriteModel');
exports.createProducts = async (req, res) => {
    try {
        const productArray = JSON.parse(req.body.products);
        const files = req.files;

        const results = [];

        for (let i = 0; i < productArray.length; i++) {
            const p = productArray[i];

            // Use the variants as sent in the request
            const variants = (p.variants || []).map(variant => ({
                name: variant.name,
                available: variant.available !== undefined ? variant.available : true
            }));

            const newProduct = new Product({
                code: p.code,
                subCategoryId: p.subCategoryId,
                setSize: p.setSize,
                image: files[i]?.filename || '',
                variants
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
exports.getProductsBySubCategoryId = async (req, res) => {
    try {
        const { subCategoryId, userId } = req.query;

        if (!subCategoryId) {
            return res.status(400).json({ success: false, error: 'subCategoryId is required' });
        }

        // Fetch all products of the subcategory
        const products = await Product.find({ subCategoryId });

        let favoriteProductIds = [];

        if (userId) {
            // Get favorite products for the user
            const favorites = await Favorite.find({ userId }).select('productId');
            favoriteProductIds = favorites.map(fav => fav.productId.toString());
        }

        // Add isFavorite field to each product
        const updatedProducts = products.map(product => {
            const isFavorite = favoriteProductIds.includes(product._id.toString());
            return {
                ...product.toObject(),
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
        const { userId, productId, productCode, variantName, increment = 1 } = req.body;
        const today = new Date().toISOString().split('T')[0];

        let cart = await Cart.findOne({ userId, date: today });

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
                cart.items.push({ productId, productCode, variantName, quantity: increment });
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

        const cart = await Cart.findOne({ userId, date: today });
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
        const today = new Date().toISOString().split('T')[0];

        const cart = await Cart.findOne({ userId, date: today }).populate('items.productId');

        if (!cart || !cart.items.length) {
            return res.status(404).json({ success: false, message: "Cart is empty." });
        }

        const productMap = {};

        for (const item of cart.items) {
            const product = item.productId;
            if (!product) continue;

            const productIdStr = product._id.toString();

            // Initialize if not already in the map
            if (!productMap[productIdStr]) {
                productMap[productIdStr] = {
                    productId: {
                        _id: product._id,
                        code: product.code,
                        subCategoryId: product.subCategoryId,
                        image: product.image,
                        type: product.type,
                        setSize: product.setSize,
                        createdAt: product.createdAt,
                        __v: product.__v,
                        variants: product.variants.map(v => ({
                            _id: v._id,
                            name: v.name,
                            available: v.available,
                            quantity: 0 // initialize quantity to 0
                        }))
                    }
                };
            }

            // Add quantity to correct variant
            const variantList = productMap[productIdStr].productId.variants;
            const variantIndex = variantList.findIndex(v => v.name === item.variantName);
            if (variantIndex !== -1) {
                variantList[variantIndex].quantity += item.quantity;
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

exports.getOrdersGrouped = async (req, res) => {
    try {
        const { userId } = req.query;

        const orders = await Order.find({ userId }).populate('items.productId');

        const groupedByDate = {};

        for (const order of orders) {
            const date = order.date;

            if (!groupedByDate[date]) {
                groupedByDate[date] = {
                    id: order._id,   // First order's id for that date
                    status: order.status || "0",
                    products: {}
                };
            }

            for (const item of order.items) {
                const key = item.productCode;

                if (!groupedByDate[date].products[key]) {
                    groupedByDate[date].products[key] = {};
                }

                groupedByDate[date].products[key][item.variantName] =
                    (groupedByDate[date].products[key][item.variantName] || 0) + item.quantity;
            }
        }

        const result = Object.keys(groupedByDate)
            .sort((a, b) => new Date(b) - new Date(a)) // latest date first
            .map((date) => {
                const productsArr = Object.entries(groupedByDate[date].products).map(([code, variants]) => {
                    const variantStr = Object.entries(variants)
                        .map(([v, qty]) => `${v} - ${qty}`)
                        .join(' / ');
                    return `${code} → ${variantStr}`;
                });

                return {
                    id: groupedByDate[date].id,
                    date,
                    status: groupedByDate[date].status,
                    products: productsArr,
                };
            });

        res.status(200).json({ success: true, message: 'Grouped orders', data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

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
