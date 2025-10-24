import { SlashCommandBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import uuid4 from 'uuid4';

export const command = {
    data: new SlashCommandBuilder()
        .setName("orders")
        .setDescription("Handle orders")
        .addSubcommand(subcommand => 
            subcommand
                .setName("paid")
                .setDescription("Mark an order as paid and handle additional actions")
        )
        .toJSON(),
    restricted: true,
    async callback(interaction) {
        if (interaction.options.getSubcommand() === 'paid') {
            const uniqueModalId = `submitForm-${uuid4()}`;
            const modal = new ModalBuilder()
                .setCustomId(uniqueModalId)
                .setTitle('Order Details')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('priceBeforeCut')
                            .setLabel('Price before cut')
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(10)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('keyPoints')
                            .setLabel('Key Points')
                            .setStyle(TextInputStyle.Paragraph)
                            .setMaxLength(4000)
                            .setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('order')
                            .setLabel('Order')
                            .setStyle(TextInputStyle.Paragraph)
                            .setMaxLength(4000)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('specialNotes')
                            .setLabel('Special Notes')
                            .setStyle(TextInputStyle.Paragraph)
                            .setMaxLength(4000)
                            .setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('region')
                            .setLabel('Region')
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(100)
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
    }
};
