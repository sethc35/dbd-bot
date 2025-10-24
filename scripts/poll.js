import { setInterval } from 'node:timers';
import redisClient from '../store/redisClient.js';

async function pollForChannelDeletions(client) {
    setInterval(async () => {
        try {
            // Get all keys that match deleteChannel:*
            const keys = await redisClient.keys('deleteChannel:*');
            for (const key of keys) {
                const channelId = key.split(':')[1];
                const channel = await client.channels.fetch(channelId);

                if (channel) {
                    await channel.delete();
                    console.log(`Deleted channel ${channelId} after 12-hour expiration.`);
                    
                    // Remove the key from Redis after deletion
                    await redisClient.del(key);
                }
            }
        } catch (error) {
            console.error('Error polling for channel deletions:', error);
        }
    }, 5 * 60 * 1000); // Poll every 5 minutes
}

export { pollForChannelDeletions };
