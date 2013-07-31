/* fire up this test bay */

var expect = require('expect.js');
var request = require('request');
var report = require('../lib');

var express = require('express');
var app = express();

var server = require('http').createServer(app);


/* Internal testing vars, aka magic values */

// gives you access to changing the port for your
// test express app
var EXPRESS_PORT = 1338;

var MAX_DONE_DELAY = 500;
var TIMEOUT_DONE_DELAY = 75;

var APP_PATH = 'http://127.0.0.1' + ':' + EXPRESS_PORT;

// if you need to use an external db
var MONGODB_URI = null;
var MONGOOSE_TEST_COLLECTION = "system.indexes"

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

var router = {}
router.external = [];
router.internal = [];

/* Define reportr & options */
describe('REPORTR ::', function () {

  var reportr = new report(TEST_OPTIONS);

  describe('Mounting application routes to express `app`', function () {

    it('should have access to `reportr.mount(app);`', function (done) {
      
      expect(reportr).not.to.be(null);
      
      expect(app).not.to.be(null);

      reportr.mount(app);

      done();

    });

    it('should be full of values', function (done) {

      expect(reportr.hasOwnProperty('path')).to.be(true);
      
      expect(reportr.hasOwnProperty('_routes')).to.be(true);
      
      expect(reportr.hasOwnProperty('mongo')).to.be(true);
      
      expect(reportr.hasOwnProperty('key')).to.be(true);

      expect(reportr.path.length).to.be.above(0);
      
      done();

    });

  });


  describe('Initializing express options on ' + EXPRESS_PORT, function () {

    it('should have value from `app.get(\'port\');`', function (done) {

      server.listen(app.get('port'), function () {

        expect(app.get('port')).to.equal(EXPRESS_PORT);

        done();

      });

    });

    it('should have added the routes included w/ reportr', function (done) {

        expect(app.routes.get.length).to.be.within(3, 1e5);
        
        done();

    });

    it('should be able to locate our internal routes', function (done) {

      this.timeout(MAX_DONE_DELAY);

      var routes = Object.keys(reportr._routes);

      for (var i = 0;i<routes.length;++i) {
        router.internal.push(reportr._routes[routes[i]]);
      };

      expect(router.internal).to.have.length(3);

      setTimeout(done, TIMEOUT_DONE_DELAY);

    });

    it('should also be able to locate our internal routes mapped to express', function (done) {

      this.timeout(MAX_DONE_DELAY);

      var expressRoutes = app.routes.get

      for (key in expressRoutes) {

        router.external.push(expressRoutes[key]['path']);

      };

      expect(router.external).to.have.length(3);

      setTimeout(done, TIMEOUT_DONE_DELAY);


    });

    it('should also be able to match our routes we\'ve mapped to express as well', function (done) {

      this.timeout(MAX_DONE_DELAY);

        for(var i=0;i<router.external.length;++i) {

          var matchRoutes = router.external.indexOf(router.internal[i]) != -1;

          expect(matchRoutes).to.be(true);

        };

        // done();
        setTimeout(done, TIMEOUT_DONE_DELAY);

    });

  });

  describe('Use `request` to find our routes', function () {

    it('should return our ' +  MONGOOSE_TEST_COLLECTION, function (done) {

      request.get(APP_PATH + '/api/' + MONGOOSE_TEST_COLLECTION + '', function (err, resp, body) {
      
        expect(body).not.to.be(null);
        expect(body).not.to.be(undefined);
        
        done();
      
      });

    });

    it('should return the count of ' +  MONGOOSE_TEST_COLLECTION, function (done) {

      request.get(APP_PATH + '/api/' + MONGOOSE_TEST_COLLECTION + '/count', function (err, resp, body) {
      
        expect(body).not.to.be(null);
        expect(body).not.to.be(undefined);
        
        done();
      
      });

    });

    it('should sort ' + MONGOOSE_TEST_COLLECTION + ' by name in ascending order', function (done) {

      request.get(APP_PATH + '/api/' + MONGOOSE_TEST_COLLECTION + '/sort?order=+name', function (err, resp, body) {
      
        expect(body).not.to.be(null);
        expect(body).not.to.be(undefined);
        
        done();
      
      });

    });

    it('should sort ' + MONGOOSE_TEST_COLLECTION + ' by name in descending order', function (done) {

      request.get(APP_PATH + '/api/' + MONGOOSE_TEST_COLLECTION + '/sort?order=-name', function (err, resp, body) {
      
        expect(body).not.to.be(null);
        expect(body).not.to.be(undefined);

        done();
      
      });

    });

  });

});
