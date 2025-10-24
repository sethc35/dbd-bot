import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('permissions')
        .setDescription('Commands for managing permissions')
        .addSubcommand(
            subcommand =>
                subcommand
                    .setName('grant')
                    .setDescription('Grant a user permissions in a channel')
                    .addUserOption(option =>
                        option
                            .setName('user')
                            .setDescription('The user to grant permissions to')
                            .setRequired(true)
                    )
                    .addChannelOption(option =>
                        option
                            .setName('channel')
                            .setDescription(
                                'The channel to grant permissions in (defaults to the current channel if not specified)'
                            )
                            .setRequired(false)
                    )
        )
        .addSubcommand(
            subcommand =>
                subcommand
                    .setName('revoke')
                    .setDescription('Revoke a user permissions in a channel')
                    .addUserOption(option =>
                        option
                            .setName('user')
                            .setDescription('The user to revoke permissions from')
                            .setRequired(true)
                    )
                    .addChannelOption(option =>
                        option
                            .setName('channel')
                            .setDescription(
                                'The channel to revoke permissions from (defaults to the current channel if not specified)'
                            )
                            .setRequired(false)
                    )
        )
        .toJSON(),
    restricted: true,
    /**
     * @param {import('discord.js').CommandInteraction} interaction
     */
    async callback(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await interaction.deferReply();

            if (subcommand === 'grant') {
                await channel.permissionOverwrites.edit(user.id, {
                    [PermissionsBitField.Flags.ViewChannel]: true,
                    [PermissionsBitField.Flags.SendMessages]: true,
                    [PermissionsBitField.Flags.ReadMessageHistory]: true,
                });
            } else if (subcommand === 'revoke') {
                await channel.permissionOverwrites.edit(user.id, {
                    [PermissionsBitField.Flags.ViewChannel]: false,
                    [PermissionsBitField.Flags.SendMessages]: false,
                    [PermissionsBitField.Flags.ReadMessageHistory]: false,
                });
            }

            // Update the interaction reply once the permissions are changed
            await interaction.editReply(`Updated permissions for ${user.username} in ${channel.name}`);
        } catch (error) {
            console.error(error);
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({
                        content: 'An error occurred while processing your command.',
                    });
                } catch (replyError) {
                    console.error(replyError);
                }
            } else {
                try {
                    await interaction.editReply({
                        content: 'An error occurred while processing your command.',
                        
                    });
                } catch (replyError) {
                    console.error(replyError);
                }
            }
        }
    },
};
