export const event = {
    name: "guildMemberAdd",
    once: false,
    /**
     * @param {import("discord.js").GuildMember} member
     */
    async callback(member) {
        // // Compare invites before and after the member joined to determine which invite was used
        // const newInvites = await member.guild.invites.fetch();
        // const usedInvite = newInvites.find((invite) => invites[member.guild.id].get(invite.code) < invite.uses);
        // // console.log(`${member.id} joined using invite code ${usedInvite.code}`);
        // invites[member.guild.id] = new Map(newInvites.map((invite) => [invite.code, invite.uses]));
    },
};
