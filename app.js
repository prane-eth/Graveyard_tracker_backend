
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


this.email_pass = {
  'dummy@gmail.com': 'caaf2a6ffcd9fff8f6b32c9471279569'
}
this.active_tokens = []
this.token_email = {}
this.data = [
  {name: 'Government graveyard',
    pinCode: 400102, occupied: 10, vacancies: 20,
    address: 'Bandivali, Mumbai rural, Maharastra, India',
    updatedBy: 'dummy@gmail.com'
  },
  {name: 'Hospital cemetery',
    pinCode: 421100, occupied: 12, vacancies: 30,
    address: 'Ambivali, Mumbai rural, Maharastra, India',
    updatedBy: 'dummy@gmail.com'
  },
  {name: 'Municipal Corporation graveyard',
    pinCode: 400053, occupied: 30, vacancies: 5,
    address: 'Andheri, Mumbai rural, Maharastra, India',
    updatedBy: 'dummy@gmail.com'
  },
  {name: 'NGO cemetery',
    pinCode: 683541, occupied: 10, vacancies: 20,
    address: 'Irapuram, Trivendrum rural, Kerala, India',
    updatedBy: 'dummy@gmail.com'
  }
]
this.booked_slots = {}
this.email_slots = {}  // slots booked by email

const getPrimaryKey = (name, pinCode) => {
  return name + pinCode
}

const isTokenValid = (access_token, res) => {
  if (!access_token || !(this.active_tokens.includes(access_token))) {
    res.status(200).send({ error: 'No valid token found. Please login again.' })
    return
  }
  var email = this.token_email[access_token]
  if (email)
    res.status(200).send({ status: 'Token is valid' })
  else
    res.status(200).send({ error: 'No valid token found. Please login again.' })
}

app.get('/', (req, res) => {
  res.status(200).send(
    'welcome. there is nothing here. visit /login /signup /updateData /getData'
  )
})

app.get('/isTokenValid', (req, res) => {
  var access_token = req.query['access_token']
  isTokenValid(access_token, res)
})

