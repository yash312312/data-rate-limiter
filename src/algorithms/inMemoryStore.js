const TokenBucket = require('./tokenBucket');

class InMemoryStore {
    constructor (capacity, fillRate) {
        this.capacity = capacity;
        this.fillRate = fillRate;
        this.bucketMap = new Map();
    }

    getBucket (clientId) {
        if(this.bucketMap.has(clientId)) {
            return this.bucketMap.get(clientId);
        }

        const newBucket = new TokenBucket(this.capacity, this.fillRate);
        this.bucketMap.set(clientId, newBucket);
        return newBucket;
    }

    consume (clientId) {
        const bucket = this.getBucket(clientId);
        return bucket.consume();
    }

    getClientCount () {
        return this.bucketMap.size;
    }

    reset (clientId) {
        this.bucketMap.delete(clientId);
    }
}

module.exports = InMemoryStore;
