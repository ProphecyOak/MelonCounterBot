const { SlashCommandBuilder, UserManager } = require('discord.js');
const { botChannelID } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shutdown-bot')
		.setDescription('Shuts down the bot!'),
	async execute(interaction) {
		if (interaction.channelId === botChannelID) {
			await interaction.reply("Shutting Down...");
			console.log(`Shut down by command`);
			process.exit();
		} else {
			await interaction.reply({content: "You cannot use this command in this channel.", ephemeral: true});
		}
	},
};
