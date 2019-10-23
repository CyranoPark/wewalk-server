const Course = require('../../models/Course');
const User = require('../../models/User');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { AWS_CONFIG_REGION, AWA_S3_BUCKET } = require('../../constants');

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region : AWS_CONFIG_REGION
});

const s3 = new aws.S3();

exports.getCoursesByLocation = async (req, res, next) => {
  try {
    const pageNumber = parseInt(req.query.pageNo);
    const pageSize =  parseInt(req.query.pageSize);
    const currentLocation =  [ Number(req.query.lon), Number(req.query.lat) ];
    if (pageNumber < 0 || !pageNumber) {
      throw new Error('invalid Page Number');
    }

    const skipNumber = pageSize * ( pageNumber - 1 );
    const courses = await Course
      .find({
        ispublic: true,
        start_location: {
          $near: {
            $maxDistance: 10000,
            $geometry: {
              type: 'Point',
              coordinates: currentLocation,
              spherical: true
            }
          }
        },
        created_by: {
          $ne: req.session.userId
        }
      }, null, { skip: skipNumber })
      .limit(pageSize)
      .populate({ path: 'created_by', select: 'name' });

    res.json(courses);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.getMyCourses = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.session.userId);
    const courses = await Course
      .find({ created_by: targetUser._id })
      .sort({ createdAt: 'desc' })
      .populate({ path: 'created_by' });

    if (!courses.length) {
      throw new Error('No more Courses aroud hear');
    }

    res.json(courses);
  } catch (error) {
    res.status(400).send(error.message);
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
    bucket: AWA_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, file.originalname);
    }
  })
});

exports.sendFileLocation = (req, res, next) => {
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

exports.updateThumbnail = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;

    const targetCourse = await Course.findById(req.params.courseId);
    targetCourse.thumbnail = imageUrl;
    await targetCourse.save();

    res.send(imageUrl);
  } catch (error) {
    res.status(400).send({error: 'bad request'});
  }
};

exports.updateCourseInfo = async (req, res, next) => {
  try {
    const { title, description, isPublic } = req.body;
    const result = await Course.findByIdAndUpdate(
      req.params.courseId,
      {
        title,
        description,
        ispublic: isPublic
      }
    );

    res.send(result);
  } catch (error) {
    res.status(400).send({error: 'bad request'});
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const result = await Course.findByIdAndRemove(req.params.courseId);

    res.send(result);
  } catch (error) {
    res.status(400).send({error: 'bad request'});
  }
};
