/* Internal testing vars, aka magic values */

// gives you access to changing the port for your
// test express app
EXPRESS_PORT = 1338

// if you need to use an external db
MONGODB_URI = null

TEST_OPTIONS = {
  path: "",
  mongo: {
    database: "mgive"
  }
};

// give an easier way to pipe in an external db
if (MONGODB_URI != null) {
  TEST_OPTIONS.mongo.uri = MONGODB_URI
}

/* fire up this test bay */

var expect = require('expect.js');
var request = require('request');

var express = require('express');
var app = express();

var server = require('http').createServer(app);

app.set('port', EXPRESS_PORT);

/* Define reportr & options */

var report = require('../lib');

var reportr = new report(TEST_OPTIONS);

var router = {}
router.external = [];
router.internal = [];

describe('mounting reportr to express application', function () {

  it('should have access to app', function (done) {
    
    expect(reportr).not.to.be(null);
    
    expect(app).not.to.be(null);

    reportr.mount(app);

    return done();

  });

});

describe('mounting server listener to our application port', function () {

  it('should be able to listen on our port', function (done) {

    server.listen(app.get('port'), function () {

      expect(app.get('port')).to.equal(EXPRESS_PORT);

      return done();

    });

  });

  it('should have at least 3 routes', function (done) {

      expect(app.routes.get.length).to.be.within(3, 1e5);
      
      return done();

  });

  it('should also be able to locate our 3 internal routes', function (done) {

    var routes = Object.keys(reportr._routes);

    for (var i = 0;i<routes.length;++i) {
      router.internal.push(reportr._routes[routes[i]]);
    };

    expect(router.internal).to.have.length(3);

    return done();

  });

  it('should also be able to locate our routes mapped to express', function (done) {

    var expressRoutes = app.routes.get

    for (key in expressRoutes) {
      router.external.push(expressRoutes[key]['path']);
    };

    expect(router.external).to.have.length(3);

    return done();

  });

  it('should also be able to match our routes we\'ve mapped to express as well', function (done) {

    for(var i=0;i<router.external.length;++i) {

      matchRoutes = router.external.indexOf(router.internal[i]) != -1;

      expect(matchRoutes).to.be(true);

    };

    return done();

  });

});