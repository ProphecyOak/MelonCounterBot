const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');
const melonData = require('./data.json');
let dataEditTools = require('./DataEditor.js');

const galleryChannelID = "1040269017048424509"
const messageYoungSize = 30;

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once(Events.ClientReady, async () => {
  await countYoungMelons();
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
	dataEditTools.printData();
  let galleryChannelMessages = await (await client.channels.fetch(galleryChannelID)).messages.fetch();
  let lastTime = melonData.updatedTime;
	let i = 0;
  for (let x of galleryChannelMessages.values()) {
		if (x.createdTimestamp<=dataEditTools.getYoungTime()) {break;}
		if (i===messageYoungSize) {
			dataEditTools.setYoungTime(x.createdTimestamp);
		}
		await dataEditTools.addMessageMelons(x,false);
		++i;
	}
	dataEditTools.writeDataToFile();
	dataEditTools.printData();
}

async function countAllMelons() {
	dataEditTools.setYoungTime(0);
	dataEditTools.wipeYoungData();
	dataEditTools.wipeOldData();
  let galleryChannelMessages = await (await client.channels.fetch(galleryChannelID)).messages.fetch();
  let lastTime = melonData.updatedTime;
	let i = 0;
  for (let x of galleryChannelMessages.values()) {
		if (i===messageYoungSize) {dataEditTools.setYoungTime(x.createdTimestamp);}
		dataEditTools.setFirstPost(x);
		await dataEditTools.addMessageMelons(x,false);
		++i;
	}
	dataEditTools.writeDataToFile();
}

function stringField(field) {
  let out = "";
  for (const key in melonData[field]) {
    out += "<@"+key+"> has "+field+" "+melonData[field][key].toString()+" melons.\n";
  };
  return out;
}

client.login(token);
