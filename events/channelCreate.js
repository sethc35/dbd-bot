
export const event = {
    name: "channelCreate",
    once: false,
    /**
     * @param {import("discord.js").Channel} channel
     */
    async callback(channel) {
        console.log(`A new channel was created: ${channel.name}`);
        
        // Check if the channel belongs to the target category
        if (channel.parentId === process.env.CREATE_CHANNEL_ID && channel.isTextBased()) {
            const targetCategory = channel.guild.channels.cache.get(process.env.CREATE_CHANNEL_ID);
            const roleToPing = channel.guild.roles.cache.get(process.env.STAFF_ROLE_ID);

            if (!roleToPing) {
                console.error("Role not found");
                return;
            }

            try {
                await channel.send({
                    content: `${roleToPing.toString()} New Ticket is here!`,
                    allowedMentions: { roles: [roleToPing.id] },
                });
                console.log(`Sent a ping in ${channel.name}`);
            } catch (error) {
                console.error("An error occurred while trying to send a message in the newly created channel:", error);
            }
        }
    },
};