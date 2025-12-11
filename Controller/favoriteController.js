const Favorite = require('../models/favoriteModel');
const Cart = require('../models/cartModel');
// Create category
exports.createFavorite = async (req, res) => {
    try {

        const favoriteData = await Favorite.create(req.body);

        res.status(201).json({ success: true, data: favoriteData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};

exports.getFavorite = async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }

        // Get favorite products with product details
        const favoriteData = await Favorite.find({ userId }).populate('productId');

        // --- FETCH CART DATA ---
        let cartItems = [];
        const cart = await Cart.findOne({ userId, status: 0 });
        if (cart && cart.items) {
            cartItems = cart.items;
        }

        // Build products with injected cart quantity + isFavorite
        const products = favoriteData.map(fav => {
            const product = fav.productId;
            const productIdStr = product._id.toString();

            const prodObj = product.toObject();

            // Inject quantity in variants (same logic as your first API)
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
                isFavorite: true
            };
        });

        // Response does NOT change
        res.status(200).json({
            success: true,
            message: "Fetched successfully",
            data: products
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error
        });
    }
};

exports.deleteFavorite = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const result = await Favorite.findOneAndDelete({ userId, productId });

        if (!result) {
            return res.status(404).json({ success: false, message: 'Favorite not found' });
        }

        res.status(200).json({ success: true, message: 'Favorite deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};
