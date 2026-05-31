const InMemoryStore = require('../algorithms/inMemoryStore');
const RedisStore = require('../algorithms/redisStore');

const CONFIG = {
  CAPACITY: 10,       // Max burst: 10 requests at once
  REFILL_RATE: 2,     // Refill: 2 tokens per second (= 120 req/min sustained)
  WINDOW_SECONDS: 60  // Used only for the Reset header calculation
};

// const store = new InMemoryStore(CONFIG.CAPACITY, CONFIG.REFILL_RATE);
const redisStore = new RedisStore(CONFIG.CAPACITY, CONFIG.REFILL_RATE);

const rateLimiterMiddleware = async (req, res, next) => {
    const clientId = req.ip;

    const result = await redisStore.consume(clientId);
    res.setHeader('X-RateLimit-Limit', CONFIG.CAPACITY);
    res.setHeader('X-RateLimit-Remaining', result.tokens);
    res.setHeader(
        'X-RateLimit-Reset',
        Math.ceil(Date.now() / 1000) + CONFIG.WINDOW_SECONDS
    );

    if (result.allowed) {
        next();
    } else {
        res.status(429).send('Rate limit exceeded');
    }
};

module.exports = { rateLimiterMiddleware, CONFIG };
