/* import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('REDIS URL is not defined. Please set the REDIS_URL environment variable.');
  process.exit(1);
}

const client = new Redis(redisUrl);

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

export default client; */
