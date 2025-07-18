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
        const favoriteData = await Favorite.find({ userId: userId });

        res.status(200).json({ success: true, data: favoriteData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};
