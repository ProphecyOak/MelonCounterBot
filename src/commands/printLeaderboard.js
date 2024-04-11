const { SlashCommandBuilder, UserManager } = require('discord.js');
const { botChannelID } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('print-leaderboard')
		.setDescription('Prints the top users!')
    	.addStringOption(option => option.setName('stat')
			.setDescription("Stat to base the leaderboard off of.")
			.setRequired(true)
			.addChoices({name: 'Melons Received', value:'received'},
						{name: 'Melons Given', value:'awarded'},
						{name: 'Total Posts', value:'postCount'},
						{name: 'Average Melons Received', value:'melonAvg'},
						{name: 'Post Frequency', value:'postFreq'}
			)
		),
	async execute(interaction) {
		if (interaction.channelId === botChannelID) {
			let statChoice = interaction.options.getString("stat");
			await interaction.reply("This doesn't work yet.");
			console.log(`Printed leaderboard of ${statChoice}`);
		} else {
			await interaction.reply({content: "You cannot use this command in this channel.", ephemeral: true});
		}
	},
};
