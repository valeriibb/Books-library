import { createClient } from 'redis';
import env from './environment';

const url = env.REDIS_URL;
const redisClient = url
  ? createClient({ url })
  : createClient({ socket: { host: 'localhost', port: 6379 } });

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Функція для підключення
export const connectRedis = async () => {
    await redisClient.connect();
};

export default redisClient;