import fs from 'fs/promises';
import client from '../store/redisClient.js';

client.on('error', (err) => {
  console.log('Redis client error: ' + err);
});

client.keys('*', async (err, keys) => {
  if (err) {
    console.log('Error fetching keys: ' + err);
    return;
  }

  console.log(`Fetched ${keys.length} keys from Redis`);

  const results = [];
  let processedKeys = 0;

  for (const key of keys) {
    console.log('Processing key: ' + key);
    
    if (!key.includes(':')) {
      console.log('Ignoring key without prefix: ' + key);
      continue;
    }

    try {
      const value = await new Promise((resolve, reject) => {
        client.get(key, (err, value) => {
          if (err) {
            reject('Error getting value for key ' + key + ': ' + err);
          } else {
            resolve(value);
          }
        });
      });

      let parsedValue;

      // Try to parse the value as an integer, if it fails, keep it as a string
      if (!isNaN(value) && !isNaN(parseInt(value))) {
        parsedValue = parseInt(value);
      } else {
        parsedValue = value;
      }

      const [prefix, id] = key.split(':');
      results.push({
        key: key,
        prefix: prefix,
        id: id,
        value: parsedValue
      });

      // Log when a new key is processed
      console.log(`Processed key: ${key} with value: ${parsedValue}`);

      processedKeys++;
    } catch (error) {
      console.log('Error fetching value for key:', key, error);
    }
  }

  console.log(`Processed ${processedKeys} keys out of ${keys.length}`);

  // Write to JSON file once all keys are processed
  try {
    await fs.writeFile('redis_data.json', JSON.stringify(results, null, 2));
    console.log('Data saved to redis_data.json');
  } catch (err) {
    console.error('Error saving data to redis_data.json: ' + err);
  } finally {
    client.quit(() => {
      console.log('Redis client disconnected');
    });
  }
});
