const { SlashCommandBuilder, UserManager } = require('discord.js');
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
		await interaction.reply(await dataPrinterTools.strStats(interaction));
	},
};
