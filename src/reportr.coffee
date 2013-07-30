_ = require "underscore"

mongo = require "./connection"

reportr = (opts) ->

  # path to url prefix
  @path = "/reports/view"

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

  self.mongo.connect (err, db) ->

    app.get self.path + "/:collection", (req, res) ->

      collection = req.params.collection
      query = req.query

      db.collection(collection).find(query).toArray (err, docs) ->
        json = _.extend {}, docs, length: docs.length
        res.send json

module.exports = reportr