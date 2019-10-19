const Course = require('../../models/Course');
const User = require('../../models/User');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { AWS_CONFIG_REGION } = require('../../constants');

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region : AWS_CONFIG_REGION
});

const s3 = new aws.S3();

exports.getCoursesBypage = async (req, res, next) => {
  try {
    const pageNumber = req.params.pageNo;
    const pageSize = req.params.pageSize;

    if (pageNumber <= 0) {
      throw new Error('invalid Page Number')
    }

  } catch (error) {
    
  }
};

exports.getCourseData = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const targetCourse = await Course.findById(courseId);

    res.status(200).send(targetCourse);
  } catch (error) {
    res.status(400).send({error: 'bad request'});
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const socialId = req.headers.socialid;
    const { startLocation } = req.body;
    const targetUser = await User.findOne({ social_id: socialId });
    const course = {
      created_by: targetUser._id,
      path: [ startLocation ],
      start_location: startLocation,
      distance: 0,
      elevation: 0
    };
    const newCourse = await new Course(course).save();
    res.status(200).send(newCourse);
  } catch (error) {
    res.status(400).send({error: 'bad request'});
  }
};

exports.addPath = async (req, res, next) => {
  try {
    const { path, distance, elevation } = req.body;
    const courseId = req.params.courseId;

    const targetCourse = await Course.findById(courseId);
    path.forEach(location => targetCourse.path.push(location));
    targetCourse.distance += distance;
    targetCourse.elevation += elevation;


    await targetCourse.save();
    res.status(200).send(targetCourse.path);
  } catch (error) {
    res.status(400).send({error: 'bad request'});
  }
};

exports.uploadImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: "wewalk",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, file.originalname + new Date().toDateString());
    }
  })
})

exports.sendFileLocation = (req, res, next) => {
  console.log(req.file)
  res.send({ imageUrl: req.file.location });
};

exports.updateLocationImage = async (req, res, next) => {
  try {
    const { location, imageUrl } = req.body;
    const imageData = {
      image_url: imageUrl,
      location
    };
    const targetCourse = await Course.findById(req.params.courseId);
    targetCourse.images_by_location.push(imageData);
    await targetCourse.save();

    res.send(imageData);
  } catch (error) {
    res.status(400).send({error: 'bad request'});
  }
};
