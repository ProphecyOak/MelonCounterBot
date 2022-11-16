const melonData = require('../data.json');

//printUserStats(user: String): String
function printUserStats(user) {
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


  let out = `Stats for <@${creator.user}>\n   `;
  out += `First post date: ${creator.firstPost}\n   `;
  out += `Post count: ${creator.oldPosts+creator.youngPosts}\n   `;
  out += `Melons recieved: ${creator.oldReceivedMelons+creator.youngReceivedMelons}\n   `;
  out += `Melons given: ${creator.oldAwardedMelons+creator.youngAwardedMelons}\n   `;
  out += `Avg melons per post: ${Math.round((creator.oldReceivedMelons+creator.youngReceivedMelons)/(creator.oldPosts+creator.youngPosts)*100)/100}`;
  return out;
}

console.log(printUserStats("272496378532462592"));
