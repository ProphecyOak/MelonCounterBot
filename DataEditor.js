const melonData = require('./data.json');
const fs = require('fs');

//Takes in a message and adds all of the melons on it to the data.
//addMessageMelons(message: Message)
async function addMessageMelons(message, write=true) {
  let meloners = message.reactions.resolve("🍉");
  if (meloners === null) {return;}
  let melonAdders = (await meloners.users.fetch()).keys();
  for (const user of melonAdders) {
    let out = manipulateMelons(message.author.id.toString(),user.toString(),message.createdTimestamp,1);
  }
  if (write) {writeDataToFile();}
}

//Takes in a reaction and adds or subtracts that melon from the data.
//addReactionMelons(reaction: MessageReaction, user: String, amount: number)
async function addReactionMelons(reaction, user, amount) {
  manipulateMelons(reaction.message.author.id.toString(), user, reaction.message.createdTimestamp, amount);
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

//Sets young time for determining message age.
//setYoungTime(timeStamp: number)
function setYoungTime(timeStamp) {melonData.youngTime = timeStamp;}
function getYoungTime() {return melonData.youngTime;}

function wipeYoungData() {melonData.young = {"received":{},"awarded":{}};}
function wipeOldData() {melonData.old = {"received":{},"awarded":{}};}

function printData() {console.log(melonData);}

//Writes the current melonData to the data.json file with spacing of 2
//writeDataToFile()
function writeDataToFile() {
  fs.writeFileSync('./data.json', JSON.stringify(melonData, null, 2));
}

module.exports = {
  "addMessageMelons":addMessageMelons,
  "addReactionMelons":addReactionMelons,
  "wipeYoungData":wipeYoungData,
  "wipeOldData":wipeOldData,
  "setYoungTime":setYoungTime,
  "getYoungTime":getYoungTime,
  "printData":printData,
  "writeDataToFile":writeDataToFile,
  "melonData": melonData
}