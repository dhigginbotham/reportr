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

  # define route for SPA
  @client = template = path.join __dirname, "..", "client"

  # define template directory  
  @template = path.join __dirname, "..", "templates", "default.jade"

  # default `req[key]` string
  @key = "reportr"

  # whether or not to display the `system.indexes`
  @indexes = true

  @viewable = ["apps", "users"]

  # extend our options

  if opts? then _.extend @, opts

  if @indexes == true then @viewable.push "system.indexes"

  # continue our scope so we don't have to init
  # with .apply()
  self = @

  if self.path == "" then self.path = "/"

  if self.path.length > 1 and self.path[0] == "/" then self.path += "/"

  @_routes = {}
  @_routes.base = self.path
  @_routes.collection = self.path + ":format/:collection"
  @_routes.action = self.path + ":format/:collection/:action"

  # load in our mongo, so we can play with it
  self.mongo = new mongo @mongo, (err, mongo) ->
    return if err? then throw err else if mongo? 
      self.mongo = mongo

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

  @isCollectionViewable = (req, res, next) ->

    # isCollectionViewable allows you to restrict
    # which collections are publically accessable
    if req.params.hasOwnProperty('collection')
      
      collection = req.params.collection

      if self.viewable.indexOf(collection) != -1

        # collection is allowed
        next null, true

      else

        # collection is now allowed
        next JSON.stringify({error: "Invalid collection please try again."}), false
    else

      next JSON.stringify({error: "Invalid collection please try again."}), null

  @buildRoutePaths = (route, fn) ->

    # buildRoutePaths will return us our different accepted routes

    routes = [":base", ":format", ":collection", ":action"]

    index = routes.indexOf(route);


    if index >= 0 and index < routes.length
      
      routed = "";

      for i in [0..index]
        if routes[i] == ":base" then routes[i] = ""
        routed += routes[i] + if (routes.length > i + 1) then "/" else ""

      
      if routed.length > 1 and routed[routed.length - 1] == "/" then routed = routed.substr(0, routed.length - 1)
      fn null, routed

    else fn null, "error"

  @routeSwitch = (req, res) ->

    # routeSwitch handles `/:format` prefix,

    # keep it all the same
    type = req.params.format

    switch type

      when "jade", "html" then self.jade req, res
      when "json", "api"
        if _.isObject req[self.key] == true then res.json req[self.key] else res.send req[self.key]
      else
        res.send {error: "Unsupported format entered, please check your url"}
    
  # return scope
  self

# render some jade, super sync style
reportr::jade = (req, res, next) ->

  self = @

  template = fs.readFileSync self.template, "utf8"

  options = {pretty: true}
  
  render = jade.compile template, options
  
  html = render res.locals

  res.send html

reportr::mount = (connect, app) ->

  self = @

  app.use connect.static self.client

  # provide a default path for user
  self.buildRoutePaths ":base", (err, base) ->
    app.get base, (req, res) ->
      res.redirect base + "api/system.indexes"

  # default router end point
  self.buildRoutePaths ":collection", (err, collection) ->
    app.get collection, self.isCollectionViewable, self.findMiddleware, self.routeSwitch

  # dynamic action handler route
  self.buildRoutePaths ":action", (err, action) ->
    app.get action, self.isCollectionViewable, self.actionsMiddleware, self.routeSwitch

module.exports = reportr