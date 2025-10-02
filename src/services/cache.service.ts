import redisClient from '../config/redis';

class CacheService {
    async set(key: string, value: any, expiration: number = 3600): Promise<void> {
        await redisClient.set(key, JSON.stringify(value), { EX: expiration });
    }

    async get(key: string): Promise<any> {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }

    async delete(key: string): Promise<void> {
        await redisClient.del(key);
    }

    async clear(): Promise<void> {
        await redisClient.flushAll();
    }
}

export default new CacheService();

