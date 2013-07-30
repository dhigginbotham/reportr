(function() {
  var fs, mongo, path, reportr, _;

  _ = require("underscore");

  mongo = require("./connection");

  fs = require("fs");

  path = require("path");

  reportr = function(opts) {
    var self;
    this.path = "/reports";
    this.type = "json";
    this.mongo = {};
    this.template = path.join(__dirname, "..", "templates");
    this.key = "__reportr";
    this.locals = true;
    if (opts != null) {
      _.extend(this, opts);
    }
    this.mongo = new mongo(this.mongo);
    self = this;
    this.middlr = function(req, res, next) {
      var collection, query;
      collection = req.params.collection;
      query = req.query;
      return self.mongo.findByCollection(collection, query, function(err, docs) {
        if (err != null) {
          return next(err, null);
        }
        if (docs != null) {
          if (self.locals === true) {
            res.locals[self.key] = docs;
          }
          req[self.key] = docs;
          return next();
        } else {
          return next();
        }
      });
    };
    this.switchr = function(req, res) {
      var type;
      type = self.type.toLowerCase();
      switch (type) {
        case "html":
          return res.render;
        case "csv":
          return res.render;
        case "pdf":
          return res.render;
        default:
          return res.send(req[self.key]);
      }
    };
    return this;
  };

  reportr.prototype.mount = function(app) {
    var self;
    self = this;
    return self.mongo.connect(function(err, mon) {
      app.get(self.path + "/:collection", self.middlr, self.switchr);
      return app.get(self.path + "/:collection/count", function(req, res) {
        var collection;
        collection = req.params.collection;
        return mon.countByCollection(collection, function(err, count) {
          if (err != null) {
            return res.json(err);
          } else {
            return res.json(count);
          }
        });
      });
    });
  };

  module.exports = reportr;

}).call(this);
