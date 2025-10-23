const express = require('express');
const router = express.Router();

const { createUser, loginUser, updateUser, getAllUsers } = require('../Controller/userController');

router.post('/register', createUser);
router.put('/update/user', updateUser);
router.post('/login', loginUser);
router.get('/get/all/users', getAllUsers);

module.exports = router;
