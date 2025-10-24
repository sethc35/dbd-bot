import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import uuid4 from "uuid4";

export const button = {
    customId: "cashapp",
    /**
     * @param {import("discord.js").ButtonInteraction} interaction
     */
    async callback(interaction) {
        await interaction.deferReply({
            
        });
        const code = uuid4();
        const embed = new EmbedBuilder()
            .setTitle("Cash App Payment")
            .setDescription(`Please send your payment to our Cash App: **$dbdboosting123**.\nMake sure to include the following code in the payment notes:\nCode **\`${interaction.member.id}\`**\n\nOnce you've sent the payment, press the confirm button below!`)
            .setColor(0x2A2D31)
            .toJSON();
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm-cashapp-${code}`)
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji(
                        {
                            name: "✅"
                        }
                    )
            )
        await interaction.member.send({
            embeds: [embed],
            components: [actionRow]
        });
        await interaction.editReply({
            content: "Check your DMs 📬!"
        })
    }
}