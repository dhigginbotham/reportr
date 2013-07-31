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

  module.exports = routes;

}).call(this);
