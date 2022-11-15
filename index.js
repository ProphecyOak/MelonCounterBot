const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');
const melonData = require('./data.json');
let dataEditTools = require('./DataEditor.js');

const galleryChannelID = "708950466746122321"
const messageYoungSize = 30;

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once(Events.ClientReady, async () => {
  await countAllMelons();
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
  let galleryChannelMessages = await (await client.channels.fetch(galleryChannelID)).messages.fetch();
	let i = 0;
  for (let x of galleryChannelMessages.values()) {
		if (x.createdTimestamp<=dataEditTools.getYoungTime()) {break;}
		if (i===messageYoungSize) {
			dataEditTools.setYoungTime(x.createdTimestamp);
		}
		dataEditTools.addPost(x);
		await dataEditTools.addMessageMelons(x,false);
		++i;
	}
	dataEditTools.writeDataToFile();
}

async function countAllMelons() {
	dataEditTools.setYoungTime(0);
	dataEditTools.wipeYoungData();
	dataEditTools.wipeOldData();
  //let galleryChannelMessages = await (await client.channels.fetch(galleryChannelID)).messages.fetch();
	let galleryChannelMessages = await lots_of_messages_getter(await client.channels.fetch(galleryChannelID));
}

async function lots_of_messages_getter(channel, limit = 1000) {
  let last_id;
	let messageCount = 0;
	let i = 0;

  while (true) {
    const options = { limit: 100 };
    if (last_id) {options.before = last_id;}

		var messageCollection = await channel.messages.fetch(options);
    const messages = messageCollection.values();
		for (const x of messages) {
			if (i===messageYoungSize) {dataEditTools.setYoungTime(x.createdTimestamp);}
			let worked = await dataEditTools.checkMessageHasImg(x);
			messageCount += 1;
			if (worked) {
				dataEditTools.addPost(x);
				await dataEditTools.addMessageMelons(x,false);
				++i;
				dataEditTools.writeDataToFile();
				//console.log(messageCount.toString() + " messages have been read.\n" + "Recording post #" + i.toString() + " from " +
				//(new Date(x.createdTimestamp)).toString().slice(0,10) +
				//" created by: " + x.author.id.toString());
				//await askQuestion(">>>");
			}
			if ((messageCount+1)%25===0) {console.log(`${messageCount+1} messages read. ${i} posts found.`);}
		}
    last_id = messageCollection.last().id;

    if (messageCollection.size != 100 || messageCount >= limit) {break;}
  }
}

client.login(token);
