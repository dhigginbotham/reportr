(function() {
  var MongoClient, ObjectID, format, mongo, _;

  _ = require("underscore");

  MongoClient = require("mongodb").MongoClient;

  ObjectID = require("mongodb").ObjectID;

  format = require("util").format;

  mongo = function(opts, fn) {
    var self;
    this.ip = "127.0.0.1";
    this.port = "27017";
    this.database = "test";
    this.query = null;
    this.user = null;
    this.pass = null;
    this.uri = null;
    if (opts != null) {
      _.extend(this, opts);
    }
    this.auth = (this.user != null) && (this.pass != null) ? "" + this.user + ":" + this.pass + "@" : null;
    if (this.uri != null) {
      this.port = this.ip = this.database = this.query = this.uri;
    }
    if (this.uri == null) {
      this.uri = "mongodb://" + (this.auth != null ? this.auth : "") + this.ip + ":" + this.port + "/" + this.database + (this.query != null ? this.query : "");
    }
    self = this;
    return MongoClient.connect(self.uri, function(err, db) {
      if (err != null) {
        return fn(err, null);
      }
      db.collectionNames(function(err, collections) {
        return self.collections = collections;
      });
      console.log("REPORTR ::.-^-.:: connected to " + self.uri);
      self.db = db != null ? db : null;
      if (db != null) {
        return fn(null, self);
      } else {
        return fn(null, null);
      }
    });
  };

  mongo.prototype.findByCollection = function(collection, query, fn) {
    var self;
    self = this;
    collection = this.db.collection(collection);
    console.assert(query !== null, "query is returning null into findByCollection");
    return self.querySelector(query, function(err, sanitized) {
      if (err != null) {
        return fn(err, null);
      }
      console.assert(sanitized !== null, "querySelector is returning null");
      return collection.find(sanitized).toArray(function(err, docs) {
        if (err != null) {
          return fn(err, null);
        }
        if (docs.length === 0) {
          return fn({
            error: "Sorry, no documents were found.."
          }, null);
        }
        if (docs != null) {
          return fn(null, docs);
        }
      });
    });
  };

  mongo.prototype.countByCollection = function(collection, fn) {
    collection = this.db.collection(collection);
    return collection.count(function(err, count) {
      if (err != null) {
        return fn(err, null);
      }
      if (count != null) {
        return fn(null, {
          count: count
        });
      }
    });
  };

  mongo.prototype.sortCollection = function(collection, query, sorted, fn) {
    var cleanSort, order, s, self, sortArr, _i, _len, _s;
    self = this;
    cleanSort = [];
    if (sorted.indexOf(",") !== -1) {
      sortArr = sorted.split(",");
      for (_i = 0, _len = sortArr.length; _i < _len; _i++) {
        s = sortArr[_i];
        order = s[0];
        _s = s.substr(1, s.length - 1);
        if (order === "-") {
          cleanSort.push([_s, 'descending']);
        } else {
          cleanSort.push([_s, 'ascending']);
        }
      }
    } else {
      order = sorted[0];
      _s = sorted.substr(1, sorted.length - 1);
      if (order === "-") {
        cleanSort.push([_s, 'descending']);
      } else {
        cleanSort.push([_s, 'ascending']);
      }
    }
    collection = this.db.collection(collection);
    console.assert(query !== null, "query is returning null into sortCollection");
    return self.querySelector(query, function(err, sanitized) {
      if (err != null) {
        return fn(err, null);
      }
      console.assert(sanitized !== null, "querySelector is returning null");
      return collection.find(sanitized).sort(cleanSort).toArray(function(err, count) {
        if (err != null) {
          return fn(err, null);
        }
        if (count != null) {
          return fn(null, {
            count: count
          });
        }
      });
    });
  };

  mongo.prototype.querySelector = function(qs, fn) {
    var key, privates, query, value;
    privates = ['skip', 'limit', 'append', 'order'];
    query = {};
    for (key in qs) {
      value = qs[key];
      if (privates.indexOf(key) === -1 && value.length > 0) {
        query[key] = value;
      }
    }
    console.assert(typeof query['order'] === "undefined", "we should never see query or");
    return fn(null, query);
  };

  module.exports = mongo;

}).call(this);
