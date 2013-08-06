## REPORTR

Expect this to be completely unstable.

Have you ever needed a way to display your mongodb databases to your boss, or your client, or just pull some stupid reports so you can look cool? Well, I'm trying to achieve that with this module.. Currently, I am going to have this work as an API w/ renderable views for: `CSV`, `PDF`, `HTML w/ Jade` and currently defaults to a restful `JSON` router

### EXAMPLE
```js
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
    database: "test"
     // you can pass ip, port, and 
     // database or skip that and pass uri: mongodb... etc
  },
  path: "/"
};

reports = new reportr(reportr_opts);

reports.mount(app);

server.listen(app.get('port'), function() {
  console.log('REPORTR ::.-^-.:: example server starting on %s', app.get('port'));
});
```

### MONGODB SETTINGS
```js
var options = {
  mongo: {
    ip: "127.0.0.1", // pass a string ip/url
    port: "27017", // pass a string for the port
    database: "test", // pass a string for your database
    user: "user", // pass a string for your database username
    pass: "pass", // pass a string for your database password
    query: "?w=1", // pass a string for your database querystring
    // alternatively you can pass a `uri` string ie:
    uri: "mongodb://user:pass@127.0.0.1:27017/test"
  }
};
```

### OPTIONS
Option | Default | Info
--- | --- | ---
**path** | `./reports` | select your route path
**key** | `reportr` | key name for the internal `req` object
**indexes** | `true` | allows access for `system.indexes` to be viewed
**client** | `./client` | set path for backbone.js application files
**template** | `./template` | set path for template files
**viewable** | `[]` | select collections in database to be publically viewable
**mongo** | `Object` | options to pass to mongodb, creates a new connection stream so it is recommended you use this locally or on a separate instance 
**mongo.ip** | `127.0.0.1` | select the mongodb ip or url
**mongo.port** | `27017` | mongodb port
**mongo.database** | `test` | mongodb database 
**mongo.user** | `null` | username to login with 
**mongo.pass** | `null` | passwork to login with
**mongo.query** | `null` | query, if required you can pass this in
**mongo.uri** | `mongodb://127.0.0.1:27017/test` | builds from ip, port, database, user, pass *note, if you just add `uri` it'll use that so you don't have to create all the options

### FORMATS

- `html or jade` - displays html output of db request
- `json or api` - displays json output of db request


### QUERY SUPPORT
```md
GET ~/path/:format/:collection
GET ~/path/:format/:collection?key=val
GET ~/path/:format/:collection/count
```

### TODO
- Build `csv` w/ either node-csv or maybe use the mongoexport through childprocess, not sure the path best suited for this task yet... probably some csv streaming
- Create `pdf` output
- Give us some SPA lovin' w/ backbone.js fun..

## MIT
```md
The MIT License (MIT)

Copyright (c) 2013 David Higginbotham 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```