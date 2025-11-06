const express = require('express');
const router = express.Router();

const { createUser, loginUser, updateUser, getAllUsers, deleteUser } = require('../Controller/userController');

router.post('/register', createUser);
router.put('/update/user', updateUser);
router.post('/login', loginUser);
router.get('/get/all/users', getAllUsers);
router.delete('/delete/user', deleteUser);

module.exports = router;
