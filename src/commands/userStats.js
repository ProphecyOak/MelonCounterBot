const { SlashCommandBuilder, UserManager } = require('discord.js');
const { botChannelID, botAdmins } = require('../../config.json');
const mongoInterface = require("../mongoInterface.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user-stats')
		.setDescription('Prints the stats of a selected user!')
		.addUserOption(option =>
			option.setName('user')
			.setDescription("User to print the stats of.")
			.setRequired(true)),
	async execute(interaction) {
		if (interaction.channelId != botChannelID) {
			await interaction.reply({content: "You cannot use this command in this channel.", ephemeral: true});
		} else {
			const user = interaction.options.resolved.users.at(0);
			const userInfo = await mongoInterface.getUserDoc(user);
			await interaction.reply(`${userInfo.username} has posted ${userInfo.post_count} times. They have received ${userInfo.melons_received} and awarded ${userInfo.melons_given} melons.`);
		}
	},
};
