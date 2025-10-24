import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import mongoClient from '../../store/mongoClient.js';
import { createOrderCompletedButton } from '../buttons/orderCompleted.js';

const { connectToDatabase, getCollection, getPasses, getFriends } = mongoClient;

export const claimOrderButton = {
    customId: 'customOrder',
    /**
     * @param {import("discord.js").ButtonInteraction} interaction
     */
    async callback(interaction) {
        try {
            const { user, guild, message } = interaction;

            const roleMentionMatch = message.content.match(/<@&(\d+)>/);
            const pingedRoleId = roleMentionMatch ? roleMentionMatch[1] : null;

            console.log(`Pinged Role ID: ${pingedRoleId}`);
            if (pingedRoleId == process.env.SELLER_ROLE_ID) {
                const updatedComponents = message.components.map(row => {
                    const actionRow = new ActionRowBuilder();
                    row.components.forEach(component => {
                        if (component.customId === 'customOrder') {
                            actionRow.addComponents(
                                new ButtonBuilder()
                                    .setCustomId(component.customId)
                                    .setLabel('Claimed')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(true)
                            );
                        } else {
                            actionRow.addComponents(ButtonBuilder.from(component));
                        }
                    });
                    return actionRow;
                });
    
                // Update the original message
                const newContent = message.content.replace(
                    `<@&${process.env.SELLER_ROLE_ID}>`,
                    `Order claimed by <@${user.id}>!`
                );
    
                await interaction.update({
                    content: newContent,
                    components: updatedComponents
                });
    
                await interaction.followUp({
                    content: 'You have claimed this order!',
                    
                });
    
                const thread = interaction.channel;
                console.log("thread id in claimorder: ", thread.id);
    
                const collection = getPasses();
                const orderData = await collection.findOne({ key: `channel:${thread.id}` });
                
                if (orderData) {
                    const originalChannelId = orderData.value;
                    const postIdDoc = await collection.findOne({ key: `post:${thread.id}` });
                    const postId = postIdDoc ? postIdDoc.value : null;
                    const priceAfterCutDoc = await collection.findOne({ key: `priceAfterCut:${thread.id}` });
                    const priceAfterCut = priceAfterCutDoc ? priceAfterCutDoc.value : null;
    
                    await collection.insertOne({ key: `reverse:${originalChannelId}`, value: thread.id });
    
                    console.log("Original channel ID: ", originalChannelId);
                    console.log("Post ID: ", postId);
                    console.log("Price After Cut: ", priceAfterCut);
    
                    if (originalChannelId) {
                        const originalChannel = guild.channels.cache.get(originalChannelId);
                        const NEW_TARGET_CHANNEL_ID = process.env.PASSES_CATEGORY_ID;
                        console.log("Target ID: ", NEW_TARGET_CHANNEL_ID);
    
                        const newTargetCategory = guild.channels.cache.get(NEW_TARGET_CHANNEL_ID);
                        console.log("New target category: ", newTargetCategory);
    
                        if (newTargetCategory && newTargetCategory.type === ChannelType.GuildCategory) {
                            await originalChannel.setParent(newTargetCategory.id, {
                                lockPermissions: false,
                            });
    
                            console.log(`Channel ID after move: ${originalChannel.id}`);

                            await originalChannel.permissionOverwrites.edit(user.id, {
                                [PermissionsBitField.Flags.ViewChannel]: true,
                                [PermissionsBitField.Flags.SendMessages]: true,
                                [PermissionsBitField.Flags.ReadMessageHistory]: true,
                            });
    
                            await originalChannel.send(`<@${user.id}>`);
    
                            const claimedEmbed = new EmbedBuilder()
                                .setTitle("Pass Order Claimed")
                                .setDescription(`This pass order has been claimed by <@${user.id}>!`)
                                .setColor(0xFFFFFF);
    
                            const completedButton = createOrderCompletedButton();
                            const newActionRow = new ActionRowBuilder().addComponents(completedButton);
    
                            await originalChannel.send({
                                embeds: [claimedEmbed],
                                components: [newActionRow]
                            });
    
                            const orderField = message.embeds[0].fields.find(field => field.name === 'Pass Order');
                            const orderDetails = orderField ? orderField.value : 'Order details not found.';
                            await originalChannel.send(`The pass order is as follows:\n${orderDetails}`);
    
                            const lastTwo = await originalChannel.messages.fetch({ limit: 2 });
                            if (lastTwo.size === 2) {
                                const [orderMessage, embedMessage] = lastTwo.values();
                                await orderMessage.pin();
                                await embedMessage.pin();
                            }
                        } else {
                            await thread.send('New target category not found or not a category.');
                        }
                    } else {
                        await thread.send('Original channel ID not found.');
                    }

                    setTimeout(async () => {
                        try {
                            await thread.delete('Channel deleted after 5 minutes of being claimed.');
                            console.log(`Channel ${thread.id} deleted successfully.`);
                        } catch (deleteError) {
                            console.error('Error deleting the channel:', deleteError);
                        }
                    }, 5 * 60 * 1000);
                    return;
                } else {
                    await thread.send('Order data not found.');
                    return;
                }
            }
            else if (pingedRoleId == process.env.FRIEND_ROLE_ID) { /////////////////////////////// I have no friends
                const updatedComponents = message.components.map(row => {
                    const actionRow = new ActionRowBuilder();
                    row.components.forEach(component => {
                        if (component.customId === 'customOrder') {
                            actionRow.addComponents(
                                new ButtonBuilder()
                                    .setCustomId(component.customId)
                                    .setLabel('Claimed')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(true)
                            );
                        } else {
                            actionRow.addComponents(ButtonBuilder.from(component));
                        }
                    });
                    return actionRow;
                });
    
                // Update the original message
                const newContent = message.content.replace(
                    `<@&${process.env.FRIEND_ROLE_ID}>`,
                    `Order claimed by <@${user.id}>!`
                );
    
                await interaction.update({
                    content: newContent,
                    components: updatedComponents
                });
    
                await interaction.followUp({
                    content: 'You have claimed this order!',
                    
                });
    
                const thread = interaction.channel;
                console.log("thread id in claimorder: ", thread.id);
    
                const collection = getFriends();
                const orderData = await collection.findOne({ key: `channel:${thread.id}` });
                
                if (orderData) {
                    const originalChannelId = orderData.value;
                    const postIdDoc = await collection.findOne({ key: `post:${thread.id}` });
                    const postId = postIdDoc ? postIdDoc.value : null;
                    const priceAfterCutDoc = await collection.findOne({ key: `priceAfterCut:${thread.id}` });
                    const priceAfterCut = priceAfterCutDoc ? priceAfterCutDoc.value : null;
    
                    await collection.insertOne({ key: `reverse:${originalChannelId}`, value: thread.id });
    
                    console.log("Original channel ID: ", originalChannelId);
                    console.log("Post ID: ", postId);
                    console.log("Price After Cut: ", priceAfterCut);
    
                    if (originalChannelId) {
                        const originalChannel = guild.channels.cache.get(originalChannelId);
                        const NEW_TARGET_CHANNEL_ID = process.env.ADDS_CATEGORY_ID;
                        console.log("Target ID: ", NEW_TARGET_CHANNEL_ID);
    
                        const newTargetCategory = guild.channels.cache.get(NEW_TARGET_CHANNEL_ID);
                        console.log("New target category: ", newTargetCategory);
    
                        if (newTargetCategory && newTargetCategory.type === ChannelType.GuildCategory) {
                            await originalChannel.setParent(newTargetCategory.id, {
                                lockPermissions: false,
                            });
    
                            console.log(`Channel ID after move: ${originalChannel.id}`);

                            await originalChannel.permissionOverwrites.edit(user.id, {
                                [PermissionsBitField.Flags.ViewChannel]: true,
                                [PermissionsBitField.Flags.SendMessages]: true,
                                [PermissionsBitField.Flags.ReadMessageHistory]: true,
                            });
    
                            await originalChannel.send(`<@${user.id}>`);
    
                            const claimedEmbed = new EmbedBuilder()
                                .setTitle("Friend Order Claimed")
                                .setDescription(`This friend order has been claimed by <@${user.id}>!`)
                                .setColor(0xFFFFFF);
    
                            const completedButton = createOrderCompletedButton();
                            const newActionRow = new ActionRowBuilder().addComponents(completedButton);
    
                            await originalChannel.send({
                                embeds: [claimedEmbed],
                                components: [newActionRow]
                            });
    
                            const orderField = message.embeds[0].fields.find(field => field.name === 'Friend Order');
                            const orderDetails = orderField ? orderField.value : 'Order details not found.';
                            await originalChannel.send(`The friend order is as follows:\n${orderDetails}`);
    
                            const lastTwo = await originalChannel.messages.fetch({ limit: 2 });
                            if (lastTwo.size === 2) {
                                const [orderMessage, embedMessage] = lastTwo.values();
                                await orderMessage.pin();
                                await embedMessage.pin();
                            }
                        } else {
                            await thread.send('New target category not found or not a category.');
                        }
                    } else {
                        await thread.send('Original channel ID not found.');
                    }
    
                    // Schedule channel deletion after 5 minutes
                    setTimeout(async () => {
                        try {
                            await thread.delete('Channel deleted after 5 minutes of being claimed.');
                            console.log(`Channel ${thread.id} deleted successfully.`);
                        } catch (deleteError) {
                            console.error('Error deleting the channel:', deleteError);
                        }
                    }, 5 * 60 * 1000);
                    return;
                } else {
                    await thread.send('Order data not found.');
                    return;
                }
            }
            // ////////////////////////////////// DEFAULT ORDER!!!!!!!
            // Role IDs from environment variables
            const ONE_ORDER_ROLE_ID = process.env.ONE_ORDER_ROLE_ID;
            // const TWO_ORDER_ROLE_ID = process.env.TWO_ORDER_ROLE_ID;

            // Member object
            const member = guild.members.cache.get(user.id);

            // Conditional logic for role assignment
            if (!member.roles.cache.has(ONE_ORDER_ROLE_ID)) {
                await member.roles.add(ONE_ORDER_ROLE_ID);
                console.log(`Added ONE_ORDER_ROLE_ID to user ${user.id}`);
            }
            else {
                await interaction.reply({
                    content: 'You already have one order. Please do not try and claim another one.',
                });
                return;
            }

            // Update the original message components
            const updatedComponents = message.components.map(row => {
                const actionRow = new ActionRowBuilder();
                row.components.forEach(component => {
                    if (component.customId === 'customOrder') {
                        actionRow.addComponents(
                            new ButtonBuilder()
                                .setCustomId(component.customId)
                                .setLabel('Claimed')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );
                    } else {
                        actionRow.addComponents(ButtonBuilder.from(component));
                    }
                });
                return actionRow;
            });

            // Update the original message
            const newContent = message.content.replace(
                `<@&${process.env.ROLE_ID_TO_PING}>`,
                `Order claimed by <@${user.id}>!`
            );

            await interaction.update({
                content: newContent,
                components: updatedComponents
            });

            await interaction.followUp({
                content: 'You have claimed this order!',
                
            });

            const thread = interaction.channel;
            console.log("thread id in claimorder: ", thread.id);

            const collection = getCollection();
            const orderData = await collection.findOne({ key: `channel:${thread.id}` });
            
            if (orderData) {
                const originalChannelId = orderData.value;
                const postIdDoc = await collection.findOne({ key: `post:${thread.id}` });
                const postId = postIdDoc ? postIdDoc.value : null;
                const priceAfterCutDoc = await collection.findOne({ key: `priceAfterCut:${thread.id}` });
                const priceAfterCut = priceAfterCutDoc ? priceAfterCutDoc.value : null;

                await collection.insertOne({ key: `reverse:${originalChannelId}`, value: thread.id });

                console.log("Original channel ID: ", originalChannelId);
                console.log("Post ID: ", postId);
                console.log("Price After Cut: ", priceAfterCut);

                if (originalChannelId) {
                    const originalChannel = guild.channels.cache.get(originalChannelId);
                    const NEW_TARGET_CHANNEL_ID = process.env.NEW_TARGET_CHANNEL_ID;
                    console.log("Target ID: ", NEW_TARGET_CHANNEL_ID);

                    const newTargetCategory = guild.channels.cache.get(NEW_TARGET_CHANNEL_ID);
                    console.log("New target category: ", newTargetCategory);

                    if (newTargetCategory && newTargetCategory.type === ChannelType.GuildCategory) {
                        await originalChannel.setParent(newTargetCategory.id, {
                            lockPermissions: false,
                        });

                        console.log(`Channel ID after move: ${originalChannel.id}`);

                        // Grant permissions to the user in the original channel
                        await originalChannel.permissionOverwrites.edit(user.id, {
                            [PermissionsBitField.Flags.ViewChannel]: true,
                            [PermissionsBitField.Flags.SendMessages]: true,
                            [PermissionsBitField.Flags.ReadMessageHistory]: true,
                        });

                        await originalChannel.send(`<@${user.id}>`);

                        const claimedEmbed = new EmbedBuilder()
                            .setTitle("Order Claimed")
                            .setDescription(`This order has been claimed by <@${user.id}>!`)
                            .setColor(0xFFFFFF);

                        const completedButton = createOrderCompletedButton();
                        const newActionRow = new ActionRowBuilder().addComponents(completedButton);

                        await originalChannel.send({
                            embeds: [claimedEmbed],
                            components: [newActionRow]
                        });

                        const orderField = message.embeds[0].fields.find(field => field.name === 'Order');
                        const orderDetails = orderField ? orderField.value : 'Order details not found.';
                        await originalChannel.send(`The order order is as follows:\n${orderDetails}`);

                        const lastTwo = await originalChannel.messages.fetch({ limit: 2 });
                        if (lastTwo.size === 2) {
                            const [orderMessage, embedMessage] = lastTwo.values();
                            await orderMessage.pin();
                            await embedMessage.pin();
                        }
                    } else {
                        await thread.send('New target category not found or not a category.');
                    }
                } else {
                    await thread.send('Original channel ID not found.');
                }

                // Schedule channel deletion after 5 minutes
                setTimeout(async () => {
                    try {
                        await thread.delete('Channel deleted after 5 minutes of being claimed.');
                        console.log(`Channel ${thread.id} deleted successfully.`);
                    } catch (deleteError) {
                        console.error('Error deleting the channel:', deleteError);
                    }
                }, 5 * 60 * 1000);

            } else {
                await thread.send('Order data not found.');
            }

        } catch (error) {
            console.error('Error handling button interaction:', error);
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

export const createClaimOrderButton = () => {
    return new ButtonBuilder()
        .setCustomId('customOrder')
        .setLabel('Claim Order')
        .setStyle(ButtonStyle.Success);
};