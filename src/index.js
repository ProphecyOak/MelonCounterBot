//	--------    IMPORTS AND DEFAULTS    --------
const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token, galleryChannelID, publicKey } = require('../config.json');

const eventHandler = require("./eventHandler.js");
const mongoInterface = require("./mongoInterface.js");
const logHandler = require("./logHandler.js");

let startTime;

//	--------    CREATE DISCORD CLIENT    --------

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
});

//	--------    FETCH CLIENT COMMANDS    --------

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

//	--------    EVENT HANDLING    --------

//	Forum post created
client.on(Events.ThreadCreate, async thread => {
	// console.log("Event: Thread Added");
	if (thread.parentId === galleryChannelID) {
		await eventHandler.postCreation(thread, client);
	}
});

//	Forum post deleted
client.on(Events.ThreadDelete, async thread => {
	// console.log("Event: Thread Removed");
	if (thread.parentId === galleryChannelID) {
		await eventHandler.postDeletion(thread, client);
	}
});

//	Melon added to post
client.on(Events.MessageReactionAdd, async (reaction, user) => {
	// console.log("Event: Reaction Added");
	if (reaction.emoji.name === '🍉') {
		await eventHandler.melonAdded(reaction, user, client);
	}
});

//	Melon removed from post
client.on(Events.MessageReactionRemove, async (reaction, user) => {
	// console.log("Event: Reaction Removed");
	if (reaction.emoji.name === '🍉') {
		await eventHandler.melonRemoved(reaction, user, client);
	}
});

//	Slash command used
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

//	--------    LOGIN THE CLIENT    --------

client.once(Events.ClientReady, async () => {
	//Initialization steps
});

logHandler.logEvent("Booting Up...", logHandler.levels.STATUS);
client.login(token);
mongoInterface.login();
logHandler.logEvent("Ready!", logHandler.levels.STATUS);
