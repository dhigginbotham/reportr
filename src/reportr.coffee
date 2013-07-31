_ = require "underscore"
mongo = require "./connection"
router = require "./router"
fs = require "fs"
path = require "path"
jade = require "jade"

reportr = (opts) ->

  # path to url prefix
  @path = "/reports"

  # mongo options
  @mongo = {}

  # default path for templates/render`ables
  @output = path.join __dirname, "..", "output"

  # default path for views
  @views = path.join __dirname, "..", "views"

  # default view engine
  @engine = "jade"

  # default `req[key]` string
  @key = "reportr"

  # whether or not to display the `system.indexes`
  @indexes = true

  # extend our options
  if opts? then _.extend @, opts

  # continue our scope so we don't have to init
  # with .apply()
  self = @

  # load in our mongo, so we can play with it
  new mongo @mongo, (err, mongo) ->
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
        res.locals.type = collection
        req[self.key] = res.locals[self.key] = docs 

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
            res.locals.type = collection
            req[self.key] = res.locals[self.key] = count 

            next()
          else
            next()

      when "sort"

        order = req.query.order

        if req.query.hasOwnProperty('order') and order.length > 0

          self.mongo.sortCollection collection, query, order, (err, docs) ->
            return if err? then next err, null

            if docs?
              # define your collection name
              res.locals.type = collection
              req[self.key] = res.locals[self.key] = docs 
              next()
            else
              next()
        else
          next JSON.stringify({error: "You must provide an `order` operator for this method to work properly."}), null

  @routeSwitch = (req, res) ->

    # routeSwitch handles `/:format` prefix,
    # supporting: `html`,`csv`,`pdf`,`json`,`api`

    # keep it all the same
    type = req.params.format

    switch type

      when "jade", "html" then self.jade req, res
      when "json", "api"
        if _.isObject req[self.key] == true then res.json req[self.key] else res.send req[self.key]
      else
        res.send {error: "Unsupported format entered, please check your url"}
    
  # return scope
  @

# render some jade 
reportr::jade = (req, res, next) ->

  self = @

  template = path.join __dirname, "..", "templates", "default.jade"
  _template = fs.readFileSync template, "utf8"

  options = {}
  render = jade.compile _template, options
  html = render res.locals[self.key]
  
  res.send html

reportr::mount = (app) ->

  self = @

  # allow for empty paths, or paths with `/somepath` += `/`
  if self.path.lastIndexOf("/") == 0 or self.path == ""
    self.path = "/"
  else
    self.path += "/"

  # provide a default path for user
  app.get self.path, (req, res) ->
    res.redirect self.path + "api/system.indexes"

  # default router end point
  app.get self.path + ":format/:collection", self.findMiddleware, self.routeSwitch

  # dynamic action handler route
  app.get self.path + ":format/:collection/:action", self.actionsMiddleware, self.routeSwitch

module.exports = reportr