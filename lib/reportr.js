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
    this.key = "reportr";
    this.locals = true;
    if (opts != null) {
      _.extend(this, opts);
    }
    self = this;
    mongo = new mongo(this.mongo, function(err, mongo) {
      if (err != null) {
        throw err;
      } else if (mongo != null) {
        return self.mongo = mongo;
      }
    });
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
            req[self.key] = res.locals[self.key] = docs;
          } else {
            req[self.key] = docs;
          }
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
          return res.render("pages/default");
        case "csv":
          return res.render("pages/csv");
        case "pdf":
          return res.render("pages/pdf");
        default:
          return res.send(req[self.key]);
      }
    };
    return this;
  };

  reportr.prototype.mount = function(app) {
    var self, views_path;
    self = this;
    views_path = path.join(__dirname, "..", "views");
    app.set("views", views_path);
    app.set("view engine", "jade");
    app.get(self.path + "/:collection", self.middlr, self.switchr);
    return app.get(self.path + "/:collection/:action", function(req, res) {
      var collection;
      collection = req.params.collection;
      if (req.params.action === "count") {
        return mon.countByCollection(collection, function(err, count) {
          if (err != null) {
            return res.json(err);
          } else {
            return res.json(count);
          }
        });
      }
    });
  };

  module.exports = reportr;

}).call(this);
