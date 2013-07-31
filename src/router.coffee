### router file to handle our special case routes ###
_ = require "underscore"

routes = {}

routes.default = (req, res) ->
  res.render "pages/default",
  title: "- " + req.params.collection

routes.json = (req, res) ->
  if _.isObject req[self.key] then res.json req[self.key] else res.send req[self.key]

module.exports = routes
