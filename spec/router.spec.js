require('dotenv').config();
const chaiHttp = require('chai-http');
const chai = require('chai');
const app = require('../app');

chai.use(chaiHttp);
const expect = chai.expect;

describe('With mongoDB database', function() {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.TEST_MONGODB_SERVER_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }
  );
  const db = mongoose.connection;

  describe('POST /auth/login/facebook', () => {
    const userData = {
      socialService: 'FACEBOOK',
      socialId: 100976041333538,
      userName: 'Jackson',
      profileImage: 'image',
      socialToken: 'fbToken'
    };

    it('should generate token to invalid user', done => {
      chai.request(app)
        .post('/auth/login/facebook')
        .send({...userData})
        .end((err, res) => {
          if (err) return done(err);
          expect(Boolean(res.headers.usertoken)).to.equal(true);
          done();
        });
    });

    it('should find or Create user', done => {
      userData.socialId = 129649165110470;
      userData.Name = 'gray';
      userData.socialToken = 'test Token';

      chai.request(app)
        .post('/auth/login/facebook')
        .send({...userData})
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.result).to.equal('ok');
          done();
        });
    });
  });

  describe('Course controller', () => {
    const Course = require('../models/Course');
    const mockCourses = require('./course.json');
    let storedCourses;

    const storeMockCourses = async () => {
      for (let i = 0; i < mockCourses.length; i++) {
        await new Course(mockCourses[i]).save();
      }
    };

    const fetchAllCourses = async () => {
      storeMockCourses().then(() => {
        Course.find().lean().exec(function (err, courses) {
          storedCourses = JSON.parse(JSON.stringify(courses));
        });
      });
    };

    const deleteAllCourses = async () => {
      Course.deleteMany({}, function (err) {
        storedCourses = null;
      });
    };

    const userData = {
      socialService: 'FACEBOOK',
      socialId: 100976041333538,
      userName: 'Jackson',
      profileImage: 'image',
      socialToken: 'fbToken'
    };

    const mockQuery = {
      pageNo: 1,
      pageSize: 2,
      lat: 37.5060263,
      lon: 127.0591757
    };

    let userToken = '';

    beforeEach(done => {
      fetchAllCourses().then(() => {
        done();
      });
    });

    afterEach(done => {
      deleteAllCourses().then(() => done());
    });


    describe('GET /feeds', () => {
      const agent = chai.request.agent(app);
      it('should get courses', done => {
        agent
          .post('/auth/login/facebook')
          .send({...userData})
          .end((err, res) => {
            userToken = res.headers.usertoken;
            return agent
              .get('/feeds')
              .query({...mockQuery})
              .set('usertoken', 'Bearer ' + userToken)
              .then((res) => {
                expect(res.body.length).to.equal(2);
                expect(res).to.have.status(200);
                // expect(res.courses.length).to.equal(5);
                done();
                agent.close();
              });
          });
      });
    });

    describe('POST /course/new', () => {
      const startLocation = {
        type: 'Point',
        coordinates: [127.0591757, 37.5060263],
        address: '1012-111 Daechi 2(i)-dong, Gangnam-gu, Seoul, South Korea',
        timestamp: '2019-10-23T11:00:21.392Z'
      };

      it('should post my course', done => {
        const agent = chai.request.agent(app);
        agent
          .post('/auth/login/facebook')
          .send({...userData})
          .end((err, res) => {
            userToken = res.headers.usertoken;
            return agent
              .post('/course/new')
              .send({ startLocation })
              .set('usertoken', 'Bearer ' + userToken)
              .then((res) => {
                expect(res.body.start_location.type).to.equal('Point');
                expect(res.body.start_location.coordinates[0]).to.equal(127.0591757);
                expect(res).to.have.status(200);
                done();
                agent.close();
              });
          });
      });

      it('should get my courses', done => {
        const agent = chai.request.agent(app);
        agent
          .post('/auth/login/facebook')
          .send({...userData})
          .end((err, res) => {
            userToken = res.headers.usertoken;
            return agent
              .post('/course/new')
              .send({ startLocation })
              .set('usertoken', 'Bearer ' + userToken)
              .end((err, res) => {
                return agent
                  .get('/mycourses')
                  .set('usertoken', 'Bearer ' + userToken)
                  .then((res) => {
                    expect(res.body.length).to.equal(1);
                    expect(res.body[0].created_by.social_id).to.equal(userData.socialId);
                    expect(res).to.have.status(200);
                    done();
                  });
              });
          });
      });

      it('should update my courses', done => {
        const agent = chai.request.agent(app);
        const mockInfo = {
          title : 'test',
          description: 'test_description',
          isPublic: true
        };

        agent
          .post('/auth/login/facebook')
          .send({...userData})
          .end((err, res) => {
            userToken = res.headers.usertoken;
            return agent
              .post('/course/new')
              .send({ startLocation })
              .set('usertoken', 'Bearer ' + userToken)
              .end((err, res) => {
                const courseId = res.body._id;
                return agent
                  .put(`/course/${courseId}/info`)
                  .send({ ...mockInfo })
                  .set('usertoken', 'Bearer ' + userToken)
                  .then((res) => {
                    expect(res.body.result).to.equal('ok');
                    expect(res).to.have.status(200);
                    done();
                  });
              });
          });
      });

      it('should delete my courses', done => {
        const agent = chai.request.agent(app);
        agent
          .post('/auth/login/facebook')
          .send({...userData})
          .end((err, res) => {
            userToken = res.headers.usertoken;
            return agent
              .post('/course/new')
              .send({ startLocation })
              .set('usertoken', 'Bearer ' + userToken)
              .end((err, res) => {
                const courseId = res.body._id;
                return agent
                  .delete(`/course/${courseId}`)
                  .set('usertoken', 'Bearer ' + userToken)
                  .then((res) => {
                    expect(res.body.result).to.equal('ok');
                    expect(res).to.have.status(200);
                    done();
                  });
              });
          });
      });
    });
  });
});
