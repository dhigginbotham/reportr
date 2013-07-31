_ = require "underscore"
mongo = require "./connection"
router = require "./router"
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

  # whether or not to display the `system.indexes`
  @collections = true

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

    # findCollection
    self.mongo.findCollection collection, query, (err, docs) ->
      return if err? then next err, null

      if docs?
        # define your collection name
        if self.locals == true then res.locals.type = collection
        if self.locals == true then req[self.key] = res.locals[self.key] = docs 
        else req[self.key] = docs
        next()
      else
        next()

  @actionsMiddleware = (req, res, next) ->

    # define our collection
    collection = req.params.collection
    action = req.params.action
    query = req.query

    switch action

      when "count"

        self.mongo.countCollection collection, (err, count) ->
          return if err? then next err, null

          if count?
            # define your collection name
            if self.locals == true then res.locals.type = collection
            if self.locals == true then req[self.key] = res.locals[self.key] = count 
            else req[self.key] = count

            next()
          else
            next()

      when "sort"

        order = req.query.order

        if req.query.hasOwnProperty('order')

          self.mongo.sortCollection collection, query, order, (err, docs) ->
            return if err? then next err, null

            if docs?
              # define your collection name
              if self.locals == true then res.locals.type = collection
              if self.locals == true then req[self.key] = res.locals[self.key] = docs 
              else req[self.key] = docs
              next()
            else
              next()
        else
          res.redirect "back"

  @routeSwitch = (req, res) ->

    # keep it all the same
    type = self.type.toLowerCase()

    switch type

      when "html" then router.html req, res
      when "csv" then router.html req, res
      when "pdf" then router.html req, res
      when "json" then router.json req, res
      else router.json req, res
    
  # return scope
  @

reportr::mount = (app) ->

  self = @

  # define view engine
  app.set "views", self.views
  app.set "view engine", self.engine

  # default router end point
  app.get self.path + "/:collection", self.findMiddleware, self.routeSwitch

  # dynamic action handler route
  app.get self.path + "/:collection/:action", self.actionsMiddleware, self.routeSwitch

module.exports = reportr