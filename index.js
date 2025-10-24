import { Client, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { claimOrderButton } from './components/buttons/claimOrder.js';
import { orderCompletedButton } from './components/buttons/orderCompleted.js';
import { submitForm } from './handlers/modalSubmit.js';
import mongoClient from './store/mongoClient.js';
import redisClient from './store/redisClient.js';

const { connectToDatabase, getCollection, getCredits } = mongoClient;

dotenv.config();

(async () => {
    await connectToDatabase();
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
        ],
    });
    
    client.commands = {};
    client.buttons = {};

    const commands = await fs.readdir('./commands');
    for (const file of commands) {
        const { command } = await import(`./commands/${file}`);
        client.commands[command.data.name] = command;
    }

    const events = await fs.readdir('./events');
    for (const file of events) {
        const { event } = await import(`./events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.callback(...args, client));
        } else {
            client.on(event.name, (...args) => event.callback(...args, client));
        }
    }
    
    client.buttons[claimOrderButton.customId] = claimOrderButton;
    client.buttons[orderCompletedButton.customId] = orderCompletedButton;
    
    client.on(Events.InteractionCreate, async interaction => {
        if (interaction.isChatInputCommand()) {
            const command = client.commands[interaction.commandName];
            if (command) {
                await command.callback(interaction);
            }
        } else if (interaction.isModalSubmit()) {
            await submitForm(interaction);
        } else if (interaction.isButton()) {
            const button = client.buttons[interaction.customId];
            if (button) {
                await button.callback(interaction);
            }
        }
    });
    
    client.login(process.env.DISCORD_TOKEN);

    process.on('unhandledRejection', error => {
        console.error('Unhandled promise rejection:', error);
    });

    process.on('uncaughtException', error => {
        console.error('Uncaught exception:', error);
    });

    const pollForChannelDeletions = async () => {
        setInterval(async () => {
            try {
                console.log('POLLING FOR SKIBIDI TICKETS!');
                const keys = await redisClient.keys('deleteChannel:*');
                for (const key of keys) {
                    const channelId = key.split(':')[1];
                    const channel = await client.channels.fetch(channelId);

                    if (channel) {
                        await channel.delete();
                        console.log(`Deleted channel ${channelId} after 12-hour expiration.`);
                        await redisClient.del(key);
                    }
                }
            } catch (error) {
                console.error('Error polling for channel deletions:', error);
            }
        }, 5 * 60 * 1000);
    };

    pollForChannelDeletions();
})();
