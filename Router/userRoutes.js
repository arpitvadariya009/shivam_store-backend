const express = require('express');
const router = express.Router();

const { createUser, loginUser, updateUser } = require('../Controller/userController');

router.post('/register', createUser);
router.put('/update/user', updateUser);
router.post('/login', loginUser);

module.exports = router;
