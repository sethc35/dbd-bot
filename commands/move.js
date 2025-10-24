import { SlashCommandBuilder } from "@discordjs/builders";
export const command = {
    data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Move a channel into a category")
        .addChannelOption((option) =>
            option
                .setName("category")
                .setDescription("The category to move the channel into")
                .setRequired(true),
        )
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("The channel to move")
                .setRequired(false),
        )
        .toJSON(),
    restricted: true,
    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async callback(interaction) {
        const channelToMove =
            interaction.options.getChannel("channel") || interaction.channel;
        const category = interaction.options.getChannel("category");

        if (category.type !== 4) {
            await interaction.reply({
                content: "Please select a valid category.",
                
            });
            return;
        }

        try {
            await channelToMove.setParent(category.id, {
                lockPermissions: false,
            });
            await interaction.reply(
                `Moved ${channelToMove.name} to ${category.name}`,
            );
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                try {
                    await interaction.reply({
                        content:
                            "An error occurred while processing your command.",
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        }
    },
};
