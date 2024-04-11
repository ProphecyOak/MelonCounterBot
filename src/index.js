//IMPORTS AND DEFAULTS
const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token, galleryChannelID, publicKey } = require('../config.json');

const eventHandler = require("./eventHandler.js");

let startTime;

//CREATE DISCORD CLIENT
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

//FETCHING CLIENT COMMANDS
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

//EVENT HANDLING
client.once(Events.ClientReady, async () => {
	startTime = Date.now();
	console.log("Booting Up...")
	// console.log(await dataEditTools.getYoungTime());
	// if (await dataEditTools.getYoungTime() !== undefined) {await counterTools.checkYoungData(client);}
	// else {await counterTools.countAllMelons(client);}
	// console.log(`${(Date.now()-startTime)/1000} seconds elapsed.`);
	console.log('Ready!');
});

//	ON CREATE FORUM POST
client.on(Events.ThreadCreate, async thread => {
	if (thread.parentId === galleryChannelID) {
		await eventHandler.threadCreation(thread, client);
	}
});

//	ON DELETE FORUM POST
client.on(Events.ThreadDelete, async thread => {
	if (thread.parentId === galleryChannelID) {
		await eventHandler.threadDeletion(thread, client);
	}
});

// SLASH COMMAND
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {await command.execute(interaction);}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


// OLD EVENT HANDLING ----- REMOVED FOR REMAKE TO USE THE FORUM CHANNEL
// client.on(Events.MessageReactionAdd, (reaction, user) => {
//   counterTools.reactChange(reaction, 1, user, galleryChannelID);
// });
// client.on(Events.MessageReactionRemove, (reaction, user) => {
//   counterTools.reactChange(reaction, -1, user, galleryChannelID);
// });
// client.on(Events.MessageCreate, async message => {
// 	if (message.channelId !== galleryChannelID) {return;}
// 	counterTools.checkIfRebuild(client); //Check on message if its time to build new YoungData
// 	message = await message.fetch();
// 	if (await dataEditTools.checkMessageHasImg(message)) {await dataEditTools.addPost(message);}
// });
// client.on(Events.MessageDelete, async message => {
// 	if (await dataEditTools.checkMessageHasImg(message, false)) {
// 		await dataEditTools.removePost(message);
// 	}
// });


//LOGIN THE CLIENT
client.login(token);
