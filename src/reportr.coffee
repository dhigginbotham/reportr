_ = require "underscore"
mongo = require "./connection"
fs = require "fs"
path = require "path"

reportr = (opts) ->

  # path to url prefix
  @path = "/reports"

  # give template for JSON/HTML/PDF/CSV etc files
  @type = "json"

  @mongo = {}

  @template = path.join __dirname, "..", "templates"

  @key = "__reportr"

  @locals = true

  if opts? then _.extend @, opts

  # load in our mongo, so we can play with it
  @mongo = new mongo @mongo

  self = @

  @middlr = (req, res, next) ->
    # define collection, query params
    collection = req.params.collection
    query = req.query

    # findByCollection
    self.mongo.findByCollection collection, query, (err, docs) ->
      return if err? then next err, null

      if docs?
        if self.locals == true then res.locals[self.key] = docs
        req[self.key] = docs
        next()
      else
        next()

  @switchr = (req, res) ->

    # continue our scope so we don't have to init
    # with .apply()

    type = self.type.toLowerCase()

    switch type

      when "html"
        res.render
      when "csv"
        res.render
      when "pdf"
        res.render
      else
        res.send req[self.key]
    
  # return scope
  @

reportr::mount = (app) ->
  self = @

  self.mongo.connect (err, mon) ->

    app.get self.path + "/:collection", self.middlr, self.switchr

    # countByCollection
    app.get self.path + "/:collection/count", (req, res) ->

      # define our collection
      collection = req.params.collection

      mon.countByCollection collection, (err, count) ->
        return if err? then res.json err else res.json count

module.exports = reportr