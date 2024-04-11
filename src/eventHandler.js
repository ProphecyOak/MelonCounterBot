const { galleryChannelID } = require('../config.json');

async function threadCreation(thread, client) {
    const threadOwner = await client.users.fetch(thread.ownerId);
    console.log(`Post created by ${threadOwner.username}.`);
}

async function threadDeletion(thread, client) {
    const threadOwner = await client.users.fetch(thread.ownerId);
    console.log(`${threadOwner.username}'s post deleted.`);
}

module.exports = {threadCreation, threadDeletion};