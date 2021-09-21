

'use strict';

var express = require("express");
var request = require("request");
const MongoClient = require('mongodb').MongoClient
const cors = require('cors');


// MongoDB part

var user = 'user1'
var pass = 'pass1234'
var uri = 'mongodb+srv://' + user + ':' + pass
    + '@cluster0.nk3zq.mongodb.net/myFirstDatabase'
    + '?retryWrites=true&w=majority';



var app = express();

var port = process.env.PORT || 5000;

var httpServer = require("http").createServer(app);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());  // Parse application/json
// app.use(cors({origin: 'http://localhost:3000'}));
app.use(cors())

app.get('/', (req, res) => {
  res.status(200).send('welcome')
})


httpServer.listen(port);
console.log('Your app is listening on port ' + port);
