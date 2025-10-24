import { ActionRowBuilder, ChannelType, ModalSubmitInteraction } from 'discord.js';
import { createClaimOrderButton } from '../components/buttons/claimOrder.js';
import mongoClient from '../store/mongoClient.js';

const { connectToDatabase, getCollection, getCredits, getPasses, getFriends } = mongoClient;

/**
 * Format a number to two decimal places using Math.floor.
 * @param {number} num
 * @returns {string} Formatted number as a string
 */
const formatPrice = (num) => {
    return (Math.floor(num * 100) / 100).toFixed(2);
};

/**
 * Handle the form submission
 * @param {ModalSubmitInteraction} interaction
 */
export async function submitForm(interaction) {

    try {
        if (interaction.fields.getTextInputValue('friendPrice') != undefined) {
            console.log('friendship card activated');
            const SELLER_ROLE_ID = process.env.FRIEND_ROLE_ID;
            console.log('SELLER ROLE ID: ', SELLER_ROLE_ID);
            const ADDS_CHANNEL_ID = process.env.ADDS_CHANNEL_ID;
            const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;
            const postsChannel = interaction.guild.channels.cache.get(ADDS_CHANNEL_ID);
            const priceBeforeCut = interaction.fields.getTextInputValue('friendPrice');
            const passOrder = interaction.fields.getTextInputValue('friendOrder');

            const channelToMove = interaction.channel;
            let targetCategory = interaction.guild.channels.cache.get(TARGET_CHANNEL_ID);

            console.log(`Channel to move: ${channelToMove.name}`);
            console.log(`Target category: ${targetCategory?.name}`);

            if (targetCategory && targetCategory.type === ChannelType.GuildCategory) {
                await channelToMove.setParent(targetCategory.id, {
                    lockPermissions: false,
                });
                console.log(`Moved ${channelToMove.name} to ${targetCategory.name}`);
                await interaction.reply({ content: `Moved ${channelToMove.name} to ${targetCategory.name}` });
            } else {
                console.error('Target category not found or not a category.');
                await interaction.reply({
                    content: "Target category not found or not a category.",
                    
                });
                return;
            }

            try {
                if (postsChannel && postsChannel.type === ChannelType.GuildForum) {
                    const threadName = `$${formatPrice(0.9 * priceBeforeCut)} - ${passOrder}`;
                    const orderInfoEmbed = {
                        color: 0xFFFFFF,
                        title: 'Order Information',
                        fields: [
                            { name: 'Price', value: `$${formatPrice(0.9 * priceBeforeCut)}`, inline: true },
                            { name: 'Friend Order', value: passOrder, inline: true },
                        ],
                        timestamp: new Date(),
                    };
        
                    const claimButton = createClaimOrderButton();
        
                    const actionRow = new ActionRowBuilder()
                        .addComponents(claimButton);
        
                    const thread = await postsChannel.threads.create({
                        name: threadName,
                        message: { content: `<@&${SELLER_ROLE_ID}>`, embeds: [orderInfoEmbed], components: [actionRow] },
                    });
                    
                    const collection = getFriends();
                    
                    await collection.insertOne({ key: `channel:${thread.id}`, value: channelToMove.id });
                    await collection.insertOne({ key: `post:${thread.id}`, value: thread.id });
                    await collection.insertOne({ key: `priceAfterCut:${thread.id}`, value: formatPrice(0.9 * priceBeforeCut) });
        
                    await interaction.followUp({ content: 'Order processed successfully.' });
                    return;
                } else {
                    console.error('Posts channel not found or not a forum channel.');
                    await interaction.followUp({
                        content: "Posts channel not found or not a forum channel.",
                        
                    });
                    return;
                }
            } catch (error) {
                console.error("it's not that serious", error);
                return;
            }
        }
    } catch (e) {
        console.log('exception in modalSubmit: ', e);

    }

    try {
        if (interaction.fields.getTextInputValue('passPrice') != undefined) {
            console.log('trap card activated');
            // const PASSES_CATEGORY_ID = process.env.PASSES_CATEGORY_ID;
            const SELLER_ROLE_ID = process.env.SELLER_ROLE_ID;
            const PASSES_CHANNEL_ID = process.env.PASSES_CHANNEL_ID;
            const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;
            const postsChannel = interaction.guild.channels.cache.get(PASSES_CHANNEL_ID);
            const priceBeforeCut = interaction.fields.getTextInputValue('passPrice');
            const passOrder = interaction.fields.getTextInputValue('passOrder');

            const channelToMove = interaction.channel;
            let targetCategory = interaction.guild.channels.cache.get(TARGET_CHANNEL_ID);

            console.log(`Channel to move: ${channelToMove.name}`);
            console.log(`Target category: ${targetCategory?.name}`);

            if (targetCategory && targetCategory.type === ChannelType.GuildCategory) {
                await channelToMove.setParent(targetCategory.id, {
                    lockPermissions: false,
                });
                console.log(`Moved ${channelToMove.name} to ${targetCategory.name}`);
                await interaction.reply({ content: `Moved ${channelToMove.name} to ${targetCategory.name}` });
            } else {
                console.error('Target category not found or not a category.');
                await interaction.reply({
                    content: "Target category not found or not a category.",
                    
                });
                return;
            }

            try {
                if (postsChannel && postsChannel.type === ChannelType.GuildForum) {
                    const threadName = `$${formatPrice(0.97058823529 * priceBeforeCut)} - ${passOrder}`;
                    const orderInfoEmbed = {
                        color: 0xFFFFFF,
                        title: 'Order Information',
                        fields: [
                            { name: 'Price', value: `$${formatPrice(0.97058823529 * priceBeforeCut)}`, inline: true },
                            { name: 'Pass Order', value: passOrder, inline: true },
                        ],
                        timestamp: new Date(),
                    };
        
                    const claimButton = createClaimOrderButton();
        
                    const actionRow = new ActionRowBuilder()
                        .addComponents(claimButton);
        
                    const thread = await postsChannel.threads.create({
                        name: threadName,
                        message: { content: `<@&${SELLER_ROLE_ID}>`, embeds: [orderInfoEmbed], components: [actionRow] },
                    });
                    
                    const collection = getPasses();
                    
                    await collection.insertOne({ key: `channel:${thread.id}`, value: channelToMove.id });
                    await collection.insertOne({ key: `post:${thread.id}`, value: thread.id });
                    await collection.insertOne({ key: `priceAfterCut:${thread.id}`, value: formatPrice(0.97058823529 * priceBeforeCut) });
        
                    await interaction.followUp({ content: 'Order processed successfully.' });
                    return;
                } else {
                    console.error('Posts channel not found or not a forum channel.');
                    await interaction.followUp({
                        content: "Posts channel not found or not a forum channel.",
                        
                    });
                    return;
                }
            } catch (error) {
                console.error("it's not that serious", error);
                return;
            }
        }
    } catch (e) {
        console.log('exception in modalSubmit: ', e);
    }

    const pulledPrice = interaction.fields.getTextInputValue('priceBeforeCut');
    const priceBeforeCut = pulledPrice.replace('$', '');
    const order = interaction.fields.getTextInputValue('order');
    const keyPoints = interaction.fields.getTextInputValue('keyPoints');
    const specialNotes = interaction.fields.getTextInputValue('specialNotes');
    const region = interaction.fields.getTextInputValue('region');

    const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;
    const POSTS_CHANNEL_ID = process.env.POSTS_CHANNEL_ID;
    const ROLE_ID_TO_PING = process.env.ROLE_ID_TO_PING;

    try {
        const channelToMove = interaction.channel;
        let targetCategory = interaction.guild.channels.cache.get(TARGET_CHANNEL_ID);

        console.log(`Channel to move: ${channelToMove.name}`);
        console.log(`Target category: ${targetCategory?.name}`);

        if (targetCategory && targetCategory.type === ChannelType.GuildCategory) {
            await channelToMove.setParent(targetCategory.id, {
                lockPermissions: false,
            });
            console.log(`Moved ${channelToMove.name} to ${targetCategory.name}`);
            await interaction.reply({ content: `Moved ${channelToMove.name} to ${targetCategory.name}` });
        } else {
            console.error('Target category not found or not a category.');
            await interaction.reply({
                content: "Target category not found or not a category.",
                
            });
            return; // Exit if the category is not found or invalid
        }

        const postsChannel = interaction.guild.channels.cache.get(POSTS_CHANNEL_ID);

        if (postsChannel && postsChannel.type === ChannelType.GuildForum) {
            const maxNameLength = 100;
            const orderShortened = order.length > maxNameLength - 20 ? order.substring(0, maxNameLength - 20) + '...' : order;
            const threadName = `$${formatPrice(0.7 * priceBeforeCut)} - ${orderShortened}`;

            const maxFieldLength = 1024;
            const keyPointsField = keyPoints && keyPoints.length > maxFieldLength ? 'SEE BELOW' : keyPoints;
            const orderField = order.length > maxFieldLength ? 'SEE BELOW' : order;
            const specialNotesField = specialNotes && specialNotes.length > maxFieldLength ? 'SEE BELOW' : (specialNotes || 'None');

            const orderInfoEmbed = {
                color: 0xFFFFFF,
                title: 'Order Information',
                fields: [
                    { name: 'Price', value: `$${formatPrice(0.7 * priceBeforeCut)}`, inline: true },
                    { name: 'Key Points', value: keyPointsField, inline: true },
                    { name: 'Order', value: orderField, inline: true },
                    { name: 'Region', value: region, inline: true },
                    { name: 'Special Notes', value: specialNotesField, inline: true },
                ],
                timestamp: new Date(),
            };

            const claimButton = createClaimOrderButton();

            const actionRow = new ActionRowBuilder()
                .addComponents(claimButton);

            const thread = await postsChannel.threads.create({
                name: threadName,
                message: { content: `<@&${ROLE_ID_TO_PING}>`, embeds: [orderInfoEmbed], components: [actionRow] },
            });

            const collection = getCollection();

            await collection.insertOne({ key: `channel:${thread.id}`, value: channelToMove.id });
            await collection.insertOne({ key: `post:${thread.id}`, value: thread.id });
            await collection.insertOne({ key: `priceAfterCut:${thread.id}`, value: formatPrice(0.7 * priceBeforeCut) });

            // Function to split text into chunks of specified size
            const splitText = (text, size) => {
                const chunks = [];
                for (let i = 0; i < text.length; i += size) {
                    chunks.push(text.substring(i, i + size));
                }
                return chunks;
            };

            // Post the full content of the order in separate messages if needed
            if (order.length > maxFieldLength) {
                const orderChunks = splitText(order, 1800); // Discord's message limit is 2000 characters
                let firstChunk = true;
                for (const chunk of orderChunks) {
                    if (firstChunk) {
                        await thread.send(`**Full Order:**\n${chunk}`);
                        firstChunk = false;
                    } else {
                        await thread.send(chunk);
                    }
                }
            }

            await interaction.followUp({ content: 'Order processed successfully.' });
        } else {
            console.error('Posts channel not found or not a forum channel.');
            await interaction.followUp({
                content: "Posts channel not found or not a forum channel.",
                
            });
        }

    } catch (error) {
        console.error('Error processing form submission:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'There was an error processing the form submission.',
                
            });
        }
    }
}
