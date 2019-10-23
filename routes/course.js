const express = require('express');
const router = express.Router();
const courseController = require('./controller/course.controller');
const authController = require('./controller/auth.controller');

router.post('/new', authController.verifyToken, courseController.createCourse);
router.get('/my', authController.verifyToken, courseController.getMyCourses);
router.get('/:courseId', authController.verifyToken, courseController.getCourseData);
router.delete('/:courseId', authController.verifyToken, courseController.deleteCourse);
router.post('/:courseId/info', authController.verifyToken, courseController.updateCourseInfo);
router.post('/:courseId/path', authController.verifyToken, courseController.addPath);
router.post('/:courseId/image/upload', authController.verifyToken, courseController.uploadImage.single('file'), courseController.sendFileLocation);
router.post('/:courseId/image', authController.verifyToken, courseController.updateLocationImage);
router.post('/:courseId/thumbnail', authController.verifyToken, courseController.updateThumbnail);
router.get('/', authController.verifyToken, courseController.getCoursesByLocation);

module.exports = router;
