const express = require('express');
const router = express.Router();
const upload = require("../middleware/fileUpload")

const {
    createFavorite,
    getFavorite,
    deleteFavorite
} = require('../Controller/favoriteController');

router.post('/createFavorite', createFavorite);
router.get('/getFavorite', getFavorite);
router.delete('/deleteFavorite', deleteFavorite);

module.exports = router;
