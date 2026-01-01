const express = require('express');
const router = express.Router();
const checkUserVerified = require("../middleware/checkUserVerified");

const { createUser, loginUser, updateUser, getAllUsers, deleteUser,getUser } = require('../Controller/userController');

router.post('/register', createUser);
router.put('/update/user',checkUserVerified, updateUser);
router.post('/login', loginUser);
router.get('/get/all/users',checkUserVerified, getAllUsers);
router.delete('/delete/user',checkUserVerified, deleteUser);
router.get('/get/user', getUser);

module.exports = router;
