import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from '@discordjs/builders';
import { ButtonStyle } from 'discord.js';
import Imap from 'imap';
import { simpleParser } from 'mailparser';

const imapConfig = {
    user: process.env.EMAIL,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    tls: true,
    tlsOptions: { servername: process.env.EMAIL_HOST }
};

/**
 * @param {import("discord.js").ButtonInteraction} interaction
 * @param {string} userId
 */
function checkEmails(interaction, userId) {
    const imap = new Imap(
        imapConfig
    );

    imap.once('ready', function () {
        imap.openBox('INBOX', false, function (err, box) {
            if (err) {
                throw err;
            }
            imap.search(['UNSEEN', [
                "FROM", "Cash@Square.com"
            ]], function (err, results) {
                if (err) {
                    throw err;
                }
                const f = imap.fetch(results, { bodies: '' });
                f.on('message', function (msg, seqno) {
                    msg.on('body', async function (stream, info) {
                        const parsed = await simpleParser(stream);
                        const paymentNote = parsed.subject;

                        if (paymentNote.includes("sent you")) {
                            /** @type {string} */
                            const [personSentYouAmount, reason] = paymentNote.split("for");
                            const amount = personSentYouAmount.split("sent you")[1].trim();

                            if (!reason) {
                                return
                            }
                            if (!reason?.includes(userId)) {
                                return
                            }

                            const channel = await interaction.client.guilds.cache.get(
                                process.env.GUILD_ID
                            ).channels.fetch("1224426645021130832")  // THIS SHOULD BE THE VOUCH CHANNEL ID
                            const reasonWithoutSpaces = reason.replace(/\s+/g, '');
                            const embed = new EmbedBuilder()
                                .setTitle("Payment confirmed!")
                                .setDescription(`Received ${amount} from <@${reasonWithoutSpaces}>`)
                                .setColor(0x2A2D31)
                                .setTimestamp()

                            await channel.send({ embeds: [embed] })

                            const actionRow = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId("confirm-cashapp")
                                        .setLabel("Confirm")
                                        .setStyle(ButtonStyle.Success)
                                        .setDisabled(true)
                                )

                            await interaction.editReply({
                                content: "Payment confirmed!",
                                
                                components: [actionRow]
                            });

                            interaction.replied = true

                            imap.seq.addFlags(seqno, ['\\Seen'], function (err) {
                                if (err) {
                                    console.log('Error marking message as read:', err);
                                } else {
                                    console.log('Message marked as read');
                                }
                            })
                            return
                        }
                    });
                });
                f.once('end', function () {
                    imap.end();
                    if (interaction.replied) {
                        return
                    }
                    console.log("NOT REPLIED")
                    interaction.editReply({
                        content: "No payment found",
                    });
                });
            });
        });
    });

    imap.once('error', function (err) {
        console.log(err);
    });

    imap.connect();
}

export const button = {
    customId: "confirm-cashapp",
    /**
     * @param {import("discord.js").ButtonInteraction} interaction
     */
    async callback(interaction) {
        await interaction.deferUpdate({
            
        })
        checkEmails(interaction, interaction.user.id)
    }
}