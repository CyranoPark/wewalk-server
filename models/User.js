const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
  social_service: {
    type: String,
    enum: ['FACEBOOK'],
  },
  social_id: {
    type: Number,
    required: true
  },
  profile_img_url: {
    type: String,
    default: 'https://wewalktest.s3.ap-northeast-2.amazonaws.com/129-512.png'
    // Match:
  },
  name: {
    type: String,
    trim: true,
    required: true
  }
}, { timestamps: true });

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);
