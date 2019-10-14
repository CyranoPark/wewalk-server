const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('./controller/auth.controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login/facebook', authController.findOrCreateUser, authController.createToken);

module.exports = router;
