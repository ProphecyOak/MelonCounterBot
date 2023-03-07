//IMPORTS AND DEFAULTS
const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token, galleryChannelID, messageYoungSize } = require('../config.json');
const dataEditTools = require('./DataEditor.js');
const  db = require("./mongo.js");
const { isNullOrUndefined } = require('util');

//EXPORTS
module.exports = {reactChange, checkYoungData, countAllMelons, checkIfRebuild}

//Records a change in melons based on a heard reaction event.
//reactChange(reaction: MessageReaction, reactSign: number, user: User, channelID: String)
async function reactChange(reaction, reactSign, user, channelID) {
  if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
  if (reaction.message.channelId !== channelID) {return;}
  if (reaction["_emoji"].name === "🍉") {dataEditTools.addReactionMelons(reaction, user.id, reactSign);}
}

//Checks consistency of current Data and updates MainData if needed
async function checkYoungData(client) {
	let localYoungData = await rebuildYoungData(client, await db.getYoungTime(), false);
	let yd = await db.getMultipleData("YoungData",{timestamp: {$exists : false}});
	let lastYoungData = await yd.toArray();

	for (d of lastYoungData){
		let local = localYoungData[d._id];
		if (local === null || local === undefined){
			db.incrementData("MainData", {_id: d._id}, {received: -d.received, awarded:-d.awarded, count:-d.count});
		} else {
			db.incrementData("MainData", {_id: d._id}, {received: local.received-d.received, awarded:local.awarded-d.awarded, count:local.count-d.count});
			localYoungData[d._id].done = true;
		}
	}
	for (l in localYoungData){
		let local = localYoungData[l]
		if(local.done) continue;
		db.incrementData("MainData", {_id:l},{received:local.received, awarded:local.awarded, count:local.count});
		db.operatorUpdateData("MainData", {_id:l}, {first:local.first}, "min");

	}
	await rebuildYoungData(client, Date.now()-2629800000, true);
}

//Checks if youngTime is older than 1 month + 1 day. Rebuilds YoungData if true
async function checkIfRebuild(client){
	if(Date.now() - await db.getYoungTime() > 2716200000){
		console.log("YoungData died of old age")
		await rebuildYoungData(client, Date.now()-2629800000, true);
	}
}

async function rebuildYoungData(client, youngTime, save = false){
	let localYoungData = {};
	localYoungData = await fetchYoungMessages(await client.channels.fetch(galleryChannelID), localYoungData, youngTime);
	if(save){
		await dataEditTools.wipeYoungData();
		let toWrite = []
		for (a in localYoungData){
			toWrite.push({_id: a, received:localYoungData[a].received, awarded:localYoungData[a].awarded, count:localYoungData[a].count, first:localYoungData[a].first})
		}
		db.insertMultipleData("YoungData", toWrite);
		await db.setYoungTime(youngTime);

	}
	return localYoungData;
}

async function fetchYoungMessages(channel, localYoungData, youngTime, limit = 1000){

	let last_id;
	while (true) {
		const options = { limit: 100, cache:true };
		if (last_id) {options.before = last_id;}
		const messageCollection = await channel.messages.fetch(options)
		const messages = messageCollection.values();

		let posts = [];
		for (const x of messages) {
			if (x.createdTimestamp < youngTime) break;
			let worked = await dataEditTools.checkMessageHasImg(x);
			if (worked) {
				posts.push(x)
			}
		}
		console.log("Found %d young posts", posts.length)
		last_id = messageCollection.last().id;
		localYoungData = await addToLocalYoungData(posts, localYoungData);
    	if (messageCollection.size != 100 || messageCollection.last().createdTimestamp < youngTime) {break;}
 	}
	return localYoungData;
}

async function addToLocalYoungData(posts, localYoungData){
	for(p of posts){
		let author = p.author.id;
		let melonAdders = await dataEditTools.getMelonAdders(p, true);
		let melons = 0;
		let current;

		for (m of melonAdders){
			current = localYoungData[m];
			if(current === null || current === undefined){
			localYoungData[m] = {received:0, awarded:1, count:0, first:Number.MAX_SAFE_INTEGER};
			} else {
			localYoungData[m] = {received:current.received, awarded: current.awarded +1, count:current.count, first:current.first};
			}
			melons++;
		}
		current = localYoungData[author];
		if(current === null || current === undefined){
			localYoungData[author] = {received:melons, awarded:0, count:1, first:p.createdTimestamp};
		} else {
			let first = current.first < p.createdTimestamp ? current.first : p.createdTimestamp;
			localYoungData[author] = {received:current.received + melons, awarded: current.awarded, count:current.count +1, first:first};
		}
	}
	return localYoungData;
}

//Counts all the melons back to the beginning of the channel.
//countAllMelons(client: Client)
async function countAllMelons(client) {
	await dataEditTools.wipeMainData();
  	lots_of_messages_getter(await client.channels.fetch(galleryChannelID));
	await rebuildYoungData(client, Date.now()-2629800000, true);

}

//Continues to fetch old messages and add them to melonData.
//lots_of_messages_getter(channel: ChannelManager, limit: number)
async function lots_of_messages_getter(channel, limit = 1000) {
  let last_id;
	let counts = {messageCount:0, i:0, startTime: Date.now()}
  while (true) {
    const options = { limit: 100, cache:true };
    if (last_id) {options.before = last_id;}
		counts = await addMessages(channel, counts, options);
    last_id = counts.messageCollection.last().id;
    if (counts.messageCollection.size != 100 || counts.messageCount >= limit) {break;}
  }
}

//Adds all of the messages from a single fetch to melonData.
//addMessages(channel: channelManager, counts: {number, number}, options: {number, String}): {number, number}
async function addMessages(channel, counts, options = {}) {
	counts.messageCollection = await channel.messages.fetch(options);
	const messages = counts.messageCollection.values();
	let posts = [];
	for (const x of messages) {
		let worked = await dataEditTools.checkMessageHasImg(x);
		counts.messageCount += 1;
		if (worked) {
			posts.push(x)
			counts.i += 1;
		}
		if (counts.messageCount % 25 === 0) {
		console.log(`Elapsed time: ${(Date.now()-counts.startTime)/1000}. ${counts.messageCount} messages read. ${counts.i} posts found.`)
		}
  	}
	console.log("Found %d posts.", posts.length);
	dataEditTools.addPosts(posts);
	return counts;
}
