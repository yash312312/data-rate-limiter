class TokenBucket {
    constructor(capacity, fillRate){
        this.capacity = capacity;
        this.fillRate = fillRate;
        this.tokens = capacity;
        this.lastChecked = Date.now();
    }

    refill () {
        const now = Date.now();
        const elapsedSeconds = (now - this.lastChecked) / 1000;
        this.lastChecked = now;

        const tokensToAdd = elapsedSeconds * this.fillRate;
        this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    }

    consume () {
        this.refill();
        if(this.tokens > 0) {
            this.tokens -= 1;
            return {
                allowed: true,
                tokens: this.tokens,
                capacity: this.capacity
            }
        }

        return {
            allowed: false,
            tokens: 0,
            capacity: this.capacity
        };
    }
}

module.exports = TokenBucket;
