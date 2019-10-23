const express = require('express');
const router = express.Router();
const authController = require('./controller/auth.controller');

router.post('/login/facebook', authController.findOrCreateUser, authController.createToken);
router.post('/logout', authController.logout);

module.exports = router;