app.get('/login', (req, res) => {
  var email = req.query['email']
  var password = req.query['password']
  password = hash(password)
  if (this.email_pass[email] == password) {
    var timestamp = new Date().toString()
    var access_token = hash(email + timestamp)
    this.active_tokens.push(access_token)
    this.token_email[access_token] = email
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
  if (this.email_pass[email]) {
    res.status(200).send({ error: "Email already registered" })
  }
  else  {
    this.email_pass[email] = password  // store password
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
  } else if (name && pinCode) {
    if (pinCode.length != 6)
      res.status(200).send({ error: 'Invalid pin code' })
    else  {
      var isUpdated = false
      for (var row of this.data)  // if cemetery is already existing, update data
        // var row = this.data[index]
        if (row.name == name && row.pinCode == pinCode) {
          if (occupied == 0 && vacancies == 0) {
            this.data.splice(
              // index,
              this.data.findIndex(  // remove row
                a => (a.name == row.name && a.pinCode == row.pinCode)) 
            , 1)
          }
          else {
            row.occupied = occupied
            row.vacancies = vacancies
            isUpdated = true
          }
          break
        }
      // if no existing data is not updated, add new row
      if (!isUpdated && name && pinCode && address)
          this.data.push({  // push new object to data
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

app.get('/bookSlot', (req, res) => {
  var personName = req.query['personName']
  var name = req.query['name']
  var pinCode = req.query['pinCode']
  var access_token = req.query['access_token']
  if (!access_token || !(this.active_tokens.includes(access_token))) {
    // console.log(access_token, 'not in', this.active_tokens)
    res.status(200).send({ error: 'No valid token. Please login again.' })
  }
  if (name && pinCode) {
    if (pinCode.length != 6)
      res.status(200).send({ error: 'Invalid pin code length' })
    else  {
      var updateIndex = null
      for (var index in this.data) { // if cemetery is already existing, update data
        var row = this.data[index]
        if (row.name == name && row.pinCode == pinCode) {
          if (row.vacancies == 0) {
            res.status(200).send({ 
              error: "There are no vacancies. Kindly book slots in some other cemetery"
            })
          }
          updateIndex = index
          break
        }
      }
      if (!updateIndex)
        res.status(200).send({ error: 'Cemetery not found' })
      
      var email = this.token_email[access_token]
      if (!this.email_slots[email])
        this.email_slots[email] = []
      // if personName and email exists in this.email_slots[email]
      // then return that personName is already booked
      if (this.email_slots[email])
        for (var slot of this.email_slots[email])
          if (slot.personName == personName) {
            res.status(200).send({
              error: 'You have already booked a slot for the same person'
            })
          }
      var primaryKey = getPrimaryKey(name, pinCode)
      // if primaryKey is not in this.booked_slots
      // then add primaryKey to this.booked_slots
      if (!this.booked_slots[primaryKey])
        this.booked_slots[primaryKey] = []
      this.booked_slots[primaryKey].push({
        personName: personName, email: email
      })
      // get timestamp
      var timestamp = new Date().toString()
      // add data to this.email_slots
      this.email_slots[email].push({
        name: name,  // graveyard name
        pinCode: pinCode,
        personName: personName,
        timestamp: timestamp
      })
      // console.log(this.booked_slots)
      // console.log(this.email_slots)
      this.data[updateIndex].vacancies -= 1
      this.data[updateIndex].occupied += 1
      res.status(200).send({ status: 'Slot booked successfully' })
    }
  }
  else
    res.status(200).send({ error: "Enter all the values" })
})

app.get('/getBookedSlots', (req, res) => {
  var access_token = req.query['access_token']
  if (!access_token || !(this.active_tokens.includes(access_token))) {
    res.status(200).send({ error: 'Session expired. Please login again.' })
    return
  }
  var email = this.token_email[access_token]
  if (email) {
    var slots = this.email_slots[email]
    if (slots)
      res.status(200).send({ slots: slots })
    else
      res.status(200).send({ error: 'No slots booked' })
  }
  else
    res.status(200).send({ error: 'No valid token found. Please login again.' })
})

app.get('/cancelSlot', (req, res) => {
  var personName = req.query['personName']
  var access_token = req.query['access_token']
  if (!access_token || !(this.active_tokens.includes(access_token))) {
    res.status(200).send({ error: 'No valid token. Please login again.' })
    return
  }
  var email = this.token_email[access_token]
  if (!email)
    res.status(200).send({ error: 'No valid token found. Please login again.' })
  var bookedSlots = this.email_slots[email]
  if (!bookedSlots)
    res.status(200).send({ error: 'No slots booked' })

  var foundIndex = null
  for (var index in bookedSlots) {
    var slot = bookedSlots[index]
    if (slot.personName == personName) {
      foundIndex = index
      break
    }
  }
  if (!foundIndex)
    res.status(200).send({ error: 'No slot found for the given person' })
  var slot = bookedSlots[foundIndex]
  var name = slot.name  // graveyard name
  var pinCode = slot.pinCode
  var primaryKey = getPrimaryKey(name, pinCode)
  this.booked_slots[primaryKey].splice(
    this.booked_slots[primaryKey].findIndex(
      a => (a.personName == personName && a.email == email)
    ), 1
  )
  this.email_slots[email].splice(foundIndex, 1)
  bookedSlots.splice(index, 1)
  // update vacancies and occupied
  var updateIndex = null
  for (var index in this.data) {
    var row = this.data[index]
    if (row.name == name && row.pinCode == pinCode) {
      updateIndex = index
      break
    }
  }
  if (!updateIndex)
    res.status(200).send({ error: 'Cemetery not found' })
  this.data[updateIndex].vacancies += 1
  this.data[updateIndex].occupied -= 1
  
  res.status(200).send({ status: 'Slot cancelled successfully' })
})

app.get('/logout', (req, res) => {
  var access_token = req.query['access_token']
  // remove access_token from this.active_tokens
  const index = this.active_tokens.indexOf(access_token)
  if (index > -1)
    this.active_tokens.splice(index, 1)
  // remove access_token from this.token_email
  delete this.token_email[access_token]
  res.status(200).send({status: 'Successful'})
})

httpServer.listen(port);
console.log('Your app is listening on port ' + port);
