(function() {
  var fs, jade, mongo, path, reportr, router, _;

  _ = require("underscore");

  mongo = require("./connection");

  router = require("./router");

  fs = require("fs");

  path = require("path");

  jade = require("jade");

  reportr = function(opts) {
    var self;
    this.path = "/reports";
    this.mongo = {};
    this.output = path.join(__dirname, "..", "output");
    this.views = path.join(__dirname, "..", "views");
    this.engine = "jade";
    this.key = "reportr";
    this.indexes = true;
    if (opts != null) {
      _.extend(this, opts);
    }
    self = this;
    if (self.path === "") {
      self.path = "/";
    }
    if (self.path.length > 1 && self.path[0] === "/") {
      self.path += "/";
    }
    this._routes = {};
    this._routes.base = self.path;
    this._routes.collection = self.path + ":format/:collection";
    this._routes.action = self.path + ":format/:collection/:action";
    self.mongo = new mongo(this.mongo, function(err, mongo) {
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
      return self.mongo.findCollection(collection, query, function(err, docs) {
        if (err != null) {
          return next(err, null);
        }
        if (docs != null) {
          res.locals.type = collection;
          req[self.key] = res.locals[self.key] = docs;
          return next();
        } else {
          return next();
        }
      });
    };
    this.actionsMiddleware = function(req, res, next) {
      var action, collection, order, query;
      collection = req.params.collection;
      action = req.params.action;
      query = req.query;
      switch (action) {
        case "count":
          return self.mongo.countCollection(collection, function(err, count) {
            if (err != null) {
              return next(err, null);
            }
            if (count != null) {
              res.locals.type = collection;
              req[self.key] = res.locals[self.key] = count;
              return next();
            } else {
              return next();
            }
          });
        case "sort":
          order = req.query.order;
          if (req.query.hasOwnProperty('order') && order.length > 0) {
            return self.mongo.sortCollection(collection, query, order, function(err, docs) {
              if (err != null) {
                return next(err, null);
              }
              if (docs != null) {
                res.locals.type = collection;
                req[self.key] = res.locals[self.key] = docs;
                return next();
              } else {
                return next();
              }
            });
          } else {
            return next(JSON.stringify({
              error: "You must provide an `order` operator for this method to work properly."
            }), null);
          }
      }
    };
    this.routeSwitch = function(req, res) {
      var type;
      type = req.params.format;
      switch (type) {
        case "jade":
        case "html":
          return self.jade(req, res);
        case "json":
        case "api":
          if (_.isObject(req[self.key] === true)) {
            return res.json(req[self.key]);
          } else {
            return res.send(req[self.key]);
          }
          break;
        default:
          return res.send({
            error: "Unsupported format entered, please check your url"
          });
      }
    };
    return self;
  };

  reportr.prototype.jade = function(req, res, next) {
    var html, options, render, self, template, _template;
    self = this;
    template = path.join(__dirname, "..", "templates", "default.jade");
    _template = fs.readFileSync(template, "utf8");
    options = {
      pretty: true
    };
    render = jade.compile(_template, options);
    html = render(res.locals);
    return res.send(html);
  };

  reportr.prototype.mount = function(app) {
    var self;
    self = this;
    app.get(self._routes.base, function(req, res) {
      return res.redirect(self._routes.base + "api/system.indexes");
    });
    app.get(self._routes.collection, self.findMiddleware, self.routeSwitch);
    return app.get(self._routes.action, self.actionsMiddleware, self.routeSwitch);
  };

  module.exports = reportr;

}).call(this);
