import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, OverwriteType } from 'discord.js';
import mongoClient from '../../store/mongoClient.js';
import redisClient from '../../store/redisClient.js';

const { connectToDatabase, getCollection, getPasses, getFriends } = mongoClient;

export const orderCompletedButton = {
    customId: 'completeOrder',
    /**
     * @param {import("discord.js").ButtonInteraction} interaction
     */
    async callback(interaction) {
        try {
            const { user, channel, message, guild } = interaction;

            const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;
            const HEAD_STAFF_ROLE_ID = process.env.HEAD_STAFF_ROLE_ID;
            const OWNER_ROLE_ID = process.env.OWNER_ROLE_ID;

            // Fetch the member and check roles
            const member = await guild.members.fetch(user.id);

            if (!member.roles.cache.has(STAFF_ROLE_ID) && 
                !member.roles.cache.has(HEAD_STAFF_ROLE_ID) && 
                !member.roles.cache.has(OWNER_ROLE_ID)) {
                await interaction.reply({
                    content: 'You are not authorized to complete this order.',
                    ephemeral: true,
                });
                return;
            }

            // Extract the user ID from the previous message content
            const content = message.embeds[0].description;
            const userIdMatch = content.match(/<@(\d+)>/);
            if (!userIdMatch) {
                await interaction.reply({
                    content: 'Could not find the user who claimed the order.',
                    ephemeral: true,
                });
                return;
            }
            const claimedByUserId = String(userIdMatch[1]);
            console.log('Extracted User ID:', claimedByUserId);

            const ONE_ORDER_ROLE_ID = process.env.ONE_ORDER_ROLE_ID;
//            const TWO_ORDER_ROLE_ID = process.env.TWO_ORDER_ROLE_ID;

            const FINAL_TARGET_CHANNEL_ID = process.env.FINAL_TARGET_CHANNEL_ID;
            const PAYMENT_CHANNEL_ID = process.env.PAYMENT_CHANNEL_ID;
            const PASSES_PAYMENT_CHANNEL_ID = process.env.PASSES_PAYMENT_CHANNEL_ID;
            const FRIEND_PAYMENT_CHANNEL_ID = process.env.FRIEND_PAYMENT_CHANNEL_ID;

            let finalTargetCategory = guild.channels.cache.get(FINAL_TARGET_CHANNEL_ID);

            // Check if the final target category has reached the max number of channels
            if (finalTargetCategory && finalTargetCategory.type === ChannelType.GuildCategory) {
                await channel.setParent(finalTargetCategory.id, {
                    lockPermissions: false,
                });

                // Remove user permissions from the channel
                console.log('Removing permissions for User ID:', claimedByUserId);
                await channel.permissionOverwrites.edit(claimedByUserId, {
                    ViewChannel: false,
                    SendMessages: false,
                    ReadMessageHistory: false,
                }, { type: OverwriteType.Member });

                const claimedByMember = await guild.members.fetch(claimedByUserId);

                // Updated role management logic
                if (claimedByMember.roles.cache.has(ONE_ORDER_ROLE_ID)) {
                    await claimedByMember.roles.remove(ONE_ORDER_ROLE_ID);
                    console.log(`Removed role ${ONE_ORDER_ROLE_ID} from user ${claimedByUserId}`);
                }

                const updatedComponents = message.components.map(row => {
                    const actionRow = new ActionRowBuilder();
                    row.components.forEach(component => {
                        if (component.customId === 'completeOrder') {
                            actionRow.addComponents(
                                new ButtonBuilder()
                                    .setCustomId(component.customId)
                                    .setLabel('Order Completed')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(true)
                            );
                        } else {
                            actionRow.addComponents(ButtonBuilder.from(component));
                        }
                    });
                    return actionRow;
                });

                await interaction.update({
                    content: `Moved ${channel.name} to ${finalTargetCategory.name} after order completion.`,
                    components: updatedComponents,
                });

                console.log("channel id in orderCompleted: ", channel.id);

                // Check the type of order based on the embed title
                const isPassOrder = message.embeds[0].title === "Pass Order Claimed";
                const isFriendsOrder = message.embeds[0].title === "Friend Order Claimed";
                
                const collection = isPassOrder 
                  ? getPasses() 
                  : isFriendsOrder 
                    ? getFriends() 
                    : getCollection();                

                const threadIdDoc = await collection.findOne({ key: `reverse:${channel.id}` });
                const threadId = threadIdDoc ? threadIdDoc.value : null;

                let originalChannelIdDoc = await collection.findOne({ key: `channel:${threadId}` });
                let originalChannelId = originalChannelIdDoc ? originalChannelIdDoc.value : null;
                if (!originalChannelId) {
                    originalChannelId = await redisClient.get(`channel:${threadId}`);
                }

                let postIdDoc = await collection.findOne({ key: `post:${threadId}` });
                let postId = postIdDoc ? postIdDoc.value : null;
                if (!postId) {
                    postId = await redisClient.get(`post:${threadId}`);
                }

                let priceAfterCutDoc = await collection.findOne({ key: `priceAfterCut:${threadId}` });
                let priceAfterCut = priceAfterCutDoc ? priceAfterCutDoc.value : null;
                if (!priceAfterCut) {
                    priceAfterCut = await redisClient.get(`priceAfterCut:${threadId}`);
                }

                console.log("Original channel ID: ", originalChannelId);
                console.log("Post ID: ", postId);
                console.log("Price After Cut: ", priceAfterCut);

                if (originalChannelId && postId && priceAfterCut) {
                    const paymentChannelId = isPassOrder 
                        ? PASSES_PAYMENT_CHANNEL_ID 
                        : isFriendsOrder 
                        ? FRIEND_PAYMENT_CHANNEL_ID 
                        : PAYMENT_CHANNEL_ID;
                  
                    const paymentChannel = interaction.guild.channels.cache.get(paymentChannelId);
                  
                    const paymentEmbed = new EmbedBuilder()
                    .setTitle(isPassOrder 
                      ? "Pass Order Completed" 
                      : isFriendsOrder 
                        ? "Friends Order Completed" 
                        : "Order Completed")
                    .setDescription(`Payment for order completed by <@${claimedByUserId}> - $${parseFloat(priceAfterCut).toFixed(2)} in <#${originalChannelId}>.`)
                    .setColor(0xFFFFFF);
                  

                    await paymentChannel.send({ embeds: [paymentEmbed] });

                    await collection.deleteOne({ key: `channel:${threadId}` });
                    await collection.deleteOne({ key: `post:${threadId}` });
                    await collection.deleteOne({ key: `priceAfterCut:${threadId}` });
                    await collection.deleteOne({ key: `reverse:${channel.id}` });

                    setTimeout(async () => {
                        try {
                            await channel.delete();
                            console.log(`Deleted channel ${channel.id} after 12 hours`);
                        } catch (error) {
                            console.error(`Error deleting channel ${channel.id}:`, error);
                        }
                    }, 12 * 60 * 60 * 1000);

                    await redisClient.set(`deleteChannel:${channel.id}`, 'true', 'EX', 12 * 60 * 60);
    
                    console.log(`Scheduled channel ${channel.id} for deletion in 12 hours`);
                    
                    const originalChannel = guild.channels.cache.get(originalChannelId);
                    if (originalChannel) {
                        await originalChannel.send('**Ticket will delete in 12 hours!**\nThis order has been completed. If you liked our service, please consider buying from us again!');
                    }
                } else {
                    console.error('Original channel ID, post ID, or price after cut not found.');
                }

            } else {
                await interaction.reply({
                    content: 'Final target category not found or not a category.',
                });
            }
        } catch (error) {
            console.error('Error handling order completion:', error);
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'There was an error processing your request. Please try again later.',
                    });
                }
            } catch (replyError) {
                console.error('Error sending reply to interaction:', replyError);
            }
        }
    }
};

export const createOrderCompletedButton = () => {
    return new ButtonBuilder()
        .setCustomId('completeOrder')
        .setLabel('Complete Order')
        .setStyle(ButtonStyle.Success);
};