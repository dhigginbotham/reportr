_ = require "underscore"
mongo = require "./connection"
fs = require "fs"
path = require "path"

reportr = (opts) ->

  # path to url prefix
  @path = "/reports"

  # give template for JSON/HTML/PDF/CSV etc files
  @type = "json"

  # mongo options
  @mongo = {}

  # default path for templates/render`ables
  @template = path.join __dirname, "..", "templates"

  # default path for views
  @views = path.join __dirname, "..", "views"

  # default view engine
  @engine = "jade"

  # default `req[key]` string
  @key = "reportr"

  # use locals or not
  @locals = true

  # extend our options
  if opts? then _.extend @, opts

  # continue our scope so we don't have to init
  # with .apply()
  self = @

  # load in our mongo, so we can play with it
  mongo = new mongo @mongo, (err, mongo) ->
    return if err? then throw err else if mongo? then self.mongo = mongo

  @findMiddleware = (req, res, next) ->

    # define collection, query params
    collection = req.params.collection
    query = req.query

    # findByCollection
    self.mongo.findByCollection collection, query, (err, docs) ->
      return if err? then next err, null

      if docs?
        if self.locals == true then res.locals.type = collection
        if self.locals == true then req[self.key] = res.locals[self.key] = docs 
        else req[self.key] = docs
        next()
      else
        next()

  @actionsMiddleware = (req, res, next) ->

    # define our collection
    collection = req.params.collection

    if req.params.action == "count"

      self.mongo.countByCollection collection, (err, count) ->
        return if err? then next err, null

        if count?
          if self.locals == true then res.locals.type = collection
          if self.locals == true then req[self.key] = res.locals[self.key] = count 
          else req[self.key] = count
          
          next()
        else
          next()  

  @endpoint = (req, res) ->

    # keep it all the same
    type = self.type.toLowerCase()

    switch type

      when "html"
        res.render "pages/default"
      when "csv"
        res.render "pages/csv"
      when "pdf"
        res.render "pages/pdf"
      when "json"
        if _.isObject req[self.key] then res.json req[self.key] else res.send req[self.key]
    
  # return scope
  @

reportr::mount = (app) ->

  self = @

  # define view engine
  app.set "views", self.views
  app.set "view engine", self.engine

  # default collection list
  app.get self.path, (req, res) ->

    res.send self.mongo.collections

  # default router end point
  app.get self.path + "/:collection", self.findMiddleware, self.endpoint

  # dynamic action handler route
  app.get self.path + "/:collection/:action", self.actionsMiddleware, self.endpoint

module.exports = reportr