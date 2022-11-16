const fs = require('fs');
const { DiscordInteractions } = require("slash-commands");
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('../config.json');
const melonData = require('../data.json');
let dataEditTools = require('./DataEditor.js');

const galleryChannelID = "708950466746122321"
const messageYoungSize = 30;
let startTime;

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once(Events.ClientReady, async () => {
	startTime = Date.now();
  await countAllMelons();
	console.log(`${(Date.now()-startTime)/1000} seconds elapsed.`);
	console.log('Ready!');
});

client.on(Events.MessageReactionAdd, (reaction, user) => {
  reactChange(reaction, 1, user);
});
client.on(Events.MessageReactionRemove, (reaction, user) => {
  reactChange(reaction, -1, user);
});
client.on(Events.MessageCreate, async message => {
	message = await message.fetch()
	let hasImg = message.attachments.filter((key, val) => {
		return key.contentType === 'image/png';
	}).size;
	if (hasImg > 0) {
		await dataEditTools.addPost(message);
	}
	dataEditTools.writeDataToFile();
});
client.on(Events.MessageDelete, async message => {
	let hasImg = message.attachments.filter((key, val) => {
		return key.contentType === 'image/png';
	}).size;
	if (hasImg > 0) {
		await dataEditTools.removePost(message);
	}
	dataEditTools.writeDataToFile();
});

const readline = require('readline');
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

async function reactChange(reaction, reactSign, user) {
  if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
  if (reaction.message.channelId !== galleryChannelID) {return;}
  let userIDString = user.id.toString();
  if (reaction["_emoji"].name === "🍉") {dataEditTools.addReactionMelons(reaction, userIDString, reactSign);}
}

async function countYoungMelons() {
	dataEditTools.wipeYoungData();
  let galleryChannel = await client.channels.fetch(galleryChannelID);
	await addMessages(galleryChannel, {messageCount:0, i:0})
	dataEditTools.writeDataToFile();
}

async function countAllMelons() {
	dataEditTools.setYoungTime(0);
	dataEditTools.wipeYoungData();
	dataEditTools.wipeOldData();
  //let galleryChannelMessages = await (await client.channels.fetch(galleryChannelID)).messages.fetch();
	let galleryChannelMessages = await lots_of_messages_getter(await client.channels.fetch(galleryChannelID));
	dataEditTools.writeDataToFile();
}

async function lots_of_messages_getter(channel, limit = 1000) {
  let last_id;
	let counts = {messageCount:0, i:0}
  while (true) {
    const options = { limit: 100 };
    if (last_id) {options.before = last_id;}
		counts = await addMessages(channel, counts,options);
    last_id = counts.messageCollection.last().id;
    if (counts.messageCollection.size != 100 || counts.messageCount >= limit) {break;}
  }
}

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
		if ((counts.messageCount+1)%25===0) {console.log(`Elapsed: ${(Date.now()-startTime)/1000} ${counts.messageCount+1} messages read. ${counts.i} posts found.`);}
	}
	return counts;
}

client.login(token);
