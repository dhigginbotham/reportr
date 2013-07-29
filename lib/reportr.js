(function() {
  var mongo, reportr, _;

  _ = require("underscore");

  mongo = require("./connection");

  reportr = function(opts) {
    this.path = "/reports/view";
    this.template = "JSON";
    this.mongo = {};
    if (opts != null) {
      _.extend(this, opts);
    }
    this.mongo = new mongo(this.mongo);
    return this;
  };

  reportr.prototype.mount = function(app) {
    var self;
    self = this;
    return app.get(self.path + "/:collection", function(req, res) {
      return self.mongo.connect(req.params.collection, function(err, docs) {
        return res.send(docs);
      });
    });
  };

  module.exports = reportr;

}).call(this);
