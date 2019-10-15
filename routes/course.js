const express = require('express');
const router = express.Router();
const courseController = require('./controller/course.controller');
const authController = require('./controller/auth.controller');

/* GET users listing. */
router.post('/new', authController.verifyToken, courseController.createCourse);
router.post('/:courseId/path', authController.verifyToken, courseController.addPath);
router.post('/:courseId/image', authController.verifyToken, courseController.uploadImage.single('file'), courseController.sendFileLocation);
router.put('/:courseId/image', authController.verifyToken, courseController.updateLocationImage);

module.exports = router;
