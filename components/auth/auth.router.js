const express = require('express');
const authController = require('./auth.controller');
const router = express.Router();

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
