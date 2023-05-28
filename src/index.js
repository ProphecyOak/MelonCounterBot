//IMPORTS AND DEFAULTS
const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token, galleryChannelID, publicKey } = require('../config.json');

//FOR TRACKING ELAPSED TIME
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
//ON STARTUP
client.once(Events.ClientReady, async () => {
	startTime = Date.now();
	console.log("Booting Up...")
	console.log(await dataEditTools.getYoungTime());
	if (await dataEditTools.getYoungTime() !== undefined) {await counterTools.checkYoungData(client);}
	else {await counterTools.countAllMelons(client);}
	console.log(`${(Date.now()-startTime)/1000} seconds elapsed.`);
	console.log('Ready!');
});
//ON MESSAGE REACT
client.on(Events.MessageReactionAdd, (reaction, user) => {
	//ADD MELON
});
//ON MESSAGE UNREACT
client.on(Events.MessageReactionRemove, (reaction, user) => {
	//SUBTRACT MELON
});
//ON POST
client.on(Events.MessageCreate, async message => {
	if (message.channelId !== galleryChannelID) {return;}
	//ADD POST TO POSTS AND SUCH
});
//ON DELETE POST
client.on(Events.MessageDelete, async message => {
	//IF ITS A POST, REMOVE IT
});
//ON COMMAND INTERACTION
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

//LOGIN THE CLIENT
client.login(token);
