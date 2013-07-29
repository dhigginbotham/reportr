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
        var col;
        col = req.params.collection;
        return db.collection(col).find({}).toArray(function(err, docs) {
          return res.send(docs);
        });
      });
    });
  };

  module.exports = reportr;

}).call(this);
