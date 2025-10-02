import redisClient from '../config/redis';

class CacheService {
    // Основний метод для збереження даних
    async set(key: string, value: any, expiration: number = 3600): Promise<void> {
        try {
            await redisClient.set(key, JSON.stringify(value), {
                EX: expiration // expiration в секундах
            });
        } catch (error) {
            console.error('Cache set error:', error);
            throw error;
        }
    }

    // Основний метод для отримання даних
    async get(key: string): Promise<any> {
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    // Видалення ключа
    async delete(key: string): Promise<void> {
        try {
            await redisClient.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
            throw error;
        }
    }

    // Очищення всього кешу
    async clear(): Promise<void> {
        try {
            await redisClient.flushAll();
        } catch (error) {
            console.error('Cache clear error:', error);
            throw error;
        }
    }

    // Перевірка існування ключа
    async exists(key: string): Promise<boolean> {
        try {
            const result = await redisClient.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    // Отримання TTL (часу життя)
    async getTTL(key: string): Promise<number> {
        try {
            return await redisClient.ttl(key);
        } catch (error) {
            console.error('Cache TTL error:', error);
            return -2;
        }
    }
}

export default new CacheService();