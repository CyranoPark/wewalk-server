const express = require('express');
const router = express.Router();
const courseController = require('./controller/course.controller');
const authController = require('./controller/auth.controller');

router.get('/feeds', authController.verifyToken, courseController.getCoursesByLocation);
router.get('/mycourses', authController.verifyToken, courseController.getMyCourses);

router.post('/course/new', authController.verifyToken, courseController.createCourse);
router.get('/course/:courseId', authController.verifyToken, courseController.getCourseData);

router.put('/course/:courseId/info', authController.verifyToken, courseController.updateCourseInfo);
router.put('/course/:courseId/path', authController.verifyToken, courseController.addPath);
router.put('/course/:courseId/image', authController.verifyToken, courseController.updateLocationImage);
router.post('/course/:courseId/image/upload', authController.verifyToken, courseController.uploadImage.single('file'), courseController.sendFileLocation);
router.put('/course/:courseId/thumbnail', authController.verifyToken, courseController.updateThumbnail);

router.delete('/course/:courseId', authController.verifyToken, courseController.deleteCourse);

module.exports = router;
