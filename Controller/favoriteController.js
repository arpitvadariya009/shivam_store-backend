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

        const products = [];

        for (const fav of favoriteData) {
            const product = fav.productId;

            // If product was deleted OR not found → SKIP safely
            if (!product) continue;

            const productIdStr = product._id.toString();
            const prodObj = product.toObject();

            // Inject variant quantity
            prodObj.variants = prodObj.variants?.map(variant => {
                const cartItem = cartItems.find(
                    item =>
                        item.productId.toString() === productIdStr &&
                        item.variantName === variant.name
                );

                return {
                    ...variant,
                    quantity: cartItem ? cartItem.quantity : 0
                };
            }) || [];

            products.push({
                ...prodObj,
                isFavorite: true
            });
        }

        // ALWAYS return success (even if empty)
        return res.status(200).json({
            success: true,
            message: "Fetched successfully",
            data: products   // <-- empty [] if nothing found
        });

    } catch (error) {
        console.error(error);
        return res.status(200).json({
            success: false,
            message: "Fetched successfully",
            data: []        // <-- return empty list instead of 500
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
