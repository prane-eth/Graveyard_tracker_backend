
const MongoClient = require('mongodb').MongoClient

var user = 'user1'
var pass = 'pass1234'
var uri = 'mongodb+srv://' + user + ':' + pass
    + '@cluster0.nk3zq.mongodb.net/myFirstDatabase'
    + '?retryWrites=true&w=majority';

// restore email_pass from DB
const restoreEmailPass = (res) => {
    this.email_pass = []
	MongoClient.connect(uri, function(err, client) {
		if (err) {
			console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
		}
		console.log('Connected...');
		const collection = client.db("myFirstDatabase").collection("email_pass");
		collection.find({}).toArray(function(err, result) {
			if (err) {
				console.log(err);
			} else if (result.length) {
				console.log('Found:', result);
				for (var i = 0; i < result.length; i++) {
					this.email_pass[result[i].email] = result[i].password
				}
				res.status(200).send({
					status: 'Email-pass restored'
				})
			} else {
				console.log('No document(s) found with defined "find" criteria!');
			}
			// Close connection
			client.close();
		});
	});
}

// restore graveyard_data from DB
const restoreGraveyardData = (res) => {
    this.graveyard_data = []
	MongoClient.connect(uri, function(err, client) {
		if (err) {
			console.log('Error occurred while connecting to MongoDB Atlas...', err);
		}
		console.log('Connected...');
		const collection = client.db("myFirstDatabase").collection("graveyard_data");
		collection.find({}).toArray(function(err, result) {
			if (err) {
				console.log(err);
			} else if (result.length) {
				console.log('Found:', result);
				this.graveyard_data = result
				console.log('graveyard_data restored')
			} else {
				console.log('No document(s) found with defined "find" criteria!');
			}
			// Close connection
			client.close();
		});
	});
}

const addEmailSlotToDB = (email, name, pinCode, personName, timestamp, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)
			res.status(200).send({
				error: 'Error connecting to DB'
			});
		var db = client.db('myFirstDatabase');
		var collection = db.collection('email_slots');
		collection.insertOne({
			email: email,
			name: name,
			pinCode: pinCode,
			personName: personName,
			timestamp: timestamp
		}, function(err, result) {
			if (err)
				res.status(200).send({
					error: 'Error inserting into DB'
				});
			console.log("row inserted");
			client.close();
		});
	});
}

const restoreEmailSlots = () => {
	this.email_slots = []
	MongoClient.connect(uri, function(err, client) {
		if (err)
			console.log('Error connecting to DB')
		var db = client.db('myFirstDatabase');
		var collection = db.collection('email_slots');
		collection.find({}).toArray(function(err, result) {
			if (err)
				console.log('Error getting data from DB')
			for (var row of result) {
				var email = row.email
				if (!this.email_slots[email])
					this.email_slots[email] = []
				this.email_slots[email].push({
					name: row.name,
					pinCode: row.pinCode,
					personName: row.personName,
					timestamp: row.timestamp
				})
			}
			client.close();
		});
	});
}

const removeBookedSlotFromDB = (primaryKey, personName, email, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)
			res.status(200).send({
				error: 'Error connecting to DB'
			});
		var db = client.db('myFirstDatabase');
		var collection = db.collection('booked_slots');
		collection.deleteOne({
			primaryKey: primaryKey,
			personName: personName,
			email: email
		}, function(err, result) {
			if (err)
				res.status(200).send({
					error: 'Error inserting into DB'
				});
			console.log("row inserted");
			client.close();
		});
	});
}

const removeEmailSlotFromDB = (email, name, pinCode, personName, timestamp, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)
			res.status(200).send({
				error: 'Error connecting to DB'
			});
		var db = client.db('myFirstDatabase');
		var collection = db.collection('email_slots');
		collection.deleteOne({
			email: email,
			personName: personName
		}, function(err, result) {
			if (err)
				res.status(200).send({
					error: 'Error inserting into DB'
				});
			console.log("row inserted");
			client.close();
		});
	});
}

