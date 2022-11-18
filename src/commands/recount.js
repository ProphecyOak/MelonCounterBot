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
      if(!await interaction.memberPermissions.has('ManageGuild', true)){
        interaction.reply("You don't have permission to use this command");
        return;
      }
  		await interaction.reply("This will take a while. You will be notified when done.");
      startTime = Date.now();
      if (!interaction.all) {await counterTools.countYoungMelons(interaction.client);}
      else {await counterTools.countAllMelons(interaction.client);}
      interaction.followUp(`Recount completed in ${(Date.now()-startTime)/1000} seconds.`);
    } else {
      await interaction.reply({content: "You cannot use this command in this channel.", ephemeral: true});
    }
	},
};
