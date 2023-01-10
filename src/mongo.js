const { MongoClient, ServerApiVersion } = require('mongodb');
const { mongoToken } = require('../config.json');
const url = "mongodb+srv://melonBot:"+mongoToken+"@melondata.jltseqr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//Inserts data into collection coll.
//insertData(coll: String, data: Object)
async function insertData(coll, data) {
  await  client.connect((err, db) => {
    if (err) {throw err;}
    let collection = db.db("Melons").collection(coll);
    collection.insertOne(data, (err, res) => {
      if (err) {throw err;}
      console.log("Data Entered.");
      db.close();
    });
  });
}

//Updates data in collection coll.
//updateData(coll: String, find: Object, change: Object)
async function updateData(coll, find, change) {
  await  client.connect((err, db) => {
    if (err) {throw err;}
    let collection = db.db("Melons").collection(coll);
    collection.updateOne(find, {$set:change}, (err, res) => {
      if (err) {throw err;}
      console.log("Data Updated.");
      db.close();
    });
  });
}

//insertData("Users",{"id":2222,"name":"stuff"});
updateData("Users",{"id":2222},{"name":"different"});
