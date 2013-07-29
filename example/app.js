var express = require('express');
var app = express();
var server = require('http').createServer(app);

// require our reportr module
var reportr = require('../lib');

// define a port for our application
app.set('port', 1337);

// make options for reportr

var reportr_opts = {}

reports = new reportr(reportr_opts);

reports.mount(app);

server.listen(app.get('port'), function() {
  console.log('server starting on %s', app.get('port'));
});