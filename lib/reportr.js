(function() {
  var mongo, reportr, _;

  _ = require("underscore");

  mongo = require("./connection");

  reportr = function(opts) {
    var _type;
    this.path = "/reports";
    this.type = "json";
    this.mongo = {};
    if (opts != null) {
      _.extend(this, opts);
    }
    _type = this.type.toLowerCase();
    this.type = _type;
    this.mongo = new mongo(this.mongo);
    return this;
  };

  reportr.prototype.mount = function(app) {
    var self;
    self = this;
    return self.mongo.connect(function(err, mon) {
      app.get(self.path + "/:collection", function(req, res) {
        var collection, query;
        collection = req.params.collection;
        query = req.query;
        return mon.findByCollection(collection, query, function(err, docs) {
          return res.json(docs);
        });
      });
      return app.get(self.path + "/:collection/count", function(req, res) {
        var collection;
        collection = req.params.collection;
        return mon.countByCollection(collection, function(err, count) {
          return res.json(count);
        });
      });
    });
  };

  reportr.prototype.switchr = function() {
    var self;
    return self = this;
  };

  module.exports = reportr;

}).call(this);
