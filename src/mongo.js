const { MongoClient, ServerApiVersion } = require('mongodb');
const { mongoToken } = require('../config.json');
const url = "mongodb+srv://melonBot:"+mongoToken+"@mcfvt.rroycww.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const db = client.db("Melons");

module.exports = {insertSingleData, insertMultipleData, updateData, getYoungTime, setYoungTime, getSingleData, getMultipleData, operatorUpdateData, incrementData, addPostData, removePostData, drop}


//Inserts data into collection coll.
//insertData(coll: String, data: Object)
async function insertSingleData(coll, data) {
  const collection = db.collection(coll)
  collection.insertOne(data)
  .then(() => {
    //console.log("Inserted one")
  })
  .catch(error => {
    console.error("InsertSingle Error:\n%S",error);
  })
}

//Inserts data into collection coll.
//insertData(coll: String, data: [Object])
async function insertMultipleData(coll, data) {
  const collection = db.collection(coll)
  collection.insertMany(data)
  .then(() => {
    console.log("Inserted all")
  })
  .catch(error => {
    console.error("Bulk write error. Inserted %d of %d.", error.result.result.nInserted, data.length);
  })
}

//Updates data in collection coll.
//updateData(coll: String, find: Object, change: Object)
async function updateData(coll, find, change) {
  const collection = db.collection(coll)
  collection.updateOne(find, {$set: change}, {upsert: true})
  .then(() => {
    //console.log("Updated")
  })
  .catch(error => {
    console.error("Update Error:\n%S",error);
  })
}

async function getYoungTime(){
  let result = await getSingleData("YoungData", {"_id":"youngTime"})
  if (result === null) return undefined;
  return result.timestamp;
}

async function setYoungTime(timestamp){
  const collection = db.collection("YoungData");
  let result = await collection.updateOne({_id:"youngTime"}, {$set: {timestamp:timestamp}}, {upsert: true})
  console.log("Updated youngTime")
  return result;
}

async function getSingleData(coll, find){
  const collection = db.collection(coll);
  try{
    return await collection.findOne(find)
  }
  catch(error) {console.error("GetSingle Error:\n%S",error);}
}

async function getMultipleData(coll, find){
  const collection = db.collection(coll);
  try{
    return await collection.find(find);
  }
  catch(error) {console.error("GetMultiple Error:\n%S",error);}
}

//Uses mongoDB update operators to update data. Inserts if not exists.
//updateData(coll: String, find: Object, change: Object)
async function operatorUpdateData(coll, find, change, op) {
  const collection = db.collection(coll)
  switch (op){
    case "inc":
      change = {$inc: change};
      break;
    case "min":
      change = {$min: change};
      break;
    case "max":
      change = {$max: change};
      break;
    default:
      change = {$set: change};
      break;
  }

  collection.updateOne(find, change, {upsert: true})
  .then(() => {
    console.log("Updated with %s.", op);
  })
  .catch(error => {
    console.error("OpUpdate Error:\n%S", error);
  })
}

//Increments by the given value
//incrementData(coll: String, find: Object, change: Object)
async function incrementData(coll, find, change) {
  const collection = db.collection(coll)

  collection.updateOne(find, {$inc: change}, {upsert: true})
  .then(() => {
    //console.log("Incemented in %s", coll);
  })
  .catch(error => {
    console.error("Increment Error:\n%S");
  })
}

//Adds post data to the given collection
async function addPostData(coll, user, melons, time){
  const collection = db.collection(coll)

  collection.updateOne({"_id": user}, {$inc: {"received": melons, "count": 1}, $min: {"first": time}}, {upsert: true})
  .then(() => {
    //console.log("Added post");
  })
  .catch(error => {
    console.error("AddPost Error:\n%S",error);
  })
}

//Removes post data from the given collection
async function removePostData(coll, user, melons){
  const collection = db.collection(coll)

  collection.updateOne({"_id": user}, {$inc: {"received": -melons, "count": -1}})
  .then(() => {
    console.log("Removed post");
  })
  .catch(error => {
    console.error("RemovePost Error:\n%S",error);
  })
}

//Deletes the given collection
async function drop(coll){
  const collection = db.collection(coll);
  try{
    let result = await collection.drop()
    console.log("Droped %s", coll);
    return result;
  }
  catch(error){
    console.error("Drop Error:\n%S",error);
  }
}

