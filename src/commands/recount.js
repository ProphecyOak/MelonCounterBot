const { SlashCommandBuilder, UserManager } = require('discord.js');
const { botChannelID } = require('../../config.json');
const counterTools = require('../countHelper.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('recount-melons')
		.setDescription('Recounts melons')
    .addBooleanOption(option =>
      option.setName('all')
      .setDescription("Recount all melons?")
      .setRequired(true)),
	async execute(interaction) {
    if (interaction.channelId === botChannelID) {
      if(!await interaction.memberPermissions.has('ManageGuild', true) && await interaction.user.id != 272021739372937216){
        interaction.reply("You don't have permission to use this command");
        return;
      }
  		await interaction.reply("This might take a while. You will be notified when done.");
      startTime = Date.now();
      if (!interaction.options.getBoolean('all')) {await counterTools.checkYoungData(interaction.client);}
      else {await counterTools.countAllMelons(interaction.client);}
      //Don't follow up becasue it could take longer than 15 min
      await interaction.channel.send(`<@${interaction.user.id}> Recount completed in ${(Date.now()-startTime)/1000} seconds.`);
    } else {
      await interaction.reply({content: "You cannot use this command in this channel.", ephemeral: true});
    }
	},
};
