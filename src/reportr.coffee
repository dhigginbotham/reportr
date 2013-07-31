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

  @key = "reportr"

  @locals = true

  if opts? then _.extend @, opts

  # continue our scope so we don't have to init
  # with .apply()

  self = @

  # load in our mongo, so we can play with it
  mongo = new mongo @mongo, (err, mongo) ->
    return if err? then throw err else if mongo? then self.mongo = mongo

  @middlr = (req, res, next) ->

    # define collection, query params
    collection = req.params.collection
    query = req.query

    # findByCollection
    self.mongo.findByCollection collection, query, (err, docs) ->
      return if err? then next err, null

      if docs?
        if self.locals == true then req[self.key] = res.locals[self.key] = docs 
        else req[self.key] = docs
        
        next()
      else
        next()

  @switchr = (req, res) ->

    type = self.type.toLowerCase()

    switch type

      when "html"
        res.render "pages/default"
      when "csv"
        res.render "pages/csv"
      when "pdf"
        res.render "pages/pdf"
      else
        res.send req[self.key]
    
  # return scope
  @

reportr::mount = (app) ->

  self = @

  views_path = path.join __dirname, "..", "views"    

  # define view engine
  app.set "views", views_path
  app.set "view engine", "jade"

  # default router end point
  app.get self.path + "/:collection", self.middlr, self.switchr

  # dynamic action handler route
  app.get self.path + "/:collection/:action", (req, res) ->

    # define our collection
    collection = req.params.collection

    if req.params.action == "count"

      mon.countByCollection collection, (err, count) ->
        return if err? then res.json err else res.json count

module.exports = reportr