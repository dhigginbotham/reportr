(function() {
  var mongo, reportr, _;

  _ = require("underscore");

  mongo = require("./connection");

  reportr = function(opts) {
    var _type;
    this.path = "/reports/view";
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
    return self.mongo.connect(function(err, db) {
      return app.get(self.path + "/:collection", function(req, res) {
        var collection, query;
        collection = req.params.collection;
        query = req.query;
        return db.collection(collection).find(query).toArray(function(err, docs) {
          var json;
          json = _.extend({}, docs, {
            length: docs.length
          });
          return res.send(json);
        });
      });
    });
  };

  module.exports = reportr;

}).call(this);
