var express = require('express');
var app = express();
var server = require('http').createServer(app);

// require our reportr module
var reportr = require('../lib');

// define a port for our application
app.set('port', 1337);
// make options for reportr
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.logger('dev'));
app.use(express.errorHandler());

var reportr_opts = {
  mongo: {
    database: "mgive"
     // you can pass ip, port, and 
     // database or skip that and pass uri: mongodb... etc
  },
  path: "/reports",
  type: "html"
};

reports = new reportr(reportr_opts);

reports.mount(app);

server.listen(app.get('port'), function() {
  console.log('REPORTR ::.-^-.:: example server starting on %s', app.get('port'));
});