const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
		type: String
	},
	description: {
		type: String
	},
	created_by: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	path: [{
		latitude : {
			type: Number,
			required: true
		},
		longitude : {
			type: Number,
			required: true
		},
		timestamps : {
			type: Date,
			required: true
		},
		_id: false
	}],
	start_location: {
		latitude : {
    type: Number,
    required: true
		},
		longitude : {
		type: Number,
		required: true
		},
		timestamps : {
			type: Date,
			required: true
		}
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
		default: 'https://wewalk.s3.ap-northeast-2.amazonaws.com/course_default.jpg'
	},
	images_by_location: [{
		img_url: { type: String },
		coordinate: { type: [ Number ]},
		_id: false
	}]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
