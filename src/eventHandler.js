const { galleryChannelID } = require('../config.json');
const mongoInterface = require("./mongoInterface.js");
const logHandler = require("./logHandler.js");

//	--------    POST CHANGES    --------

//  On find old post
async function postCounted(post, client) {
    const author = post.author;
    await mongoInterface.changePostCount(author, 1);
    await mongoInterface.addPost(post, author);
    const melonReactions = post.reactions.resolve('🍉');
    if (melonReactions != null) {
        await mongoInterface.changeMelonCounts(author, melonReactions.count, true);
        const meloners = await melonReactions.users.fetch();
        if (melonReactions.count !== meloners.size) console.log(`${post}`);
        for (const user of meloners.keys()) await mongoInterface.changeMelonCounts(await client.users.fetch(user), 1, false);
    }
}

//  On find old thread
async function threadCounted(thread, client) {
    try{
        const originalMessage = await thread.fetchStarterMessage();
        const author = originalMessage.author;
        await mongoInterface.changePostCount(author, 1);
        await mongoInterface.addPost(thread, author);
        const melonReactions = await originalMessage.reactions.resolve('🍉').fetch();
        if (melonReactions != null) {
            await mongoInterface.changeMelonCounts(author, melonReactions.count, true);
            const meloners = (await melonReactions.users.fetch()).keys();
            for (const user of meloners) await mongoInterface.changeMelonCounts(await client.users.fetch(user), 1, false);
        }
    } catch (e) {
    }
}

//  On post created
async function postCreation(thread, client) {
    const threadOwner = await client.users.fetch(thread.ownerId);
    await mongoInterface.changePostCount(threadOwner, 1);
    await mongoInterface.addPost(client, thread);
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
    await mongoInterface.removePost(thread);
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

module.exports = {  postCounted, threadCounted, postCreation, postDeletion, melonAdded, melonRemoved };