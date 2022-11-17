//IMPORTS AND DEFAULTS
const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token, galleryChannelID, publicKey } = require('../config.json');
const dataEditTools = require('./DataEditor.js');
const counterTools = require('./countHelper.js');
const commands = require('./commands.js');

let startTime;

//CREATE DISCORD CLIENT
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

//EVENT HANDLING
client.once(Events.ClientReady, async () => {
	startTime = Date.now();
	console.log("Booting Up...")
	if (dataEditTools.getYoungTime() !== 0) {await counterTools.countYoungMelons(client);}
	else {await counterTools.countAllMelons(client);}
	console.log(`${(Date.now()-startTime)/1000} seconds elapsed.`);
	console.log('Ready!');
});
client.on(Events.MessageReactionAdd, (reaction, user) => {
  counterTools.reactChange(reaction, 1, user, galleryChannelID);
});
client.on(Events.MessageReactionRemove, (reaction, user) => {
  counterTools.reactChange(reaction, -1, user, galleryChannelID);
});
client.on(Events.MessageCreate, async message => {
	message = await message.fetch();
	if (dataEditTools.checkMessageHasImg(message)) {await dataEditTools.addPost(message);}
	dataEditTools.writeDataToFile();
});
client.on(Events.MessageDelete, async message => {
	if (dataEditTools.checkMessageHasImg(message, false)) {
		await dataEditTools.removePost(message);
	}
	dataEditTools.writeDataToFile();
});

client.login(token);
