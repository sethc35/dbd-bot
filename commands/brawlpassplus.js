import { SlashCommandBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import uuid4 from 'uuid4';

export const command = {
    data: new SlashCommandBuilder()
        .setName("cheap")
        .setDescription("Handles discounted offers")
        .toJSON(),
    restricted: true,
    async callback(interaction) {
        const uniqueModalId = `submitForm-${uuid4()}`;
        const modal = new ModalBuilder()
            .setCustomId(uniqueModalId)
            .setTitle('Cheap Orders')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('passPrice')
                        .setLabel('Price (Before Cut)')
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(1)
                        .setMaxLength(30)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('passOrder')
                        .setLabel('Order')
                        .setStyle(TextInputStyle.Paragraph)
                        .setMinLength(1)
                        .setMaxLength(500)
                        .setRequired(true)
                )
            );

        try {
            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error showing modal:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'There was an error showing the modal.',
                    
                });
            }
        }
    }
};
