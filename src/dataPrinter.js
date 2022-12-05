const melonData = require('../data.json');

module.exports = { strStats, strLeaderboard }

//getUserStats(user: String): obj
function getUserStats(user) {
  let creator = {
    user: user,

    oldPosts: melonData.old.postCount.hasOwnProperty(user) ? melonData.old.postCount[user] : 0,
    youngPosts: melonData.young.postCount.hasOwnProperty(user) ? melonData.young.postCount[user] : 0,

    oldReceivedMelons: melonData.old.received.hasOwnProperty(user) ? melonData.old.received[user] : 0,
    youngReceivedMelons: melonData.young.received.hasOwnProperty(user) ? melonData.young.received[user] : 0,

    oldAwardedMelons: melonData.old.awarded.hasOwnProperty(user) ? melonData.old.awarded[user] : 0,
    youngAwardedMelons: melonData.young.awarded.hasOwnProperty(user) ? melonData.young.awarded[user] : 0,

    firstPost: melonData.firstPost.hasOwnProperty(user) ? (new Date(melonData.firstPost[user])).toString().slice(0,15) : "N/A"
  };
  return creator;
}

//strStats(user: String): String
async function strStats(interaction) {
  let user = interaction.options.resolved.users.at(0);
  let member = await interaction.guild.members.fetch(user);
  let username = member.nickname!==null ? member.nickname : user.username;
  let creator = getUserStats(user.id);

  let out = `Stats for **${username}**\n   `;
  out += `First post date: ${creator.firstPost}\n   `;
  out += `Post count: ${creator.oldPosts+creator.youngPosts}\n   `;
  out += `Melons received: ${creator.oldReceivedMelons+creator.youngReceivedMelons}\n   `;
  out += `Melons given: ${creator.oldAwardedMelons+creator.youngAwardedMelons}\n   `;
  out += `Avg melons per post: ${Math.round((creator.oldReceivedMelons+creator.youngReceivedMelons)/(creator.oldPosts+creator.youngPosts)*100)/100}`;
  return out;
}

//strLeaderboard(statChoice: String): String
async function strLeaderboard(statChoice) {
  let out = "";
  if (statChoice==="melonAvg") {
    
  } else if (statChoice==="postFreq") {

  } else {

  }
  return;
}
