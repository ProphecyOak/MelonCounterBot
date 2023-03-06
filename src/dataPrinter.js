const  db = require("./mongo.js");

module.exports = { strStats, strLeaderboard }

//strStats(user: String): String
async function strStats(interaction) {
  let user = interaction.options.resolved.users.at(0);
  let member = await interaction.guild.members.fetch(user);
  let username = member.nickname!==null ? member.nickname : user.username;
  let creator =  await db.getSingleData("MainData",{_id:user.id});

  let out = `Stats for **${username}**\n   `;
  out += `First post date: ${creator ? (new Date(creator.first)).toString().slice(0,15) : "N/A"}\n   `;
  out += `Post count: ${creator ? creator.count : 0}\n   `;
  out += `Melons received: ${creator ? creator.received : 0}\n   `;
  out += `Melons given: ${creator ? creator.awarded : 0}\n   `;
  out += `Avg melons per post: ${Math.round((creator ? creator.received : 0)/(creator ? creator.count : 0)*100)/100}`;
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
