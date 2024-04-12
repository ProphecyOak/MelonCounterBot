const { galleryChannelID, oldGalleryChannelID, guildID } = require('../config.json');
const logHandler = require("./logHandler.js");
const eventHandler = require("./eventHandler.js");
const mongoInterface = require("./mongoInterface.js");

async function countAllFresh(client) {
    logHandler.logEvent(`Beginning a full recount.\nBeginning old gallery recount.`, logHandler.levels.COUNTER);
    await mongoInterface.dropAll("Users");
    const oldResults = await countOldGallery(client);
    logHandler.logEvent(`Full old gallery recount complete. Found a total of ${oldResults.i} posts.\nBeginning new gallery recount.`, logHandler.levels.COUNTER);
    const newResults = await countNewGallery(client);
    logHandler.logEvent(`Full new gallery recount complete. Found a total of ${newResults.postCount} posts.`, logHandler.levels.COUNTER);
}

//	--------    COUNT THE NEW GALLERY    --------

async function countNewGallery(client) {
    const galleryForum = (await (await client.guilds.fetch(guildID)).channels.fetch(galleryChannelID));
    let last_id;
    let totalCount = 0;
    let threads = (await galleryForum.threads.fetch()).threads;
    totalCount += threads.size;
    while (true) {
        const options = { "limit":50 };
        if (last_id) options.before = last_id;
        threads = (await galleryForum.threads.fetchArchived(options)).threads;
        await threads.forEach(async thread => await eventHandler.threadCounted(thread,client));
        last_id = threads.last().id;
        totalCount += threads.size;
        if (threads.size != 50) break;
    }
    return {"postCount": totalCount};
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
    }
	posts.forEach(x => eventHandler.postCounted(x,client));
	return counts;
}

module.exports = { countAllFresh };