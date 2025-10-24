import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { ButtonStyle, SlashCommandBuilder } from "discord.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName("payments")
        .setDescription("Setup the payment buttons in this channel")
        .toJSON(),
    restricted: true,
    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async callback(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("Payment Options")
            .setDescription("Select a payment option below.")
            .setColor(0x2A2D31)
            .toJSON();
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("paypal")
                    .setLabel("PayPal")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("cashapp")
                    .setLabel("Cash App")
                    .setStyle(ButtonStyle.Success)
            )

        await interaction.reply({
            content: "Sending message...",
            
        })
        await interaction.channel.send({
            embeds: [embed],
            components: [actionRow]
        });
        await interaction.editReply({
            content: "Message sent! 🚀"
        })

    }
}