## REPORTR

Expect this to be completely unstable.

Have you ever needed a way to display your mongodb databases to your boss, or your client, or just pull some stupid reports so you can look cool? Well, I'm trying to achieve that with this module.. Currently, I am going to have this work as an API w/ renderable views for: `CSV`, `PDF`, `HTML w/ Jade` and currently defaults to a restful `JSON` router

### REPORTR SETTINGS
```js
var options = {
  path: "/reports", // expects a string
  type: "json", // will handle `json`, `html`, `pdf`, `csv`
  mongo: {
    ip: "127.0.0.1", // pass a string ip/url
    port: "27017", // pass a string for the port
    database: "test", // pass a string for your database
    user: "user", // pass a string for your database username
    pass: "pass", // pass a string for your database password
    // alternatively you can pass a `uri` string ie:
    uri: "mongodb://user:pass@127.0.0.1:27017/test"
  }
};

```

### QUERY SUPPORT
```md
GET ~/reports/:collection
GET ~/reports/:collection?key=val
GET ~/reports/:collection/count
```

## MIT
```md
The MIT License (MIT)

Copyright (c) 2013 David Higginbotham 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```