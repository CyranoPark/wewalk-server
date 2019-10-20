const jwt = require('jsonwebtoken');
const User = require('../../models/User');

exports.findOrCreateUser = async (req, res, next) => {
  try {
    const { socialService, socialId, userName, profileImage } = req.body;
    await User.findOrCreate(
      {
        social_service: socialService,
        social_id: socialId
      },
      {
        social_service: socialService,
        social_id: socialId,
        profile_img_url: profileImage,
        name: userName
      }
    );

    next();
  } catch (error) {
    res.status(400).send({error: 'login failed'});
  }
};

exports.createToken = async (req, res, next) => {
  try {
    const { socialId, socialToken } = req.body;

    const payload = {
      socialToken,
      socialId
    };
    const token = await jwt.sign(payload, process.env.TOKEN_SECRET_KEY, {
      expiresIn: 24 * 60 * 60
    });
    console.log(token)
    res.set({'USERTOKEN': token}).send({result: 'ok'});
  } catch (error) {
    res.status(400).send({error: 'login failed'});
  }
};

exports.verifyToken = async (req, res, next) => {
  return next();
  try {
    const userToken = req.headers.usertoken.split('Bearer ')[1];
    const socialId = req.headers.socialid;
    const decoded = await jwt.verify(userToken, process.env.TOKEN_SECRET_KEY);
    const currentUser = await User.findOne({social_id : decoded.socialId});
    if (currentUser.social_id !== Number(socialId)) {
      throw new Error();
    }

    next();
  } catch (error) {
    res.status(402).send({error: 'unauthorized'});
  }
};

exports.logout = async (req, res, next) => {
  console.log('logout')
  res.status(200).send({ result: 'ok' });
};
