import { SlashCommandBuilder } from 'discord.js';
import mongoClient from '../store/mongoClient.js';

const { connectToDatabase, getCollection, getCredits } = mongoClient;

export const command = {
    data: new SlashCommandBuilder()
        .setName('credits')
        .setDescription('Commands for managing credits')
        .addSubcommand(
            subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Add credits to a user')
                    .addUserOption(option =>
                        option
                            .setName('user')
                            .setDescription('The user to add credits to')
                            .setRequired(true)
                    )
                    .addNumberOption(option =>
                        option
                            .setName('amount')
                            .setDescription('The amount of credits to add')
                            .setRequired(true)
                    )
        )
        .addSubcommand(
            subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Remove credits from a user')
                    .addUserOption(option =>
                        option
                            .setName('user')
                            .setDescription('The user to remove credits from')
                            .setRequired(true)
                    )
                    .addNumberOption(option =>
                        option
                            .setName('amount')
                            .setDescription('The amount of credits to remove')
                            .setRequired(true)
                    )
        )
        .addSubcommand(
            subcommand =>
                subcommand
                    .setName('show')
                    .setDescription('Show credits of a user')
                    .addUserOption(option =>
                        option
                            .setName('user')
                            .setDescription('The user to show credits for')
                            .setRequired(true)
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
        const amount = interaction.options.getNumber('amount');

        try {
            // Connect to the database
            await connectToDatabase();
            const creditsCollection = getCredits();

            // Defer the interaction reply to give more time for processing
            await interaction.deferReply();
            const HEAD_STAFF_ROLE_ID = process.env.HEAD_STAFF_ROLE_ID;
            const OWNER_ROLE_ID = process.env.OWNER_ROLE_ID;

            if (subcommand === 'add') {
                // Check if the user has the required roles
                if (interaction.member.roles.cache.has(HEAD_STAFF_ROLE_ID) || interaction.member.roles.cache.has(OWNER_ROLE_ID)) {
                    // Add credits to the user
                    const result = await creditsCollection.updateOne(
                        { userId: user.id },
                        { $inc: { credits: amount } },
                        { upsert: true }
                    );
                    await interaction.editReply(`Added ${amount} credits to <@${user.id}>`);
                } else {
                    // User does not have the required roles
                    await interaction.editReply('You do not have the required permissions to add credits. Please contact a Head Staff or Owner for assistance.');
                }
            } else if (subcommand === 'remove') {
                // Remove credits from the user
                const result = await creditsCollection.updateOne(
                    { userId: user.id },
                    { $inc: { credits: -amount } },
                    { upsert: true }
                );
                await interaction.editReply(`Removed ${amount} credits from <@${user.id}>`);
            } else if (subcommand === 'show') {
                // Show credits of the user
                const userCredits = await creditsCollection.findOne({ userId: user.id });
                const credits = userCredits ? userCredits.credits : 0;
                await interaction.editReply(`User <@${user.id}> has ${credits} dollars`);
            }            
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
