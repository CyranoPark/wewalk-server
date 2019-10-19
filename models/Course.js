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
		type: {
			type: String,
			default: 'Point'
		},
		coordinates: {
			type: [Number],
			required: true
		},
		timestamp : {
			type: Date,
			required: true
		},
		_id: false
	}],
	start_location: {
		type: {
			type: String,
			default: 'Point'
		},
		coordinates: {
			type: [Number],
			required: true
		},
		timestamp : {
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
		image_url: String,
		location: {
			type: {
				type: String,
				default: 'Point'
			},
			coordinates: {
				type: [Number],
				required: true
			},
			timestamp : Date
		},
		_id: false
	}]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
