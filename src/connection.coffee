# build our mongodocs connection docs
_ = require "underscore"

MongoClient = require("mongodb").MongoClient
ObjectID = require("mongodb").ObjectID
format = require("util").format

mongo = (opts) ->

  # ip/url
  @ip = "127.0.0.1"

  # port to connect to
  @port = "27017"

  # database to connect to
  @database = "test"

  # say you got a custom query you'll need this in all respects
  @query = null

  # these both must be set, otherwise my conditional jargon renders it useless
  @user = null
  @pass = null
  @uri = null

  # extend our object with some options
  if opts? then _.extend @, opts

  # make authentication string
  @auth = if @user? and @pass? then "#{@user}:#{@pass}@" else null

  # sloppily blanket our uri if it's previously set, we can use a fn later to sanitize
  if @uri? then @port = @ip = @database = @query = @uri

  # make our connection uri
  if not @uri? then @uri = "mongodb://#{if @auth? then @auth else ""}#{@ip}:#{@port}/#{@database}#{if @query? then @query else ""}"

  # keep our scope in line
  @

mongo::connect = (fn) ->

  self = @

  # get yo' jiggy wid it, erm I mean connect to the db
  # but make sure your pattern is only firing this once
  # then sharing `@db` thereafter, if you connect/reconnect
  # it's gonna do ugly things, I assure you (ie blow out your
  # memory, create billions of connections, its so ugly..)

  MongoClient.connect self.uri, (err, db) ->
    return if err? then fn err, null

    console.log "REPORTR ::.-^-.:: connected to #{self.uri}"
    
    self.db = if db? then db else null
    if db? then fn null, self else fn null, null

mongo::findByCollection = (collection, query, fn) ->

  self = @
  
  # store our collection to a local var
  collection = self.db.collection(collection)

  self.querier query, (err, queried) ->

    collection.find(queried).toArray (err, docs) ->
      return if err? then fn err, null
      return if docs.length == 0 then fn {error: "Sorry, no documents were found.."}, null

      if docs? then fn null, docs

mongo::countByCollection = (collection, fn) ->

  # store our collection to a local var
  collection = @db.collection(collection)
  
  collection.count (err, count) ->
    return if err? then fn err, null
    if count? then fn null, {count: count}


mongo::querier = (qs, fn) ->

  # define a list of protected querys to listen for and not do
  # searches with them
  privates = ['skip', 'limit', 'append', 'sort']

  # build out our search/query object
  query = {}

  for key, value of qs
    
    if privates.indexOf(key) == -1 and value.length > 0
      query[key] = value

    if key == "_id" then query[key] = new ObjectID value

  fn null, query

module.exports = mongo
