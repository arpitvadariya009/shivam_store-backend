const User = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
    try {
        const { firmName, city, mobile, pin, userName } = req.body;

        // Validate required fields
        if (!userName) {
            return res.status(400).json({
                success: false,
                message: 'User name is required'
            });
        }

        if (!mobile) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number is required'
            });
        }

        if (!pin) {
            return res.status(400).json({
                success: false,
                message: 'PIN is required'
            });
        }

        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(203).json({
                success: false,
                message: 'User already exist',
                data: existingUser
            });
        }

        const user = new User({ firmName, city, mobile, pin, userName });
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { mobile, pin } = req.body;

        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(pin, user.pin);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.query;
        const updateData = req.body;

        if (updateData.pin) {
            updateData.pin = await bcrypt.hash(updateData.pin, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Update failed',
            error: error.message
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { firmName, city, mobile, isverified, userType } = req.query;

        const filter = {};
        if (firmName) filter.firmName = { $regex: firmName, $options: 'i' };
        if (city) filter.city = { $regex: city, $options: 'i' };
        if (mobile) filter.mobile = mobile;
        if (isverified !== undefined) filter.isverified = isverified === 'true';
        if (userType !== undefined) filter.userType = Number(userType);

        const users = await User.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: deletedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};
