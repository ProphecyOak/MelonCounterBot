const { dataAddress } = require("../config.json");
const melonData = require('../data.json');
const fs = require('fs');

module.exports = {addMessageMelons, addReactionMelons, removeReactions, wipeYoungData, wipeOldData,
  setYoungTime, getYoungTime, printData, writeDataToFile, melonData, setFirstPost, addPost,
  removePost, checkMessageHasImg
}

//checkMessageHasImg(message): boolean
async function checkMessageHasImg(message, fetchIt = true) {
  let meloners = message.reactions.resolve("🍉");
  if (fetchIt) {message = await message.fetch(false);}
  return meloners !== null || message.attachments.filter((key, val) => {return key.contentType === 'image/png';}).size !== 0;
}

//Takes in a message and adds all of the melons on it to the data.
//addMessageMelons(message: Message)
async function addMessageMelons(message, write=true, amount=1, fetchIt=true) {
  let meloners = message.reactions.resolve("🍉");
  if (meloners === null) {return false;}
  let melonAdders;
  if (fetchIt) {
    melonAdders = (await meloners.users.fetch()).keys();
  } else {
    melonAdders = meloners.users.cache.keys();
  }
  for (const user of melonAdders) {
    let out = manipulateMelons(message.author.id.toString(),user.toString(),message.createdTimestamp,amount);
  }
  if (write) {writeDataToFile();}
  return true;
}

//Subtracts melons based on deleted message's reactions.
//removeReactions(message: Message)
async function removeReactions(message) {
  addMessageMelons(message, true, -1, false);
}

//Takes in a reaction and adds or subtracts that melon from the data.
//addReactionMelons(reaction: MessageReaction, user: String, amount: number)
async function addReactionMelons(reaction, user, amount) {
  manipulateMelons(reaction.message.author.id.toString(), user, reaction.message.createdTimestamp, amount);
  writeDataToFile();
}

//Takes in a number of melons, an awardee, an awarder, and time of message.
//manipulateMelons(creator: String, user: String, timestamp: number, amount: number)
function manipulateMelons(creator, user, timestamp, amount) {
  //Manipulate long data if timestamp of message is earlier than rolling updated time.
  //Otherwise manipulate short data.
  return (melonData.youngTime >= timestamp) ? addMelonData("old", creator, user, amount) : addMelonData("young", creator, user, amount);
}

//Manipulates field if it exists, and otherwise creates field.
//addMelonData(age: String, creator: String, user: String, amount: number)
function addMelonData(age, creator, user, amount) {
  //Edit received for creator
  if (melonData[age]["received"].hasOwnProperty(creator)) {melonData[age]["received"][creator] += amount;
  } else {melonData[age]["received"][creator] = amount;}
  //Edit awarded for reacter
  if (melonData[age]["awarded"].hasOwnProperty(user)) {melonData[age]["awarded"][user] += amount;
  } else {melonData[age]["awarded"][user] = amount;}
}

//Modifies first post recorded.
//setFirstPost(message: Message)
function setFirstPost(message) {
  melonData["firstPost"][message.author.id.toString()] = message.createdTimestamp;
}

//increments post count.
//addPost(message: Message)
async function addPost(message) {
  let age = message.createdTimestamp <= melonData.youngTime ? "old" : "young";
  let creator = message.author.id.toString();

  if (melonData[age]["postCount"].hasOwnProperty(creator)) {melonData[age].postCount[creator] += 1;}
  else {melonData[age].postCount[creator] = 1;}

  if (!melonData.firstPost.hasOwnProperty(creator) || message.createdTimestamp <= melonData.firstPost[creator]) {
    melonData.firstPost[creator] = message.createdTimestamp;
  }
}

//decrements post count.
//removePost(message: Message)
async function removePost(message) {
  await removeReactions(message);
  let age = message.createdTimestamp <= melonData.youngTime ? "old" : "young";
  let creator = message.author.id.toString();
  melonData[age].postCount[creator] -= 1;
  //Implement: remove melons from givers and recievers of message.

  //Implement: if firstPost should be removed when first post is deleted.
  //As currently implemented, the next first post wont replace it which is problematic.
  //Would only be fixed on next fullCount or if next first message is in youngMessages, at next youngCount
  //if (message.createdTimestamp===melonData.firstPost[creator]) {delete melonData.firstPost[creator];}
}

//Sets young time for determining message age.
//setYoungTime(timeStamp: number)
function setYoungTime(timeStamp) {melonData.youngTime = timeStamp;}
function getYoungTime() {return melonData.youngTime;}

function wipeYoungData() {melonData.young = {"received": {},"awarded": {},"postCount": {}};}
function wipeOldData() {melonData.old = {"received": {},"awarded": {},"postCount": {}};}

function printData() {console.log(melonData);}

//Writes the current melonData to the data.json file with spacing of 2
//writeDataToFile()
function writeDataToFile() {
  fs.writeFileSync(dataAddress, JSON.stringify(melonData, null, 2));
  //console.log("Data Written to File!");
}
