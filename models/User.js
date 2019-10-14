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
