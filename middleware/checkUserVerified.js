const mongoose = require('mongoose');
const User = require('../models/userModel');

const checkUserVerified = async (req, res, next) => {
    try {
        const { userId } = req.query;

        // 1. Check if userId exists
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        // 2. Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid userId'
            });
        }

        // 3. Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(604).json({
                success: false,
                message: 'User not found'
            });
        }

        // 4. Check verification
        if (!user.isverified) {
            return res.status(604).json({
                success: false,
                message: 'User is not verified'
            });
        }

        // 5. Attach user to request (optional but recommended)
        req.user = user;

        next();
    } catch (error) {
        console.error('Verification Middleware Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = checkUserVerified;
