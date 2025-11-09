const TeaserVideo = require('../models/teaserVideoModel');
const fs = require('fs');
const path = require('path');

// Get current active teaser video
exports.getTeaserVideo = async (req, res) => {
    try {
        const teaserVideo = await TeaserVideo.findOne({ isActive: true }).sort({ createdAt: -1 });
        
        if (!teaserVideo) {
            return res.status(200).json({
                success: true,
                message: 'No teaser video found',
                videoUrl: null
            });
        }

        // Return correct production URL format
        const videoUrl = `https://yummyburp.in/uploads/${teaserVideo.filename}`;

        res.status(200).json({
            success: true,
            message: 'Teaser video fetched successfully',
            videoUrl: videoUrl,
            data: teaserVideo
        });
    } catch (error) {
        console.error('Error fetching teaser video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teaser video',
            error: error.message
        });
    }
};

// Upload or update teaser video
exports.uploadTeaserVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file provided'
            });
        }

        const file = req.file;

        // Validate file type
        if (!file.mimetype.startsWith('video/')) {
            // Delete the uploaded file if it's not a video
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting invalid file:', err);
            });
            
            return res.status(400).json({
                success: false,
                message: 'Only video files are allowed'
            });
        }

        // Validate file size (50MB = 50 * 1024 * 1024 bytes)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            // Delete the uploaded file if it's too large
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting large file:', err);
            });
            
            return res.status(400).json({
                success: false,
                message: 'Video file size must be less than 50MB'
            });
        }

        // Get current active video to delete it later
        const currentVideo = await TeaserVideo.findOne({ isActive: true });

        // Create video URL - always use production URL
        const videoUrl = `https://yummyburp.in/uploads/${file.filename}`;

        // Create new teaser video record
        const newTeaserVideo = new TeaserVideo({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            url: videoUrl,
            isActive: true
        });

        await newTeaserVideo.save();

        // Delete the old video file and database record if it exists
        if (currentVideo) {
            // Delete old file from filesystem
            const oldFilePath = path.join(__dirname, '..', 'uploads', currentVideo.filename);
            fs.unlink(oldFilePath, (err) => {
                if (err) console.error('Error deleting old video file:', err);
            });

            // Delete old database record
            await TeaserVideo.findByIdAndDelete(currentVideo._id);
        }

        res.status(200).json({
            success: true,
            message: 'Teaser video uploaded successfully',
            videoUrl: newTeaserVideo.url,
            data: newTeaserVideo
        });

    } catch (error) {
        // Clean up uploaded file in case of error
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file after error:', err);
            });
        }

        console.error('Error uploading teaser video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload teaser video',
            error: error.message
        });
    }
};

// Delete teaser video
exports.deleteTeaserVideo = async (req, res) => {
    try {
        const teaserVideo = await TeaserVideo.findOne({ isActive: true });

        if (!teaserVideo) {
            return res.status(404).json({
                success: false,
                message: 'No active teaser video found'
            });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', 'uploads', teaserVideo.filename);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting video file:', err);
        });

        // Delete from database
        await TeaserVideo.findByIdAndDelete(teaserVideo._id);

        res.status(200).json({
            success: true,
            message: 'Teaser video deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting teaser video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete teaser video',
            error: error.message
        });
    }
};

// Get all teaser videos (for admin purposes)
exports.getAllTeaserVideos = async (req, res) => {
    try {
        const teaserVideos = await TeaserVideo.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Teaser videos fetched successfully',
            count: teaserVideos.length,
            data: teaserVideos
        });

    } catch (error) {
        console.error('Error fetching teaser videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teaser videos',
            error: error.message
        });
    }
};