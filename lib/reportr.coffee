_ = require "underscore"

mongo = require "./connection"

reportr = (opts) ->

  # path to url prefix
  @path = "/reports/view"

  # db url
  @mongodb = null

  # give template for HTML/PDF/CSV etc files
  @template = null

  @mongo = {}

  if opts? then _.extend @, opts

  # load in our mongo, so we can play with it
  @mongo = new mongo @mongo

  # return scope
  @

reportr::rendr = (query) ->

  self = @

  q = if query? then query else {}

  self.mongo.connect (err, db) ->
     return if err? then fn err, null

     db.collection.find(q).toArray (err, docs) ->
        return if err? then fn err, null

        if docs? then console.log docs

        
module.exports = reportr
