# build our mongodocs connection docs
_ = require "underscore"

MongoClient = require("mongodb").MongoClient
ObjectID = require("mongodb").ObjectID
format = require("util").format

mongo = (opts, fn) ->

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
  if @uri? then @port = @ip = @database = @query = null

  # make our connection uri
  if not @uri? then @uri = "mongodb://#{if @auth? then @auth else ""}#{@ip}:#{@port}/#{@database}#{if @query? then @query else ""}"

  # # keep our scope in line
  # @
  self = @

  # get yo' jiggy wid it, erm I mean connect to the db
  # but make sure your pattern is only firing this once
  # then sharing `@db` thereafter, if you connect/reconnect
  # it's gonna do ugly things, I assure you (ie blow out your
  # memory, create billions of connections, its so ugly..)

  MongoClient.connect self.uri, (err, db) ->
    return if err? then fn err, null

    db.collectionNames (err, collections) ->
      self.collections = collections

    console.log "REPORTR ::.-^-.:: connected to #{self.uri}"
    
    self.db = if db? then db else null
    if db? then fn null, self else fn null, null

mongo::findCollection = (collection, query, fn) ->

  self = @

  # store our collection to a local var
  collection = @db.collection(collection)

  console.assert query != null, "query is returning null into findByCollection"

  self.querySelector query, (err, sanitized) ->
    return if err? then fn err, null

    console.assert sanitized != null, "querySelector is returning null"
    
    collection.find(sanitized).toArray (err, docs) ->
      return if err? then fn err, null
      
      return if docs.length == 0 then fn JSON.stringify({error: "Sorry, no documents were found.."}), null

      if docs? then fn null, docs


mongo::countCollection = (collection, fn) ->

  # store our collection to a local var
  collection = @db.collection(collection)
  
  collection.count (err, count) ->
    return if err? then fn err, null
    if count? then fn null, {count: count}

mongo::sortCollection = (collection, query, sorted, fn) ->

  self = @

  # store our collection to a local var
  collection = @db.collection(collection)

  self.sortHandler sorted, (err, cleanSort) ->

    console.assert query != null, "query is returning null into sortCollection"
    
    self.querySelector query, (err, sanitized) ->
      return if err? then fn err, null

      console.assert sanitized != null, "querySelector is returning null"

      collection.find(sanitized).sort(cleanSort).toArray (err, ordered) ->
        return if err? then fn err, null
        if ordered? then fn null, ordered


# sortHandler function will grab the first character of a string and
# pass back an array with `[key, order]` w/ `-` indicating descending 
# and `+` indicating acsending order
mongo::sortHandler = (sorted, fn) ->

  # iniatize the array we'll pass back to our callback
  cleanSort = []

  # check to see if there are multiple sort items
  if sorted.indexOf(",") != -1

    # split them on `,`
    sortArr = sorted.split ","

    # run a quick loop and do our magic
    for s in sortArr

      order = s[0]

      _s = s.substr(1, s.length - 1)
      
      if order == "-"
        cleanSort.push [_s, 'descending']

      else if order == "+"
        cleanSort.push [_s, 'ascending']

      # make sure we're not breaking our item 
      # if we want to lazily handle omiting `+`        
      else 
        cleanSort.push [s, 'ascending']
  else

    order = sorted[0]

    _s = sorted.substr(1, sorted.length - 1)
    
    if order == "-"
      cleanSort.push [_s, 'descending']

    else if order == "+"
      cleanSort.push [_s, 'ascending']

    # make sure we're not breaking our item 
    # if we want to lazily handle omiting `+`
    else
      cleanSort.push [sorted, 'ascending']

  fn null, cleanSort

mongo::querySelector = (qs, fn) ->

  # define a list of protected querys to listen for and not do
  # searches with them
  privates = ['skip', 'limit', 'append', 'order', 'id']

  # build out our search/query object
  query = {}

  for key, value of qs

    if privates.indexOf(key) == -1 and value.length > 0

      query[key] = value


    if key == "_id" or key == "id" then query["_id"] = new ObjectID value

  fn null, query

module.exports = mongo
