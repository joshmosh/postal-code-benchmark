var fs = require('fs')
var url_parse = require('url').parse
var mysql = require('mysql')

// Parse DB URL
var db_url = url_parse(process.env.MYSQL_URL, true)

// Set DB connection options
var options = {
  host: db_url.hostname,
  port: db_url.port,
  database: db_url.pathname.substr(1),
  ssl: {
    ca: fs.readFileSync('./config/rds-ca-2015-us-east-1.pem')
  }
}

if(db_url.auth) {
  var auth = db_url.auth.split(':')

  db_url.user = auth[0]
  db_url.password = auth[1]
}

var client = mysql.createConnection(options)

module.exports = client
