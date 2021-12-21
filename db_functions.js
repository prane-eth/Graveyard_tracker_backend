
const MongoClient = require('mongodb').MongoClient

this.graveyard_data = []
//   {name: 'Government graveyard',
//     pinCode: 400102, occupied: 10, vacancies: 20,
//     address: 'Bandivali, Mumbai rural, Maharastra, India',
//     updatedBy: 'dummy@gmail.com'
//   },
//   {name: 'Hospital graveyard',
//     pinCode: 421100, occupied: 12, vacancies: 30,
//     address: 'Ambivali, Mumbai rural, Maharastra, India',
//     updatedBy: 'dummy@gmail.com'
//   },
//   {name: 'Municipal Corporation Cemetery',
//     pinCode: 400053, occupied: 30, vacancies: 5,
//     address: 'Andheri, Mumbai rural, Maharastra, India',
//     updatedBy: 'dummy@gmail.com'
//   },
//   {name: 'NGO graveyard',
//     pinCode: 683541, occupied: 10, vacancies: 20,
//     address: 'Irapuram, Trivendrum rural, Kerala, India',
//     updatedBy: 'dummy@gmail.com'
//   },
//   {name: 'Church Cemetery',
//     pinCode: 400042, occupied: 12, vacancies: 22,
//     address: '4WMQ+W24, Damle Colony, Kanjurmarg East, Mumbai, Maharashtra, India',
//     updatedBy: 'dummy@gmail.com'
//   }
// ]
this.email_pass = {}
this.booked_slots = {}
this.email_slots = {}  // slots booked by email

var user = 'user1'
var pass = 'pass1234'
var dbname = 'myFirstDatabase'
var uri = 'mongodb+srv://' + user + ':' + pass
    + '@cluster0.nk3zq.mongodb.net/' + dbname
    + '?retryWrites=true&w=majority'

// restore email_pass from DB
const restoreEmailPass = () => {
    // console.log('restoring email_pass')
	var email_pass = {}
	MongoClient.connect(uri, function(err, client) {
		if (err) {
			console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
			return
		}
		// console.log('restoreEmailPass: Connected...');
		const collection = client.db("myFirstDatabase").collection("email_pass");
		collection.find({}).toArray(function(err, result) {
			if (err) {
				console.log(err);
				return
			} else if (result.length) {
                for (var row of result)
					email_pass[row.email] = row.password
			} else {
				console.log('restoreEmailPass: No document(s) found with defined "find" criteria!');
			}
			client.close();
		});
	});
	this.email_pass = email_pass
}

const changePasswordInDB = (email, password, res) => {
	// console.log('changing password in DB')
	MongoClient.connect(uri, function(err, client) {
		if (err) {
			console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
			return
		}
		// console.log('changePasswordInDB: Connected...');
		const collection = client.db("myFirstDatabase").collection("email_pass");
		collection.updateOne({email: email}, {$set: {password: password}}, function(err, result) {
			if (err) {
				console.log(err);
				return
			} else {
				console.log('changePasswordInDB: Password changed successfully!');
				// res.send('Password changed successfully!')
			}
			client.close();
		});
	});
}

// restore graveyard_data from DB
const restoreGraveyardData = () => {
    // console.log('restoring graveyard_data')
	var graveyard_data = []
	MongoClient.connect(uri, function(err, client) {
		if (err) {
			console.log('Error occurred while connecting to MongoDB Atlas...', err);
			return
		}
		// console.log('restoreGraveyardData: Connected...');
		const collection = client.db("myFirstDatabase").collection("graveyard_data");
		collection.find({}).toArray(function(err, result) {
			if (err) {
				console.log(err);
				return
			} else if (result.length) {
				// console.log('Found:', result);
				for (var row of result)
					graveyard_data.push(row)
			} else {
				console.log('restoreGraveyardData: No document(s) found with defined "find" criteria!');
			}
			client.close();
		});
	});
	this.graveyard_data = graveyard_data
}

