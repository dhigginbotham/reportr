### router file to handle our special case routes ###
_ = require "underscore"

routes = {}

routes.html = (req, res) ->
  res.render "pages/default",
  title: "- " + req.params.collection

module.exports = routes
