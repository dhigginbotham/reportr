_ = require "underscore"

mongo = require "./connection"

reportr = (opts) ->

  # path to url prefix
  @path = "/reports"

  # give template for JSON/HTML/PDF/CSV etc files
  @type = "json"

  @mongo = {}

  if opts? then _.extend @, opts

  _type = @type.toLowerCase()
  @type = _type

  # load in our mongo, so we can play with it
  @mongo = new mongo @mongo

  # return scope
  @

reportr::mount = (app) ->
  self = @

  self.mongo.connect (err, mon) ->

    # findByCollection
    app.get self.path + "/:collection", (req, res) ->

      # define collection, query params
      collection = req.params.collection
      query = req.query

      mon.findByCollection collection, query, (err, docs) ->
        res.json docs

    # countByCollection
    app.get self.path + "/:collection/count", (req, res) ->

      # define our collection
      collection = req.params.collection

      mon.countByCollection collection, (err, count) ->
        res.json count

reportr::switchr = ->

  self = @

module.exports = reportr