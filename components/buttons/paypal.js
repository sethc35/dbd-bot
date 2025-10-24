export const button = {
    customId: "paypal",
    /**
     * @param {import("discord.js").ButtonInteraction} interaction
     */
    async callback(interaction) {
        await interaction.reply({
            content: "Go to PayPal and send money to `darkestbeforedawncommerce@gmail.com`.",
            
        });
    }
}