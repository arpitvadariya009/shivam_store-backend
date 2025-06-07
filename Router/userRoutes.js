const express = require('express');
const router = express.Router();

const { createUser, loginUser } = require('../Controller/userController');

router.post('/register', createUser);
router.post('/login', loginUser);

module.exports = router;
