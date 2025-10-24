import { EmbedBuilder } from "@discordjs/builders";
import { DiscordAPIError } from "@discordjs/rest";
import { PermissionFlagsBits } from "discord.js";
import { submitForm } from "../handlers/modalSubmit.js";

export const event = {
    name: "interactionCreate",
    once: false,
    /**
     * @param {import("discord.js").Interaction} interaction
     */
    async callback(interaction) {
        const { client } = interaction;

        try {
            if (interaction.isCommand()) {
                const { commandName, member } = interaction;
                const command = client.commands[commandName];
        
                if (!command) {
                    const embed = new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription("Command not found.")
                        .setColor(0x2A2D31)
                        .setFooter({
                            text: "Contact the bot owner for more information!",
                        })
                        .toJSON();
                    await interaction.reply({
                        embeds: [embed],
                        
                    });
                    return;
                }
        
                if (command.restricted) {
                    const hasPermission = member.permissions.has([
                        PermissionFlagsBits.ModerateMembers,
                    ]);
                    if (!hasPermission) {
                        await interaction.reply({
                            content:
                                "You do not have the required permissions to use this command.",
                            
                        });
                        return;
                    }
                }
                await command.callback(interaction);
            } else if (interaction.isButton()) {
                let button = client.buttons[interaction.customId];
                if (!button) {
                    button = /confirm-cashapp-(.+)/.test(interaction.customId)
                        ? client.buttons['confirm-cashapp']
                        : null;
                }
                if (!button) {
                    const embed = new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('Button not found.')
                        .setColor(0x2A2D31)
                        .setFooter({
                            text: 'Contact the bot owner for more information!',
                        })
                        .toJSON();
                    await interaction.reply({
                        embeds: [embed],
                        
                    });
                    return;
                }
                await button.callback(interaction);
            } else if (interaction.isModalSubmit()) {
                try {
                    await submitForm(interaction);
                } catch (error) {
                    console.error('Error handling modal submission:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'There was an error processing your request. Please try again later.',
                            
                        });
                    }
                }
            } else if (interaction.isAutocomplete()) {
                const { commandName } = interaction;
                const command = client.commands[commandName];

                if (command && command.autocompleteHandler) {
                    await command.autocompleteHandler(interaction);
                } else {
                    await interaction.respond([]);
                }
            }
        } catch (error) {
            if (error instanceof DiscordAPIError && (error.code === 40060 || error.code === 10062)) {
                console.warn('Interaction already acknowledged or unknown interaction:', error);
            } else {
                console.error('Unhandled error:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'There was an error processing your request. Please try again later.',
                        
                    });
                }
            }
        }
    },
};
