const { SlashCommandBuilder, UserManager } = require('discord.js');
const { botChannelID } = require('../../config.json');
const dataPrinterTools = require('../dataPrinter.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('print-user-stats')
		.setDescription('Prints a User\'s Stats!')
    .addUserOption(option =>
      option.setName('user')
      .setDescription("User to print the stats of.")
      .setRequired(true)),
	async execute(interaction) {
    if (interaction.channelId === botChannelID) {
  		await interaction.reply(await dataPrinterTools.strStats(interaction));
      console.log(`Printed stats of ${interaction.options.resolved.users.at(0).username}`);
    } else {
      await interaction.reply({content: "You cannot use this command in this channel.", ephemeral: true});
    }
	},
};
