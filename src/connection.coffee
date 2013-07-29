# build our mongodocs connection docs
_ = require "underscore"

MongoClient = require("mongodb").MongoClient
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

  MongoClient.connect self.uri, (err, db) ->
    return if err? then fn err, null
    self.db = if db? then db else null
    if db? then fn null, db else fn null, null

module.exports = mongo