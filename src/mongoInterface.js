const { mongoPassword } = require('../config.json');
const { MongoClient, ServerApiVersion } = require('mongodb');
const logHandler = require('./logHandler');

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

async function dropAll(collection) {
    db.collection(collection).deleteMany({});
}

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
    const result = await collection.updateOne(query, userDoc, {upsert: true}).catch(error => {
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
    const result = await collection.updateOne(query, userDoc, {upsert: true}).catch(error => {
        console.error("Error updating user's post count:\n%S",error);
    });
}

//	--------    POST CHANGES    --------

//  Add post to the posts collection
async function addPost(post, postAuthor) {
    const collection = db.collection("Posts");
    const postID = post.id;
    const postDate = post.createdAt;
    await collection.insertOne({
        "_id":postID,
        "creation-time": postDate,
        "author": postAuthor.username,
        "authorID": postAuthor.id
    });
}

//  Remove post to the posts collection
async function removePost(post) {
    const collection = db.collection("Posts");
    const postID = post.id;
    await collection.deleteOne({$eq: {"_id":postID}});
}

//	--------    USER VIEWING    --------

//  Grab the record for a given user
async function getUserDoc(user) {
    const result = await db.collection("Users").find({"_id": {$eq: user.id}}).toArray();
    return result[0];
}

module.exports = {
    login,
    dropAll,
    changeMelonCounts,
    changePostCount,
    addPost,
    removePost,
    getUserDoc
};