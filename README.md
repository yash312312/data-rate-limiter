# Distributed Rate Limiter

A production-inspired rate limiter built from scratch in Node.js — no libraries, no shortcuts. Implements the **Token Bucket algorithm** with Redis as shared state across multiple server instances.

---

## How It Works

### Token Bucket Algorithm

Imagine a bucket that holds tokens:
- Every request **consumes 1 token**
- Tokens **refill at a fixed rate** over time (lazy refill — no timers, calculated on demand)
- Bucket empty → **429 Too Many Requests**
- Bucket has tokens → **request allowed**

```
capacity = 10 tokens
refillRate = 2 tokens/sec

→ User can burst 10 requests instantly
→ After that, sustained rate of 2 req/sec
```

## Architecture

```
Client
  │
  ▼
Express Middleware  ←── rateLimiterMiddleware runs first
  │
  ├── allowed?  ──→  Route Handler  ──→  200 OK
  │
  └── blocked?  ──→  429 Too Many Requests
        │
        ▼
      Redis
  (shared token state per client IP)
```

### Project Structure

```
src/
├── algorithms/
│   ├── tokenBucket.js      ← Core algorithm (capacity, refill, consume)
│   └── redisStore.js       ← Persists bucket state in Redis per client
├── middleware/
│   └── rateLimiter.js      ← Express middleware, sets headers, returns 429
├── routes/
│   ├── api.js              ← Protected endpoints (/api/hello, /api/data)
│   └── home.js             ← Live browser UI to test rate limiting
└── server.js               ← Wires everything together

---

## Rate Limit Headers

Every response includes standard rate limit headers that clients can use to back off gracefully:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Max requests allowed |
| `X-RateLimit-Remaining` | Requests left in current window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |
| `Retry-After` | Seconds to wait before retrying (on 429 only) |

---

## Known Limitations

### Race Condition
The current implementation has a race condition at high concurrency. Two server instances can both read the token count simultaneously, both see tokens available, and both allow the request — exceeding the limit.

```
Server 1: hgetall → tokens = 1  (reads)
Server 2: hgetall → tokens = 1  (reads before Server 1 writes)
Server 1: allows request, hset tokens = 0
Server 2: allows request, hset tokens = 0  ← should have been blocked
```

**The fix** is a Redis Lua script — executes read-check-write atomically on the Redis server so no two clients can interleave. This is Phase 3.

### Fail Open
When Redis is unavailable, the current implementation fails open — requests are allowed through. This prioritises availability over strict rate limiting. Swap the `catch` block return value in `redisStore.js` to fail closed if security is the priority.

---

## Getting Started

### Prerequisites

#### Mac
 
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
 
# Install Node.js
brew install node
 
# Install Redis
brew install redis
brew services start redis
 
# Verify Redis is running
redis-cli ping   # → PONG
```
 
#### Windows
 
```bash
# Step 1 — Install Node.js
# Download installer from https://nodejs.org and run it
# Verify:
node --version
npm --version
 
# Step 2 — Install Docker Desktop
# Download from https://www.docker.com/products/docker-desktop
# After installing, make sure Docker is running (check the taskbar icon)
 
# Step 3 — Run Redis inside Docker
docker run -d --name redis -p 6379:6379 redis
 
# Verify Redis is running
docker exec -it redis redis-cli ping   # → PONG
```

### Run the App

```bash
git clone https://github.com/yash312312/data-rate-limiter.git
cd data-rate-limiter
npm install
npm start
```

Open `http://localhost:3000` in your browser. You'll see a live UI where you can fire requests and watch tokens drain in real time.


### Inspect Redis Live

While the app is running, open `redis-cli` and watch token state update in real time:

```bash
redis-cli

KEYS *
# → "::1"

HGETALL "::1"
# → tokens           7.5
#    lastRefillTime   1716123456789
```

---

## API Endpoints

| Endpoint | Rate Limited | Description |
|----------|-------------|-------------|
| `GET /` | No | Live browser UI |
| `GET /api/hello` | Yes | Test endpoint |
| `GET /api/data` | Yes | Returns sample data |

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Runtime | Node.js |
| Framework | Express.js |
| Shared State | Redis + ioredis |

---
