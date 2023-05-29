
module.exports = {getNick};

//GET NICKNAME
async function getNick(message) {
  let member = {nickname:null};
  member = await message.guild.members.fetch(message.author.id);
  return member.nickname == null ? message.author.username : member.nickname;
}
