/* router file to handle our special case routes*/


(function() {
  var routes, _;

  _ = require("underscore");

  routes = {};

  routes.html = function(req, res) {
    return res.render("pages/default", {
      title: "- " + req.params.collection
    });
  };

  routes.json = function(req, res) {
    if (_.isObject(req[self.key] === true)) {
      return res.json(req[self.key]);
    } else {
      return res.send(req[self.key]);
    }
  };

  module.exports = routes;

}).call(this);
