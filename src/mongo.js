const { MongoClient, ServerApiVersion } = require('mongodb');
const { mongoUrl } = require('../config.json');
const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const db = client.db("Melons2");
const discTools = require("./disc.js");

module.exports = {addPost, removePost, dropAll};

//ADD POST TO POSTS COLLECTION
async function addPost(message) {
    message = await message.fetch(true); //Makes sure attachments are present.
    let nick = await discTools.getNick(message);
    let messageLinks = message.attachments.map(attachment => attachment.url);
    let messageDocument = {"_id":message.id,
                          "timestamp":new Date(message.createdTimestamp),
                          "Creator":nick,
                          "Images":messageLinks};
    await db.collection("Posts").insertOne(messageDocument);
    await db.collection("PostReactions").insertOne({"_id":message.id, "Melons":0});
    await addPostToUser(message, nick);
    console.log("Inserted new post from %s", nick);
}

//REMOVE POST FROM POSTS COLLECTION
async function removePost(message) {
    await db.collection("Posts").deleteOne({"timestamp":new Date(message.createdTimestamp)});
    await db.collection("PostReactions").deleteOne({"_id":message.id});
    await db.collection("Users").updateOne({"_id":message.author.id}, {$inc: {"PostCount":-1}});
}

//CHANGE MELONS IN REACTION COLLECTION

//MODIFY USER COLLECTION
async function addPostToUser(message, user) {
    await db.collection("Users").updateOne({"_id":message.author.id},
                                     {$set: {"Username": user}, $inc: {"PostCount":1}},
                                     {upsert:true});
}

//DROP ALL COLLECTIONS
async function dropAll() {
    db.collection("Posts").deleteMany({});
    db.collection("PostReactions").deleteMany({});
    db.collection("Users").deleteMany({});
}
