const User = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
    try {
        const { firmName, city, mobile, pin } = req.body;

        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(203).json({
                message: 'User already exist',
                data: existingUser
            });
        }

        const user = new User({ firmName, city, mobile, pin });
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { mobile, pin } = req.body;

        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(pin, user.pin);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};
