(function() {
  var fs, jade, mongo, path, reportr, router, _;

  _ = require("underscore");

  mongo = require("./connection");

  router = require("./router");

  fs = require("fs");

  path = require("path");

  jade = require("jade");

  reportr = function(opts) {
    var self, template;
    this.path = "/reports";
    this.mongo = {};
    this.client = template = path.join(__dirname, "..", "client");
    this.template = path.join(__dirname, "..", "templates", "default.jade");
    this.key = "reportr";
    this.indexes = true;
    this.viewable = [];
    if (opts != null) {
      _.extend(this, opts);
    }
    if (this.indexes === true) {
      this.viewable.push("system.indexes");
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
    this.isCollectionViewable = function(req, res, next) {
      var collection;
      if (req.params.hasOwnProperty('collection')) {
        collection = req.params.collection;
        if (self.viewable.indexOf(collection) !== -1) {
          return next(null, true);
        } else {
          return next(JSON.stringify({
            error: "Invalid collection please try again."
          }), false);
        }
      } else {
        return next(JSON.stringify({
          error: "Invalid collection please try again."
        }), null);
      }
    };
    this.buildRoutePaths = function(route, fn) {
      var i, index, routed, routes, _i;
      routes = [":base", ":format", ":collection", ":action"];
      index = routes.indexOf(route);
      if (index >= 0 && index < routes.length) {
        routed = "";
        for (i = _i = 0; 0 <= index ? _i <= index : _i >= index; i = 0 <= index ? ++_i : --_i) {
          if (routes[i] === ":base") {
            routes[i] = "";
          }
          routed += routes[i] + (routes.length > i + 1 ? "/" : "");
        }
        if (routed.length > 1 && routed[routed.length - 1] === "/") {
          routed = routed.substr(0, routed.length - 1);
        }
        return fn(null, routed);
      } else {
        return fn(null, null);
      }
    };
    this.routeSwitch = function(req, res) {
      var type;
      type = req.params.format;
      switch (type) {
        case "html":
          return self.jade(req, res);
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
    var html, options, render, self, template;
    self = this;
    res.locals.navigation = self.viewable;
    template = fs.readFileSync(self.template, "utf8");
    options = {
      pretty: true
    };
    render = jade.compile(template, options);
    html = render(res.locals);
    return res.send(html);
  };

  reportr.prototype.mount = function(connect, app) {
    var self;
    self = this;
    app.use(connect["static"](self.client));
    self.buildRoutePaths(":base", function(err, base) {
      return app.get(base, function(req, res) {
        return res.redirect(base + "api/system.indexes");
      });
    });
    self.buildRoutePaths(":collection", function(err, collection) {
      return app.get(collection, self.isCollectionViewable, self.findMiddleware, self.routeSwitch);
    });
    return self.buildRoutePaths(":action", function(err, action) {
      return app.get(action, self.isCollectionViewable, self.actionsMiddleware, self.routeSwitch);
    });
  };

  module.exports = reportr;

}).call(this);
