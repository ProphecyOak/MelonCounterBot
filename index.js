const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');
const melonData = require('./data.json');

const galleryChannelID = "1040269017048424509"

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once(Events.ClientReady, async () => {
  await countAllMelons();
  console.log(melonData);
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
  if (reaction.message.channelId !== galleryChannelID) {return;}
  let userIDString = user.id.toString();
  let creatorIDString = reaction.message.author.id.toString();
  if (reaction["_emoji"].name === "🍉") {
    melonData.received[creatorIDString] = melonData.received.hasOwnProperty(creatorIDString) ? melonData.received[creatorIDString] + reactSign : reactSign;
    melonData.awarded[userIDString] = melonData.awarded.hasOwnProperty(userIDString) ? melonData.awarded[userIDString] + reactSign : reactSign;
    updateMelonData();
  }
}

async function countAllMelons() {
  let galleryChannelMessages = await (await client.channels.fetch(galleryChannelID)).messages.fetch();
  let lastTime = melonData.updatedTime;
  for (let x of galleryChannelMessages.values()) {
    if (x.createdTimestamp < melonData.updatedTime) {return;}
    try {
      let reactions = await x.reactions.resolve("🍉").users.fetch();
      let creatorIDString = x.author.id.toString();
      melonData.received[creatorIDString] = melonData.received.hasOwnProperty(creatorIDString) ? melonData.received[creatorIDString] + reactions.size : reactions.size;
      reactions.each((reaction,userIDString,a)=>{
        melonData.awarded[userIDString] = melonData.awarded.hasOwnProperty(userIDString) ? melonData.awarded[userIDString] + 1 : 1;
      });
      console.log("Message with melon reaction from "+creatorIDString+" with "+reactions.size+" melons");
    } catch {}
  }
  updateMelonData();
}

function updateMelonData() {
  melonData.updatedTime = Date.now();
  fs.writeFileSync('./data.json', JSON.stringify(melonData, null, 2));
}

function stringField(field) {
  let out = "";
  for (const key in melonData[field]) {
    out += "<@"+key+"> has "+field+" "+melonData[field][key].toString()+" melons.\n";
  };
  return out;
}

client.login(token);
