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

      col = req.params.collection
      db.collection(col).find({}).toArray (err, docs) ->
        res.send docs

module.exports = reportr