const addEmailSlotToDB = (email, name, pinCode, personName, timestamp, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err) {
			res.status(200).send({ error: 'Error connecting to DB' });
			return
		}
		var db = client.db('myFirstDatabase');
		var collection = db.collection('email_slots');
		collection.insertOne({
			email: email,
			name: name,
			pinCode: pinCode,
			personName: personName,
			timestamp: timestamp
		}, function(err, result) {
			if (err) {
				console.log('Error inserting into DB')
				return
			}
			console.log("addEmailSlotToDB: done");
			client.close();
		});
	});
}

const restoreEmailSlots = () => {
    // console.log('restoring email_slots')
    var email_slots = {}
	MongoClient.connect(uri, function(err, client) {
		if (err) {
			console.log('Error connecting to DB')
			return
		}
		var db = client.db('myFirstDatabase');
		var collection = db.collection('email_slots');
		collection.find({}).toArray(function(err, result) {
			if (err) {
				console.log('Error getting data from DB')
				return
			}
			for (var row of result) {
				var email = row.email
				if (!email_slots[email])
					email_slots[email] = []
				email_slots[email].push({
					name: row.name, pinCode: row.pinCode,
					personName: row.personName, timestamp: row.timestamp
				})
			}
			client.close();
		});
	});
	this.email_slots = email_slots
}

const removeBookedSlotFromDB = (primaryKey, personName, email, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)	{
			console.log('Error connecting to DB')
			return
		}
		var db = client.db('myFirstDatabase');
		var collection = db.collection('booked_slots');
		collection.deleteOne({
			primaryKey: primaryKey,
			personName: personName,
			email: email
		}, function(err, result) {
			if (err)	{
				console.log('Error inserting into DB')
				return
			}
			console.log("removeBookedSlotFromDB: done");
			client.close();
		});
	});
}

const removeEmailSlotFromDB = (email, personName, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)	{
			console.log('Error connecting to DB')
			return
		}
		var db = client.db('myFirstDatabase');
		var collection = db.collection('email_slots');
		collection.deleteOne({ email: email, personName: personName }, function(err, result) {
			if (err)	{
				console.log('Error inserting into DB')
				return
			}
			console.log("removeEmailSlotFromDB: done");
			client.close();
		});
	});
}

const addSignUpToDB = (email, password, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)	{
			console.log('Error connecting to DB')
			return
		}
		var db = client.db('myFirstDatabase');
		var collection = db.collection('email_pass');
		collection.insertOne({ email: email, password: password }, function(err, result) {
			if (err)	{
				console.log('Error inserting into DB')
				return
			}
			console.log("addSignUpToDB: done");
			client.close();
		});
	});
}

const addGraveyardToDB = (name, pinCode, occupied, vacancies, address, mapLink, updatedBy, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)	{
			console.log('Error connecting to DB')
			return
		}
		var db = client.db('myFirstDatabase');
		var collection = db.collection('graveyard_data');
		collection.insertOne({
			name: name,
			pinCode: pinCode,
			occupied: occupied,
			vacancies: vacancies,
			address: address,
			mapLink: mapLink,
			updatedBy: updatedBy
		}, function(err, result) {
			if (err)	{
				console.log('Error inserting into DB')
				return
			}
			console.log("addGraveyardToDB: done");
			client.close();
		});
	});
}

const updateVacanciesInDB = (name, pinCode, occupied, vacancies, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)	{
			console.log('Error connecting to DB')
			return
		}
		var db = client.db('myFirstDatabase');
		var collection = db.collection('graveyard_data');
		collection.updateOne({ name: name, pinCode: pinCode },
			{ $set: { occupied: occupied, vacancies: vacancies } },
			function(err, result) {
				if (err)	{
					console.log('Error inserting into DB')
					return
				}
				console.log("updateVacanciesInDB: done");
				client.close();
			}
		);
	});
}

