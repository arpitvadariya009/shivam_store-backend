const multer = require('multer');
const path = require('path');

// File type validation
const fileFilter = (req, file, cb) => {
    // Image types
    const imageTypes = ['.jpg'];
    // Video types
    const videoTypes = ['.mp4'];

    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (imageTypes.includes(fileExtension) || videoTypes.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (.jpg) and video files (.mp4) are allowed!'), false);
    }
};

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File size limits
const limits = {
    fileSize: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const imageTypes = ['.jpg'];
        const videoTypes = ['.mp4'];
        
        if (imageTypes.includes(fileExtension)) {
            // 5MB limit for images
            return 5 * 1024 * 1024;
        } else if (videoTypes.includes(fileExtension)) {
            // 30MB limit for videos
            return 30 * 1024 * 1024;
        }
        return 5 * 1024 * 1024; // Default to image limit
    }
};

// Create multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 30 * 1024 * 1024 // 30MB max (will be checked more precisely in controller)
    }
});

// Helper function to detect media type from file extension
const detectMediaType = (filename) => {
    const imageTypes = ['.jpg'];
    const videoTypes = ['.mp4'];

    const fileExtension = path.extname(filename).toLowerCase();
    
    if (imageTypes.includes(fileExtension)) {
        return 'image';
    } else if (videoTypes.includes(fileExtension)) {
        return 'video';
    }
    return null;
};

// File size validation middleware
const validateFileSize = (req, res, next) => {
    if (!req.file) {
        return next();
    }
    
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const imageTypes = ['.jpg'];
    const videoTypes = ['.mp4'];

    const fileSizeInMB = req.file.size / (1024 * 1024);
    
    if (imageTypes.includes(fileExtension) && fileSizeInMB > 5) {
        return res.status(400).json({
            success: false,
            message: `Image file size too large. Maximum allowed: 5MB. Your file: ${fileSizeInMB.toFixed(2)}MB`
        });
    }
    
    if (videoTypes.includes(fileExtension) && fileSizeInMB > 30) {
        return res.status(400).json({
            success: false,
            message: `Video file size too large. Maximum allowed: 30MB. Your file: ${fileSizeInMB.toFixed(2)}MB`
        });
    }
    
    next();
};

module.exports = {
    upload,
    detectMediaType,
    validateFileSize
};