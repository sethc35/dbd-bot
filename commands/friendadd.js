import { SlashCommandBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import uuid4 from 'uuid4';

export const command = {
    data: new SlashCommandBuilder()
        .setName("addfriend")
        .setDescription("Handles friend add offers")
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
                        .setCustomId('friendPrice')
                        .setLabel('Price (Before Cut)')
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(1)
                        .setMaxLength(30)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('friendOrder')
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
