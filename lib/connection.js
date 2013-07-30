(function() {
  var MongoClient, format, mongo, _;

  _ = require("underscore");

  MongoClient = require("mongodb").MongoClient;

  format = require("util").format;

  mongo = function(opts) {
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
    return this;
  };

  mongo.prototype.connect = function(fn) {
    var self;
    self = this;
    return MongoClient.connect(self.uri, function(err, db) {
      if (err != null) {
        return fn(err, null);
      }
      self.db = db != null ? db : null;
      if (db != null) {
        return fn(null, self);
      } else {
        return fn(null, null);
      }
    });
  };

  mongo.prototype.findByCollection = function(collection, query, fn) {
    collection = this.db.collection(collection);
    return collection.find(query).toArray(function(err, docs) {
      if (err != null) {
        return fn(err, null);
      }
      if (docs != null) {
        return fn(null, docs);
      }
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

  module.exports = mongo;

}).call(this);
