const Redis = require('ioredis');
const TokenBucket = require('./tokenBucket');

class RedisStore {
    constructor (capacity, fillRate) {
        this.capacity = capacity;
        this.fillRate = fillRate;
        this.redisClient = new Redis();

        this.redisClient.on('connect', () => console.log('Connected to Redis'));
        this.redisClient.on('error', (err) => console.error('Redis error:', err));
    }

    async consume (clientId) {
        try {
            const data = await this.redisClient.hgetall(clientId);
            const bucket = new TokenBucket(this.capacity, this.fillRate);

            if (data && data.tokens !== undefined) {
                // Restore previous state into the bucket
                bucket.tokens = parseFloat(data.tokens);
                bucket.lastChecked = parseInt(data.lastChecked);
            }

            const result = bucket.consume();

            await this.redisClient.hset(clientId,
                'tokens', bucket.tokens,
                'lastChecked', bucket.lastChecked
            );

            await this.redisClient.expire(clientId, 3600); // 1 hour

            return result;
        }
            catch (err) {
            console.error('Redis error:', err.message);

            // Fail open
            return { allowed: true, tokens: -1, capacity: this.capacity };

            // Fail closed
            // return { allowed: false, tokens: 0, capacity: this.capacity };
        }
    }

    async quit() {
        await this.redisClient.quit();
    }
}

module.exports = RedisStore;