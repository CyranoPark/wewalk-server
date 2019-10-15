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
    console.log(error.message)
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

    res.status(200).send(targetCourse);
  } catch (error) {
    console.log(error.message)
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
      cb(null, file.originalname);
    }
  })
})

exports.sendFileLocation = (req, res, next) => {
  res.send({ imageUrl: req.file.location });
};

exports.updateLocationImage = async (req, res, next) => {
  try {
    console.log(req.body)
    const { location, imageUrl } = req.body;
    const imageData = {
      image_url: imageUrl,
      coordinate: location
    };
    console.log(imageData);
    const result = await Course.findById(req.params.courseId);

    result.images_by_location.push(imageData);
    await result.save()

    res.send({ result, imageUrl });
  } catch (error) {
    res.status(400).send({error: 'bad request'});
  }
};

/*
{
	user_id,
	path: [lat,lon],
	start_location: [lat,lon],
	distance: 0,
	elevation: 0,
	thumbnail: img_url,
	images_by_location: {
		img_url: img_url,
		coordinate: [lat,lon],
		comment: ''
	}
}

  title: {
		type: String
	},
	description: {
		type: String
	},
	created_by: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	path: [{
    type: [ Number ],
    required: true
  }],
	start_location: {
		type: [ Number ],
		required: true
	},
	distance: {
		type: Number,
		required: true
	},
	elevation: {
		type: Number,
		required: true
	},
	thumbnail: {
		type: String,
		required: true,
		default: 'https://wewalktest.s3.ap-northeast-2.amazonaws.com/129-512.png'
	},
	images_by_location: [{
		img_url: { type: String },
		coordinate: { type: [ Number ]},
		comment: { type: String }
  }]
  
*/

