//IMPORTS AND DEFAULTS
const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token, galleryChannelID, messageYoungSize } = require('../config.json');
const dataEditTools = require('./DataEditor.js');

//EXPORTS
module.exports = {reactChange, countYoungMelons, countAllMelons}

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
  let userIDString = user.id.toString();
  if (reaction["_emoji"].name === "🍉") {dataEditTools.addReactionMelons(reaction, userIDString, reactSign);}
}

//Counts the melons back to the youngTime in melonData.
//countYoungMelons(client: Client)
async function countYoungMelons(client) {
	dataEditTools.wipeYoungData();
  let galleryChannel = await client.channels.fetch(galleryChannelID);
	await addMessages(galleryChannel, {messageCount:0, i:0, startTime: Date.now()})
	dataEditTools.writeDataToFile();
}

//Counts all the melons back to the beginning of the channel.
//countAllMelons(client: Client)
async function countAllMelons(client) {
	dataEditTools.setYoungTime(0);
	dataEditTools.wipeYoungData();
	dataEditTools.wipeOldData();
  let galleryChannelMessages = await lots_of_messages_getter(await client.channels.fetch(galleryChannelID));
	dataEditTools.writeDataToFile();
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
	for (const x of messages) {
		if (counts.i===messageYoungSize) {dataEditTools.setYoungTime(x.createdTimestamp);}
		let worked = await dataEditTools.checkMessageHasImg(x);
		counts.messageCount += 1;
		if (worked) {
			dataEditTools.addPost(x);
			await dataEditTools.addMessageMelons(x,false);
			counts.i += 1;
		}
    if (counts.messageCount % 25 === 0) {
      console.log(`Elapsed time: ${(Date.now()-counts.startTime)/1000}. ${counts.messageCount} messages read. ${counts.i} posts found.`)
    }
  }
	return counts;
}
