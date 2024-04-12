const { galleryChannelID } = require('../config.json');
const mongoInterface = require("./mongoInterface.js");
const logHandler = require("./logHandler.js");

//	--------    POST CHANGES    --------

//  On post created
async function postCreation(thread, client) {
    const threadOwner = await client.users.fetch(thread.ownerId);
    await mongoInterface.changePostCount(threadOwner, 1);
    logHandler.logEvent(`Post created by ${threadOwner.username}.`, logHandler.levels.POST);
}

//  On post deleted
async function postDeletion(thread, client) {
    const threadOwner = await client.users.fetch(thread.ownerId);
    const melonReactions = (await thread.fetchStarterMessage()).reactions.resolve('🍉');
    if (melonReactions != null) {
        await mongoInterface.changeMelonCounts(threadOwner, -1*melonReactions.count, true);
        const meloners = melonReactions.users.cache.keys();
        for (const user of meloners) await mongoInterface.changeMelonCounts(await client.users.fetch(user), -1, false);
    }
    await mongoInterface.changePostCount(threadOwner, -1);
    logHandler.logEvent(`${threadOwner.username}'s post was deleted.`, logHandler.levels.POST);
}

//	--------    MELON CHANGES    --------

//  On melon added to post
async function melonAdded(reaction, user, client) {
    const thread = await client.channels.fetch(reaction.message.channelId);
    if (thread.parentId != galleryChannelID) return;
    const post = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
    const author = post.author;
    await mongoInterface.changeMelonCounts(user, 1, false);
    await mongoInterface.changeMelonCounts(author, 1, true);
    logHandler.logEvent(`Melon was added to ${author.username}'s post by ${user.username}`, logHandler.levels.REACTION);
}

//  On melon removed from post
async function melonRemoved(reaction, user, client) {
    const thread = await client.channels.fetch(reaction.message.channelId);
    if (thread.parentId != galleryChannelID) return;
    const post = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
    const author = post.author;
    await mongoInterface.changeMelonCounts(user, -1, false);
    await mongoInterface.changeMelonCounts(author, -1, true);
    logHandler.logEvent(`Melon was removed from ${author.username}'s post by ${user.username}`, logHandler.levels.REACTION);
}

module.exports = {  postCreation, postDeletion, melonAdded, melonRemoved };