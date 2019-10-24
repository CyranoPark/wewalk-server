if (process.env.NODE_ENV === 'dev') {
  require('dotenv').config();
}

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const logger = require('morgan');

const authRouter = require('./routes/auth');
const courseRouter = require('./routes/course');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_SERVER_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

const db = mongoose.connection;
db.on('error', (err) => {
  console.log(`Connection error : ${err}`);
});
db.once('open', () => {
  console.log('connected mongo DB');
});

const app = express();
const port = process.env.PORT || '3000';
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/', courseRouter);
app.use('/auth', authRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
