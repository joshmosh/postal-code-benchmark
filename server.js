var express = require('express')
var mongo_client = require('mongodb').MongoClient
var assert = require('assert')
var async = require('async')
var app = express()

// Resources
var postal_codes = require('./resources/postal_codes')

// Helpers
var mysql_client = require('./helpers/mysql')

app.get('/mongo', function(req, res) {
  mongo_client.connect(process.env.MONGO_URL, function(err, db) {
    assert.equal(null, err)

    col = db.collection('us_zips')

    async.eachSeries(postal_codes, function(postal_code, callback) {
      var start = new Date()

      col.findOne({ zip5: postal_code }, function() {
        var end = new Date()

        var response_time = end - start

        console.log("Postal code lookup for " + postal_code + " took " + response_time + " milliseconds.")

        callback()
      })
    }, function(err) {
      assert.equal(null, err)

      db.close()
    })
  })

  res.status(200).send("Looking up postal codes. Check your logs.")
})

app.get('/mysql', function(req, res) {
  var connection = mysql.createConnection(process.env.MYSQL_URL)

  async.eachSeries(postal_codes, function(postal_code, callback) {
    var start = new Date()

    connection.query('SELECT DISTINCT * FROM `2015` WHERE `zip5` = ? LIMIT 1', [parseInt(postal_code)], function(err, result) {
      var end = new Date()

      var response_time = end - start

      console.log("Postal code lookup for " + postal_code + " took " + response_time + " milliseconds.")

      callback()
    })
  }, function(err) {
    assert.equal(null, err)

    connection.end()
  })

  res.status(200).send("Looking up postal codes. Check your logs.")
})

app.all('*', function(req, res) {
  res.status(404).send("Page not found.")
})

var server = app.listen(process.env.PORT, function() {
  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})
