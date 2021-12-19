
const MongoClient = require('mongodb').MongoClient

var graveyard_data = [
  {name: 'Government graveyard',
    pinCode: 400102, occupied: 10, vacancies: 20,
    address: 'Bandivali, Mumbai rural, Maharastra, India',
    updatedBy: 'dummy@gmail.com'
  },
  {name: 'Hospital graveyard',
    pinCode: 421100, occupied: 12, vacancies: 30,
    address: 'Ambivali, Mumbai rural, Maharastra, India',
    updatedBy: 'dummy@gmail.com'
  },
  {name: 'Municipal Corporation Cemetery',
    pinCode: 400053, occupied: 30, vacancies: 5,
    address: 'Andheri, Mumbai rural, Maharastra, India',
    updatedBy: 'dummy@gmail.com'
  },
  {name: 'NGO graveyard',
    pinCode: 683541, occupied: 10, vacancies: 20,
    address: 'Irapuram, Trivendrum rural, Kerala, India',
    updatedBy: 'dummy@gmail.com'
  },
  {name: 'Church Cemetery',
    pinCode: 400042, occupied: 12, vacancies: 22,
    address: '4WMQ+W24, Damle Colony, Kanjurmarg East, Mumbai, Maharashtra, India',
    updatedBy: 'dummy@gmail.com'
  }
]
let email_pass = {}
let booked_slots = {}
let email_slots = {}  // slots booked by email

var user = 'user1'
var pass = 'pass1234'
var uri = 'mongodb+srv://' + user + ':' + pass
    + '@cluster0.nk3zq.mongodb.net/myFirstDatabase'
    + '?retryWrites=true&w=majority';

// restore email_pass from DB
const restoreEmailPass = () => {
    console.log('restoring email_pass')
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
                for (var row of result)
                    email_pass[row.email] = row.password
                console.log(email_pass)
			} else {
				console.log('restoreEmailPass: No document(s) found with defined "find" criteria!');
			}
			client.close();
		});
	});
}

// restore graveyard_data from DB
const restoreGraveyardData = () => {
    console.log('restoring graveyard_data')
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
				graveyard_data = result
				console.log('graveyard_data restored')
			} else {
				console.log('restoreGraveyardData: No document(s) found with defined "find" criteria!');
			}
			client.close();
		});
	});
}

const addEmailSlotToDB = (email, name, pinCode, personName, timestamp, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)
			res.status(200).send({ error: 'Error connecting to DB' });
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
				res.status(200).send({ error: 'Error inserting into DB' });
			console.log("row inserted");
			client.close();
		});
	});
}

const restoreEmailSlots = () => {
    console.log('restoring email_slots')
    email_slots = {}  // TODO: change method to clear values
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
				if (!email_slots[email])
					email_slots[email] = []
				email_slots[email].push({
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

const removeEmailSlotFromDB = (email, personName, res) => {
	MongoClient.connect(uri, function(err, client) {
		if (err)
			res.status(200).send({ error: 'Error connecting to DB' });
		var db = client.db('myFirstDatabase');
		var collection = db.collection('email_slots');
		collection.deleteOne({ email: email, personName: personName }, function(err, result) {
			if (err)
				res.status(200).send({ error: 'Error inserting into DB' });
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
		collection.insertOne({ email: email, password: password }, function(err, result) {
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

// get row from graveyard_data
const getRowFromGraveyardData = (name, pinCode) => {
	for (var row of graveyard_data)
		if (row.name == name && row.pinCode == pinCode)
			return row
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
			res.status(200).send({ error: 'Error connecting to DB' });
		var db = client.db('myFirstDatabase');
		var collection = db.collection('booked_slots');
		collection.insertOne({
			primaryKey: primaryKey,
			personName: personName,
			email: email
		}, function(err, result) {
			if (err)
				res.status(200).send({ error: 'Error inserting into DB' });
			console.log("row inserted");
			client.close();
		});
	});
}

const restoreBookedSlots = () => {
    console.log("restoring booked slots");
	booked_slots = []  // TODO: change method to clear values
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
}

const restoreAll = () => {
    restoreEmailPass()
    restoreGraveyardData()
    restoreEmailSlots()
    restoreBookedSlots()
}

// export all the functions
module.exports = {
    email_pass: email_pass,
    graveyard_data: graveyard_data,
    email_slots: email_slots,
    booked_slots: booked_slots,

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

/*
https://cloud.mongodb.com/v2/6129c2d2b742310d77d14f18#clusters/connect?clusterId=Cluster0

Cmd to connect mongo
mongosh "mongodb+srv://cluster0.nk3zq.mongodb.net/myFirstDatabase" \
  --username user1 -p pass1234

db.test_apples.find().forEach(printjson)
*/