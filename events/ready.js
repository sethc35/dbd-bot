export const event = {
    name: "ready",
    once: true,
    /**
     * @param {import("discord.js").Client} client
     */
    async callback(client) {
        console.log("Ready!");
        // Loop through all guilds the bot is in and fetch invites
        // client.guilds.cache.forEach(async (guild) => {
        //     try {
        //         const guildInvites = await guild.invites.fetch();
        //         invites[guild.id] = new Map(guildInvites.map((invite) => [invite.code, invite.uses]));
        //     } catch (err) {
        //         console.warn(`Could not fetch invites for guild: ${guild.id}`);
        //     }
        // });
    },
};