const deleteGraveyardFromDB = (name, pinCode, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)	{
			console.log('Error inserting into DB')
			res.status(200).send({ error: 'Error connecting to DB' });
			return
		}
		var db = client.db('myFirstDatabase');
		var collection = db.collection('graveyard_data');
		collection.deleteOne({ name: name, pinCode: pinCode }, function(err, result) {
			if (err)	{
				console.log('Error deleting from DB')
				return
			}
			console.log("deleteGraveyardFromDB: done");
			client.close();
		});
	});
}

// get row from graveyard_data
const getRowFromGraveyardData = (name, pinCode) => {
	for (var row of this.graveyard_data)
		if (row.name.toLowerCase() === name.toLowerCase() && row.pinCode == pinCode)
			return row
	return null
}

const updateRowInDB = (name, pinCode, occupied, vacancies, address, mapLink, updatedBy, res) => {
	var row = getRowFromGraveyardData(name, pinCode)
	name = row.name
	pinCode = row.pinCode
	if (!occupied)
		occupied = parseInt(row.occupied)
	if (!vacancies)
		vacancies = parseInt(row.vacancies)
	if (!address)
		address = row.address
	if (!mapLink)
		mapLink = row.mapLink
	if (!updatedBy)
		updatedBy = row.updatedBy
	deleteGraveyardFromDB(name, pinCode, res)
	addGraveyardToDB(name, pinCode, occupied, vacancies, address, mapLink, updatedBy, res)
}

const addBookedSlotToDB = (primaryKey, personName, email, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)
			return res.status(200).send({ error: 'Error connecting to DB' });
		var db = client.db('myFirstDatabase');
		var collection = db.collection('booked_slots');
		collection.insertOne({
			primaryKey: primaryKey,
			personName: personName,
			email: email
		}, function(err, result) {
			if (err)	{
				console.log('Error inserting into DB');
				return
			}
			console.log("addBookedSlotToDB: done");
			client.close();
		});
	});
}

const restoreBookedSlots = () => {
    // console.log("restoring booked slots");
	var booked_slots = []
	MongoClient.connect(uri, function(err, client) {
		if (err)
			return console.log('Error connecting to DB')
		var db = client.db('myFirstDatabase');
		var collection = db.collection('booked_slots');
		collection.find({}).toArray(function(err, result) {
			if (err)
				return console.log('Error getting data from DB')
			for (var row of result) {
				var primaryKey = row.primaryKey
				var personName = row.personName
				var email = row.email
				if (!booked_slots[primaryKey])
					booked_slots[primaryKey] = []
				booked_slots[primaryKey].push({
					personName: personName,
					email: email
				})
			}
			client.close();
		});
	});
	this.booked_slots = booked_slots
}

const restoreAll = () => {
    restoreEmailPass()
    restoreGraveyardData()
    restoreEmailSlots()
    restoreBookedSlots()
}

restoreAll()

// export all the functions
module.exports = {
    email_pass: this.email_pass,
    graveyard_data: this.graveyard_data,
    email_slots: this.email_slots,
    booked_slots: this.booked_slots,

    addEmailSlotToDB: addEmailSlotToDB,
    removeBookedSlotFromDB: removeBookedSlotFromDB,
    removeEmailSlotFromDB: removeEmailSlotFromDB,
    addSignUpToDB: addSignUpToDB,
    addGraveyardToDB: addGraveyardToDB,
    deleteGraveyardFromDB: deleteGraveyardFromDB,
    getRowFromGraveyardData: getRowFromGraveyardData,
    updateRowInDB: updateRowInDB, 
    addBookedSlotToDB: addBookedSlotToDB,
	updateVacanciesInDB: updateVacanciesInDB,
	changePasswordInDB: changePasswordInDB,
}

/*
https://cloud.mongodb.com/v2/6129c2d2b742310d77d14f18#clusters/connect?clusterId=Cluster0

Cmd to connect mongo
mongosh "mongodb+srv://cluster0.nk3zq.mongodb.net/myFirstDatabase" \
  --username user1 -p pass1234

db.test_apples.find().forEach(printjson)
*/