
'use strict';

const express = require('express');
// const request = require('request');
const cors = require('cors');
const hash = require('md5');  // import md5 as hash

// import functions from db_functions.js
const db_functions = require('./db_functions.js')
const addEmailSlotToDB = db_functions.addEmailSlotToDB
const removeBookedSlotFromDB = db_functions.removeBookedSlotFromDB
const removeEmailSlotFromDB = db_functions.removeEmailSlotFromDB
const addSignUpToDB = db_functions.addSignUpToDB
const addGraveyardToDB = db_functions.addGraveyardToDB
const deleteGraveyardFromDB = db_functions.deleteGraveyardFromDB
const updateRowInDB = db_functions.updateRowInDB,
addBookedSlotToDB = db_functions.addBookedSlotToDB
const restoreAll = db_functions.restoreAll

this.email_pass = db_functions.email_pass
this.graveyard_data = db_functions.graveyard_data
this.email_slots = db_functions.email_slots
this.booked_slots = db_functions.booked_slots

var app = express();
var port = process.env.PORT || 5000;
var httpServer = require('http').createServer(app)

app.use(express.urlencoded({ extended: false }))
app.use(express.json());  // Parse application/json
// app.use(cors({origin: 'http://localhost:3000'}))
app.use(cors())

// tables which are not in DB
this.token_email = {}
this.active_tokens = []

restoreAll()

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


// ____________________________________________________________________________

app.get('/', (req, res) => {
  res.status(200).send(
    'Welcome. There is nothing here. This is the backend. Please use the frontend.'
  )
})

app.get('/getData', (req, res) => {
  res.status(200).send(this.graveyard_data)
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
    console.log('Login failed')
    console.log(email)
    console.log(password)
    console.log(this.email_pass[email])
    console.log(this.email_pass)
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
    // insert into DB
    addSignUpToDB(email, password, res)
    res.status(200).send({ status: "Signup successful. You can login now." })
  }
})

app.get('/updateData', (req, res) => {
  var name = req.query['name']
  var pinCode = req.query['pinCode']
  var occupied = req.query['occupied']
  var vacancies = req.query['vacancies']
  var address = req.query['address']
  var mapLink = req.query['mapLink']
  var access_token = req.query['access_token']
  if (!access_token || !(this.active_tokens.includes(access_token))) {
    // console.log(access_token, 'not in', this.active_tokens)
    res.status(200).send({ error: 'No valid token found. Please login again.' })
  }

  var email = this.token_email[access_token]
  if (!email)
    res.status(200).send({ error: 'No valid token found. Please login again.' })

  if (!name || !pinCode)
    res.status(200).send({ error: 'Name and Pin Code are required' })
  if (pinCode.length != 6)
    res.status(200).send({ error: 'Invalid pin code' })

  // find index for which name and pincode match
  var foundIndex = -1
  var index = 0
  for (index in this.graveyard_data) {
    var row = this.graveyard_data[index]
    if (row.name == name && row.pinCode == pinCode) {
      foundIndex = index
      break
    }
  }
  if (foundIndex == -1) {  // if not found, add new data
    // if any data is empty
    if (!occupied || !vacancies || !address)
      return res.status(200).send({ error: 'All fields are required' })
    this.graveyard_data.push({
      name: name, pinCode: pinCode, occupied: occupied,
      vacancies: vacancies, address: address, mapLink: mapLink,
      updatedBy: email
    })
    // add row to DB
    addGraveyardToDB(name, pinCode, occupied, vacancies, address, mapLink, email, res)
    res.status(200).send({ status: 'New graveyard is added successfully' })
  }
  if (occupied == '0' && vacancies == '0') {
    this.graveyard_data.splice(index, 1)  // delete row
    // delete row from DB
    deleteGraveyardFromDB(name, pinCode, res)
    return res.status(200).send({ status: 'Graveyard is deleted successfully' })
  }
  
  if (occupied == 0 || occupied)
    this.graveyard_data[foundIndex].occupied = parseInt(occupied)
  if (vacancies == 0 || vacancies)
    this.graveyard_data[foundIndex].vacancies = parseInt(vacancies)
  if (address)
    this.graveyard_data[foundIndex].address = address
  if (mapLink)
    this.graveyard_data[foundIndex].mapLink = mapLink
  this.graveyard_data[foundIndex].updatedBy = email
  // update row in DB
  updateRowInDB(name, pinCode, occupied, vacancies, address, mapLink, email, res)
  res.status(200).send({ status: 'Graveyard is updated successfully' })
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
      for (var index in this.graveyard_data) { // if graveyard is already existing, update data
        var row = this.graveyard_data[index]
        if (row.name == name && row.pinCode == pinCode) {
          if (row.vacancies == 0) {
            res.status(200).send({ 
              error: "There are no vacancies. Kindly book slots in some other graveyard"
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
      // add booked_slots to DB
      addBookedSlotToDB(primaryKey, personName, email, res)
      // get timestamp
      var timestamp = new Date().toString()
      // add data to this.email_slots
      this.email_slots[email].push({
        name: name,  // graveyard name
        pinCode: pinCode,
        personName: personName,
        timestamp: timestamp
      })
      // add email slot in DB
      addEmailSlotToDB(email, name, pinCode, personName, timestamp, res)
      // console.log(this.booked_slots)
      // console.log(this.email_slots)
      this.graveyard_data[updateIndex].vacancies -= 1
      this.graveyard_data[updateIndex].occupied += 1
      // update row in DB
      var row = this.graveyard_data[updateIndex]
      updateRowInDB(name, pinCode, row.occupied, row.vacancies, row.address, row.mapLink, row.updatedBy, res)

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
  var emailSlots = this.email_slots[email]
  if (!emailSlots)
    res.status(200).send({ error: 'No slots booked' })

  var foundIndex = null
  for (var index in emailSlots) {
    var slot = emailSlots[index]
    if (slot.personName == personName) {
      foundIndex = index
      break
    }
  }
  if (!foundIndex)
    res.status(200).send({ error: 'No slot found for the given person' })
  var slot = emailSlots[foundIndex]
  var name = slot.name  // graveyard name
  var pinCode = slot.pinCode
  var primaryKey = getPrimaryKey(name, pinCode)
  this.booked_slots[primaryKey].splice(
    this.booked_slots[primaryKey].findIndex(
      a => (a.personName == personName && a.email == email)
    ), 1
  )
  // remove booked slot from DB
  removeBookedSlotFromDB(primaryKey, personName, email, res)
  this.email_slots[email].splice(foundIndex, 1)
  emailSlots.splice(index, 1)
  // remove email slot from DB
  removeEmailSlotFromDB(email, personName, res)
  // update vacancies and occupied
  var updateIndex = null
  for (var index in this.graveyard_data) {
    var row = this.graveyard_data[index]
    if (row.name == name && row.pinCode == pinCode) {
      updateIndex = index
      break
    }
  }
  if (!updateIndex)
    res.status(200).send({ error: 'Cemetery not found' })
  this.graveyard_data[updateIndex].vacancies += 1
  this.graveyard_data[updateIndex].occupied -= 1
  var row = this.graveyard_data[index]
  updateRowInDB(name, pinCode, row.occupied, row.vacancies, row.address, row.updatedBy, res)

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
