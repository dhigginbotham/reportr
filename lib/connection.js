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

  mongo.prototype.connect = function(collection, fn) {
    var self;
    self = this;
    return MongoClient.connect(self.uri, function(err, db) {
      if (err != null) {
        return fn(err, null);
      }
      if (db != null) {
        self.db = db;
      }
      return db.collection(collection).find({}).toArray(function(err, docs) {
        if (err != null) {
          return fn(err, null);
        } else {
          return fn(null, docs);
        }
      });
    });
  };

  module.exports = mongo;

}).call(this);