const addSignUpToDB = (email, password, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)
			res.status(200).send({
				error: 'Error connecting to DB'
			});
		var db = client.db('myFirstDatabase');
		var collection = db.collection('email_pass');
		collection.insertOne({
			email: email,
			password: password
		}, function(err, result) {
			if (err)
				res.status(200).send({
					error: 'Error inserting into DB'
				});
			console.log("signup: row inserted");
			client.close();
		});
	});
}

const addGraveyardToDB = (name, pinCode, occupied, vacancies, address, updatedBy, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)
			res.status(200).send({ error: 'Error connecting to DB' });
		var db = client.db('myFirstDatabase');
		var collection = db.collection('graveyard_data');
		collection.insertOne({
			name: name,
			pinCode: pinCode,
			occupied: occupied,
			vacancies: vacancies,
			address: address,
			updatedBy: updatedBy
		}, function(err, result) {
			if (err)
				res.status(200).send({
					error: 'Error inserting into DB'
				});
			console.log("row inserted");
			client.close();
		});
	});
}

const deleteGraveyardFromDB = (name, pinCode, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)
			res.status(200).send({ error: 'Error connecting to DB' });
		var db = client.db('myFirstDatabase');
		var collection = db.collection('graveyard_data');
		collection.deleteOne({ name: name, pinCode: pinCode }, function(err, result) {
			if (err)
				res.status(200).send({
					error: 'Error deleting from DB'
				});
			console.log("row deleted");
			client.close();
		});
	});
}

// get row from this.graveyard_data
const getRowFromGraveyardData = (name, pinCode) => {
	for (var row of this.graveyard_data) {
		if (row.name == name && row.pinCode == pinCode)
			return row
	}
	return null
}

const updateRowInDB = (name, pinCode, occupied, vacancies, address, updatedBy, res) => {
	var row = getRowFromGraveyardData(name, pinCode)
	if (!occupied)
		occupied = row.occupied
	if (!vacancies)
		vacancies = row.vacancies
	if (!address)
		address = row.address
	if (!updatedBy)
		updatedBy = row.updatedBy
	deleteGraveyardFromDB(name, pinCode, res)
	addGraveyardToDB(name, pinCode, occupied, vacancies, address, updatedBy, res)
}

const addBookedSlotToDB = (primaryKey, personName, email, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)
			res.status(200).send({
				error: 'Error connecting to DB'
			});
		var db = client.db('myFirstDatabase');
		var collection = db.collection('booked_slots');
		collection.insertOne({
			primaryKey: primaryKey,
			personName: personName,
			email: email
		}, function(err, result) {
			if (err)
				res.status(200).send({
					error: 'Error inserting into DB'
				});
			console.log("row inserted");
			client.close();
		});
	});
}

const restoreBookedSlots = () => {
	this.booked_slots = []
	MongoClient.connect(uri, function(err, client) {
		if (err)
			console.log('Error connecting to DB')
		var db = client.db('myFirstDatabase');
		var collection = db.collection('booked_slots');
		collection.find({}).toArray(function(err, result) {
			if (err)
				console.log('Error getting data from DB')
			for (var row of result) {
				var primaryKey = row.primaryKey
				var personName = row.personName
				var email = row.email
				if (!this.booked_slots[primaryKey])
					this.booked_slots[primaryKey] = []
				this.booked_slots[primaryKey].push({
					personName: personName,
					email: email
				})
			}
			client.close();
		});
	});
}

const restoreAll = () => {
    restoreEmailPass()
    restoreGraveyardData()
    restoreEmailSlots()
    restoreBookedSlots()
}

// export all the functions
module.exports = {
    addEmailSlotToDB: addEmailSlotToDB,
    removeBookedSlotFromDB: removeBookedSlotFromDB,
    removeEmailSlotFromDB: removeEmailSlotFromDB,
    addSignUpToDB: addSignUpToDB,
    addGraveyardToDB: addGraveyardToDB,
    deleteGraveyardFromDB: deleteGraveyardFromDB,
    getRowFromGraveyardData: getRowFromGraveyardData,
    updateRowInDB: updateRowInDB, 
    addBookedSlotToDB: addBookedSlotToDB,
    restoreBookedSlots: restoreBookedSlots,
    restoreEmailPass: restoreEmailPass,
    restoreGraveyardData: restoreGraveyardData,
    restoreEmailSlots: restoreEmailSlots,
    restoreAll: restoreAll
}