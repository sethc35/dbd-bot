import { SlashCommandBuilder } from "@discordjs/builders";
export const command = {
    data: new SlashCommandBuilder()
        .setName("uncustomer")
        .setDescription("Removes the customer role from a user")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The user to unassign the customer role")
                .setRequired(true),
        )
        .toJSON(),
    restricted: true,
    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async callback(interaction) {
        const user = interaction.options.getUser("user", true);
        const roleID = "1221930998330298419";
        const member = await interaction.guild.members.fetch(user.id);

        try {
            await member.roles.remove(roleID);
            await interaction.reply({
                content: `${user.username} has been unassigned the customer role.`,
                
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "An error occurred while unassigning the role.",
                
            });
        }
    },
};
