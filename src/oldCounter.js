const { galleryChannelID, oldGalleryChannelID, guildID } = require('../config.json');
const logHandler = require("./logHandler.js");
const eventHandler = require("./eventHandler.js");
const mongoInterface = require("./mongoInterface.js");

async function countAllFresh(client) {
    logHandler.logEvent("Beginning a full recount.", logHandler.levels.COUNTER);
    await mongoInterface.dropAll("Users");
    //const oldResults = await countOldGallery(client);
    const newResults = await countNewGallery(client);
    //logHandler.logEvent(`Full recount complete. Found a total of ${oldResults.i} posts in ${oldResults.messageCount} messages.`, logHandler.levels.COUNTER);
}

//	--------    COUNT THE NEW GALLERY    --------

async function countNewGallery(client) {
    const galleryForum = (await (await client.guilds.fetch(guildID)).channels.fetch(galleryChannelID));
    const options = { "limit":100, "cache":true};
    const threads = (await galleryForum.threads.fetch(options)).threads;
    console.log(threads.size);
}

//	--------    COUNT THE OLD GALLERY    --------

async function checkMessageHasImg(message, fetchIt = true) {
    let meloners = message.reactions.resolve("🍉");
    if (fetchIt) message = await message.fetch(false);
    return meloners !== null || message.attachments.filter((key, val) => key.contentType === 'image/png').size !== 0;
}

async function countOldGallery(client, limit=-1) {
    const channel = await client.channels.fetch(oldGalleryChannelID);
    let last_id;
    let counts = {"messageCount":0, "i":0, "startTime": Date.now()};
    while (true) {
        const options = { "limit": 100, "cache":true };
        if (last_id) options.before = last_id;
        counts = await addMessages(channel, counts, client, options);
        last_id = counts.messageCollection.last().id;
        if (counts.messageCollection.size != 100) break;
        if (limit != -1 && counts.messageCount >= limit) break;
    }
    return counts;
}

async function addMessages(channel, counts, client, options = {}) {
	counts.messageCollection = await channel.messages.fetch(options);
	const messages = counts.messageCollection.values();
	let posts = [];
	for (const x of messages) {
		let worked = await checkMessageHasImg(x);
		counts.messageCount += 1;
		if (worked) {
			posts.push(x);
			counts.i += 1;
		}
		if (counts.messageCount % 100 === 0) logHandler.logEvent(`Elapsed time: ${(Date.now()-counts.startTime)/1000}. ${counts.messageCount} messages read. ${counts.i} posts found.`, logHandler.levels.COUNTER);
  	}
	//logHandler.logEvent(`Found ${posts.length} posts.`, logHandler.levels.COUNTER);
	posts.forEach(x => eventHandler.postCounted(x,client));
	return counts;
}

module.exports = { countAllFresh };