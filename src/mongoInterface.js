const { mongoPassword } = require('../config.json');
const { MongoClient, ServerApiVersion } = require('mongodb');

//	--------    MELON CHANGES    --------

const uri = `mongodb+srv://melonBot:${mongoPassword}@melondata.jltseqr.mongodb.net/?retryWrites=true&w=majority&appName=MelonData`;
const client = new MongoClient(uri, {
    serverApi: {version: ServerApiVersion.v1, strict: true, deprecationErrors: true}
});
async function login() {
  try {
    await client.connect();
    await client.db("MelonCounting").command({ ping: 1 });
  } catch {
    throw("Failed to connect to MongoDB");
  }
}
const db = client.db("MelonCounting");

//	--------    USER CHANGES    --------

//  Modify user's melons, inserting a new user if necessary
async function changeMelonCounts(user, amnt, received) {
    const collection = db.collection("Users")
    const query = {"_id": {$eq: user.id}};
    const userDoc = {
        $set: {
            "username": user.username
        },
        $inc: {
            "melons_received": received ? amnt : 0,
            "melons_given": received ? 0 : amnt
        }
    }
    const result = collection.updateOne(query, userDoc, {upsert: true}).catch(error => {
        console.error("Error updating user's melons:\n%S",error);
    });
}

//  Modify user's post count, inserting a new user if necessary
async function changePostCount(user, amnt) {
    const collection = db.collection("Users")
    const query = {"_id": {$eq: user.id}};
    const userDoc = {
        $set: {
            "username": user.username
        },
        $inc: {
            "post_count": amnt
        }
    }
    const result = collection.updateOne(query, userDoc, {upsert: true}).catch(error => {
        console.error("Error updating user's post count:\n%S",error);
    });
}

module.exports = { login, changeMelonCounts, changePostCount };