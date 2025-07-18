const express = require('express');
const router = express.Router();
const upload = require("../middleware/fileUpload")

const {
    createFavorite,
    getFavorite
} = require('../Controller/favoriteController');

router.post('/createFavorite', createFavorite);
router.get('/getFavorite', getFavorite);

module.exports = router;
