import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js"; // Ensure you import permission flags

export const command = {
    data: new SlashCommandBuilder()
        .setName("customer")
        .setDescription("Assigns the customer role to a user")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The user to assign the customer role")
                .setRequired(true)
        )
        .toJSON(),

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async callback(interaction) {
        const requiredRoleID = process.env.ACCOUNT_SELLER_ROLE_ID;
        const member = interaction.member;
        const targetUser = interaction.options.getMember("user", true);
        const customerRoleID = process.env.CUSTOMER_ROLE_ID;

        const hasPermission =
            member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
            member.roles.cache.has(requiredRoleID);

        if (!hasPermission) {
            await interaction.reply({
                content:
                    "You do not have the required permissions or role to use this command.",
            });
            return;
        }

        try {
            await targetUser.roles.add(customerRoleID);
            await interaction.reply({
                content: `${targetUser.user.username} has been assigned the customer role.`,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "An error occurred while assigning the role.",
            });
        }
    },
};
