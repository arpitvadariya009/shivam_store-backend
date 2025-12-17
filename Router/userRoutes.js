const express = require('express');
const router = express.Router();
const checkUserVerified = require("../middleware/checkUserVerified");

const { createUser, loginUser, updateUser, getAllUsers, deleteUser } = require('../Controller/userController');

router.post('/register', createUser);
router.put('/update/user',checkUserVerified, updateUser);
router.post('/login', loginUser);
router.get('/get/all/users',checkUserVerified, getAllUsers);
router.delete('/delete/user',checkUserVerified, deleteUser);

module.exports = router;
