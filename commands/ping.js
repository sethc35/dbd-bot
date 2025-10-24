import { SlashCommandBuilder } from "@discordjs/builders";
import mongoClient from "../store/mongoClient.js";

const { connectToDatabase, getCollection, getCredits } = mongoClient;

const DELETE_AFTER = 50; // 5 seconds

export const command = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Start pinging with a specified interval")
        .addIntegerOption(option =>
            option
                .setName("ping_interval")
                .setDescription("Interval for pings in seconds")
                .setRequired(true),
        )
        .toJSON(),
    restricted: true,
    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async callback(interaction) {
        const pingInterval = interaction.options.getInteger("ping_interval") * 1000; // Convert seconds to milliseconds
        const channelId = interaction.channelId;

        await interaction.reply({
            content: `Pinging every ${pingInterval / 1000} seconds.`,
            
        });

        const collection = getCollection();
        const stateDoc = await collection.findOne({ key: `pingInterval:${channelId}` });

        if (stateDoc && stateDoc.value) {
            clearInterval(parseInt(stateDoc.value, 10));
        }

        const pingIntervalId = setInterval(async () => {
            const channel = interaction.channel;
            if (channel.isTextBased()) {
                try {
                    const message = await channel.send('@everyone');
                    setTimeout(() => {
                        message.delete().catch(console.error);
                    }, DELETE_AFTER);
                } catch (error) {
                    console.error('Error sending or deleting message:', error);
                }
            }
        }, pingInterval);

        await collection.updateOne(
            { key: `pingInterval:${channelId}` },
            { $set: { key: `pingInterval:${channelId}`, value: pingIntervalId.toString() } },
            { upsert: true }
        );
    },
};