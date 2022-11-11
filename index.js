const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');
const melonData = require('./data.json');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once(Events.ClientReady, async () => {
	console.log('Ready!');
});

client.on(Events.MessageReactionAdd, (reaction, user) => {
  reactChange(reaction, 1, user);
});
client.on(Events.MessageReactionRemove, (reaction, user) => {
  reactChange(reaction, -1, user);
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
  let userIDString = user.id.toString();
  let creatorIDString = reaction.message.author.id.toString();
  if (reaction["_emoji"].name === "🍉") {
    melonData.Recieved[creatorIDString] = melonData.Recieved.hasOwnProperty(creatorIDString) ? melonData.Recieved[creatorIDString] + reactSign : reactSign;
    melonData.Awarded[userIDString] = melonData.Awarded.hasOwnProperty(userIDString) ? melonData.Awarded[userIDString] + reactSign : reactSign;
  }
  fs.writeFileSync('./data.json', JSON.stringify(melonData, null, 3));
  console.log(melonData);
}

client.login(token);
