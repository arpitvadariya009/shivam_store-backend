const express = require('express');
const router = express.Router();
const upload = require("../middleware/fileUpload")
const checkUserVerified = require("../middleware/checkUserVerified");

const {
    createFavorite,
    getFavorite,
    deleteFavorite
} = require('../Controller/favoriteController');

router.post('/createFavorite',checkUserVerified, createFavorite);
router.get('/getFavorite',checkUserVerified, getFavorite);
router.delete('/deleteFavorite',checkUserVerified, deleteFavorite);

module.exports = router;
