const { dataAddress } = require("../config.json");
const  db = require("./mongo.js");



module.exports = {checkMessageIsPost, addReactionMelons, removePost, getYoungTime,
wipeMainData, wipeYoungData, addPost, addPosts, getMelonAdders
}

//checkMessageIsPost(message): boolean
async function checkMessageIsPost(message, fetchIt = true) {
  let meloners = message.reactions.resolve("🍉");
  if (fetchIt) {message = await message.fetch(false);}
  return meloners !== null || message.attachments.filter((key, val) => {return key.contentType === 'image/png';}).size !== 0;
}

//checkMessageHassImage(message): boolean
async function checkMessageHasImage(message) {
  message = await message.fetch(false)
  return message.attachments.filter((key, val) => {return key.contentType === 'image/png';}).size !== 0;
}

//Takes in a reaction and adds or subtracts that melon from the data.
//addReactionMelons(reaction: MessageReaction, user: String, amount: number)
async function addReactionMelons(reaction, user, amount) {
  let author = reaction.message.author.id
  let young = reaction.message.createdTimestamp > await getYoungTime();
  
  //Check if this removes or adds a post
  let hasImage = await checkMessageHasImage(reaction.message);
  let countAdjustment = 0;
  let melonAdders = await getMelonAdders(reaction.message, true);
  if (melonAdders === [] || melonAdders === undefined || melonAdders === null) {
    countAdjustment = hasImage? 0 : -1
  } else {
    melonAdders.next();
    countAdjustment = melonAdders.next().done ? (amount == -1 ? 0 : (hasImage ? 0 : 1)) : 0;
  }

  console.log(countAdjustment);
  db.incrementData("MainData", {"_id": user}, {"awarded": amount});
  db.incrementData("MainData", {"_id": author}, {"received": amount, "count": countAdjustment});
  if(young){
    db.incrementData("YoungData", {"_id": user}, {"awarded": amount});
    db.incrementData("YoungData", {"_id": author}, {"received": amount, "count": countAdjustment});
  }
}

//decrements post count.
//removePost(message: Message)
async function removePost(message) {
  let young = message.createdTimestamp > await getYoungTime();
  let melonAdders = await getMelonAdders(message, false);
  if (melonAdders === [] || melonAdders === undefined || melonAdders === null) return;
  let melons = 0;
  for (const m of melonAdders){
    db.incrementData("MainData", {"_id": m}, {"awarded": -1});
    if(young) db.incrementData("YoungData", {"_id": m}, {"awarded": -1});
    melons++;
  }
  //Doesn't modify first post date. Unlikely removed is first post. Not fatal if it is.
  db.removePostData("MainData", message.author.id, melons);
  if(young) db.removePostData("YoungData", message.author.id, melons);
}

async function getYoungTime() {return db.getYoungTime();}

function wipeYoungData() {return db.drop("YoungData")}
function wipeMainData() {return db.drop("MainData")}

//adds a new Post
async function addPost (post){
  db.addPostData("YoungData", post.author, 0, post.createdTimestamp);
  db.addPostData("MainData", post.author, 0, post.createdTimestamp);
}

//add full recount posts to MainData
async function addPosts (posts){
  for (const p of posts){
      let melonAdders = await getMelonAdders(p, true);
      if (melonAdders === [] || melonAdders === undefined || melonAdders === null) continue;
      let melons = 0
      for (const m of melonAdders){
        db.incrementData("MainData", {"_id": m}, {"awarded": 1});
        melons++;
      }
      db.addPostData("MainData", p.author, melons, p.createdTimestamp);
  }
}

async function getMelonAdders(message, fetchIt=true) {
  let meloners = message.reactions.resolve("🍉");
  if (meloners === null) {return null}
  let melonAdders;
  if (fetchIt) {
    melonAdders = (await meloners.users.fetch()).keys();
  } else {
    melonAdders = meloners.users.cache.keys();
  }
  return melonAdders;
}
