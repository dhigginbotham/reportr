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
    this.views = path.join(__dirname, "..", "views");
    this.engine = "jade";
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
    this.findMiddleware = function(req, res, next) {
      var collection, query;
      collection = req.params.collection;
      query = req.query;
      return self.mongo.findByCollection(collection, query, function(err, docs) {
        if (err != null) {
          return next(err, null);
        }
        if (docs != null) {
          if (self.locals === true) {
            res.locals.type = collection;
          }
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
    this.actionsMiddleware = function(req, res, next) {
      var collection;
      collection = req.params.collection;
      if (req.params.action === "count") {
        return self.mongo.countByCollection(collection, function(err, count) {
          if (err != null) {
            return next(err, null);
          }
          if (count != null) {
            if (self.locals === true) {
              res.locals.type = collection;
            }
            if (self.locals === true) {
              req[self.key] = res.locals[self.key] = count;
            } else {
              req[self.key] = count;
            }
            return next();
          } else {
            return next();
          }
        });
      }
    };
    this.endpoint = function(req, res) {
      var type;
      type = self.type.toLowerCase();
      switch (type) {
        case "html":
          return res.render("pages/default");
        case "csv":
          return res.render("pages/csv");
        case "pdf":
          return res.render("pages/pdf");
        case "json":
          if (_.isObject(req[self.key])) {
            return res.json(req[self.key]);
          } else {
            return res.send(req[self.key]);
          }
      }
    };
    return this;
  };

  reportr.prototype.mount = function(app) {
    var self;
    self = this;
    app.set("views", self.views);
    app.set("view engine", self.engine);
    app.get(self.path, function(req, res) {
      return res.send(self.mongo.collections);
    });
    app.get(self.path + "/:collection", self.findMiddleware, self.endpoint);
    return app.get(self.path + "/:collection/:action", self.actionsMiddleware, self.endpoint);
  };

  module.exports = reportr;

}).call(this);
