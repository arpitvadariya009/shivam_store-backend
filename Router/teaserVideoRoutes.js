const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { 
    getTeaserVideo, 
    uploadTeaserVideo, 
    deleteTeaserVideo, 
    getAllTeaserVideos 
} = require('../Controller/teaserVideoController');

// Configure multer for video upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'teaser-video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow video files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed!'), false);
    }
};

// Configure multer with size limit (50MB)
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Routes
router.get('/teaser-video', getTeaserVideo);
router.post('/teaser-video/upload', upload.single('video'), uploadTeaserVideo);
router.delete('/teaser-video', deleteTeaserVideo);
router.get('/teaser-videos/all', getAllTeaserVideos);

module.exports = router;