/* fire up this test bay */

var expect = require('expect.js');
var request = require('request');

var express = require('express');
var app = express();

var server = require('http').createServer(app);

/* Internal testing vars, aka magic values */

// gives you access to changing the port for your
// test express app
var EXPRESS_PORT = 1338;

var APP_PATH = 'http://127.0.0.1' + ':' + EXPRESS_PORT;

// if you need to use an external db
var MONGODB_URI = null;

var TEST_OPTIONS = {
  path: '',
  mongo: {
    database: 'mgive'
  }
};

// give an easier way to pipe in an external db
if (MONGODB_URI != null) {
  TEST_OPTIONS.mongo.uri = MONGODB_URI
}

/* config express options */

app.set('port', EXPRESS_PORT);

var report = require('../lib');

var reportr = null

var router = {}
router.external = [];
router.internal = [];

/* Define reportr & options */
describe('including report and building reportr', function () {

  it('should create a new instance of reportr', function (done) {
    reportr = new report(TEST_OPTIONS);
    done();
  });

});

describe('mounting reportr to express application', function () {

  it('should have access to app', function (done) {
    
    expect(reportr).not.to.be(null);
    
    expect(app).not.to.be(null);

    reportr.mount(app);

    done();

  });

  it('reportr should be full of values', function (done) {

    expect(reportr.hasOwnProperty('path')).to.be(true);
    
    expect(reportr.hasOwnProperty('_routes')).to.be(true);
    
    expect(reportr.hasOwnProperty('mongo')).to.be(true);
    
    expect(reportr.hasOwnProperty('key')).to.be(true);

    expect(reportr.path.length).to.be.above(0);
    
    done();

  });

});

describe('mounting server listener to our application port', function () {

  it('should be able to listen on our port', function (done) {

    server.listen(app.get('port'), function () {

      expect(app.get('port')).to.equal(EXPRESS_PORT);

      done();

    });

  });

  it('should have at least 3 routes', function (done) {

      expect(app.routes.get.length).to.be.within(3, 1e5);
      
      done();

  });

  it('should also be able to locate our 3 internal routes', function (done) {

    var routes = Object.keys(reportr._routes);

    for (var i = 0;i<routes.length;++i) {
      router.internal.push(reportr._routes[routes[i]]);
    };

    expect(router.internal).to.have.length(3);

    done();

  });

  it('should also be able to locate our routes mapped to express', function (done) {

    var expressRoutes = app.routes.get

    for (key in expressRoutes) {
      router.external.push(expressRoutes[key]['path']);
    };

    expect(router.external).to.have.length(3);

    done();

  });

  it('should also be able to match our routes we\'ve mapped to express as well', function (done) {

    for(var i=0;i<router.external.length;++i) {

      var matchRoutes = router.external.indexOf(router.internal[i]) != -1;

      expect(matchRoutes).to.be(true);

    };

    done();

  });

});

describe('testing app routes with request', function () {

  
    requestGet = function (url, fn) {

      request.get(url, function (err, resp, body) {
        fn(body);
      });

    };

    it('should be able to access some json from request', function (done) {

      for(var i = 0; i < router.internal.length; ++i) {

        requestGet(APP_PATH + router.internal[i], function (body) {
          expect(body).not.to.be(null);
          done();
        });

      };

    });

});

var delayDone = function (args, done, fn) {

  delayed = function (done) {

    return fn(args, done);

  };

  setTimeout(delayed(done, fn), 1 * 1000);

};