_ = require "underscore"

mongo = require "./connection"

reportr = (opts) ->

  # path to url prefix
  @path = "/reports/view"

  # give template for JSON/HTML/PDF/CSV etc files
  @template = "JSON"

  @mongo = {}

  if opts? then _.extend @, opts

  # load in our mongo, so we can play with it
  @mongo = new mongo @mongo

  # return scope
  @

reportr::mount = (app) ->
  self = @

  app.get self.path + "/:collection", (req, res) ->

    self.mongo.connect req.params.collection, (err, docs) ->
      res.send docs

module.exports = reportr