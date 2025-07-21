const Favorite = require('../models/favoriteModel');

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

        const favoriteData = await Favorite.find({ userId }).populate('productId');

        const products = favoriteData.map(fav => fav.productId);

        res.status(200).json({ success: true, message: "Fetched successfully", data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
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
