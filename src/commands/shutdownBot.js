const { SlashCommandBuilder, UserManager } = require('discord.js');
const { botChannelID, botAdmins } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shutdown-bot')
		.setDescription('Shuts down the bot!'),
	async execute(interaction) {
		if (interaction.channelId != botChannelID) {
			await interaction.reply({content: "You cannot use this command in this channel.", ephemeral: true});
		} else if (!botAdmins.includes(interaction.user.id)) {
			await interaction.reply({content: `You are not allowed to use this command.`, ephemeral: true});
		} else {
			await interaction.reply("Shutting Down...");
			console.log(`Shut down by command`);
			process.exit();
		}
	},
};
