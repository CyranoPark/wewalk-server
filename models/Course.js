const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
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
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
