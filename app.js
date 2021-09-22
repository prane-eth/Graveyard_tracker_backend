
'use strict';

const express = require('express');
const request = require('request');
const MongoClient = require('mongodb').MongoClient
const cors = require('cors');
const hash = require('md5');  // import md5 as hash

// MongoDB part
var user = 'user1'
var pass = 'pass1234'
var uri = 'mongodb+srv://' + user + ':' + pass
    + '@cluster0.nk3zq.mongodb.net/myFirstDatabase'
    + '?retryWrites=true&w=majority';

var app = express();
var port = process.env.PORT || 5000;
var httpServer = require('http').createServer(app)

app.use(express.urlencoded({ extended: false }))
app.use(express.json());  // Parse application/json
// app.use(cors({origin: 'http://localhost:3000'}))
app.use(cors())


this.auth_obj = {
  'dummy@gmail.com': '851fdee206c1eec10cee5ec8e8962af2'
}
this.active_tokens = ['abc123']
this.data = [
  {name: 'Government graveyard',
    pinCode: 111111, occupied: 10, vacancies: 20,
    address: 'Bandivali, Mumbai rural, Maharastra, India'},
  {name: 'Hospital cemetery',
    pinCode: 111112, occupied: 12, vacancies: 30,
    address: 'Ambivali, Mumbai rural, Maharastra, India'},
  {name: 'Municipal Corporation graveyard',
    pinCode: 111113, occupied: 30, vacancies: 5,
    address: 'Andheri, Mumbai rural, Maharastra, India'},
  {name: 'NGO cemetery',
    pinCode: 111114, occupied: 10, vacancies: 20,
    address: 'Irapuram, Trivendrum rural, Kerala, India'}
]

app.get('/', (req, res) => {
  res.status(200).send(
    'welcome. there is nothing here. visit /login /signup /updateData /getData'
  )
})

app.get('/login', (req, res) => {
  var email = req.query['email']
  var password = req.query['password']
  password = hash(password)
  if (this.auth_obj[email] == password) {
    var timestamp = new Date().toString()
    var access_token = hash(email + timestamp)
    this.active_tokens.push(access_token)
    res.status(200).send({ access_token: access_token, status: 'Login successful' })
  }
  else  {
    res.status(200).send({ error: 'Email or password incorrect'})
  }
})

app.get('/signup', (req, res) => {
  var email = req.query['email']
  var password = req.query['password']
  password = hash(password)
  if (this.auth_obj[email]) {
    res.status(200).send({ error: "Email already registered" })
  }
  else  {
    this.auth_obj[email] = password  // store password
    res.status(200).send({ status: "Signup successful. You can login now." })
  }
})

app.get('/updateData', (req, res) => {
  var name = req.query['name']
  var pinCode = req.query['pinCode']
  var occupied = req.query['occupied']
  var vacancies = req.query['vacancies']
  var address = req.query['address']
  var access_token = req.query['access_token']
  if (!access_token || !(this.active_tokens.includes(access_token))) {
    // console.log(access_token, 'not in', this.active_tokens)
    res.status(200).send({ error: 'No valid token found. Please login again.' })
  } else if (name && pinCode && occupied && vacancies && address) {
    if (pinCode.length != 6)
      res.status(200).send({ error: 'Invalid pin code' })
    else  {
      var isUpdated = false
      for (var row of this.data)  // if cemetery is already existing, update data
        if (row.name == name && row.pinCode == pinCode) {
          row.occupied = occupied
          row.vacancies = vacancies
          isUpdated = true
          break
        }
      if (!isUpdated)  // if no existing data is not updated, add new row
        this.data.push({  // push new object
          name: name, pinCode: pinCode, occupied: occupied,
          vacancies: vacancies, address: address
        })
      res.status(200).send({ status: 'Data added successfully' })
    }
  }
  else
    res.status(200).send({ error: "Enter all the values" })
})

app.get('/getData', (req, res) => {
  res.status(200).send(this.data)
})

httpServer.listen(port);
console.log('Your app is listening on port ' + port);
