// Import Redis client library
const { createClient } = require('redis');

// Create Redis client instance with configuration from environment variables
const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD
});

// Configure retry strategy for connection attempts
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Handle connection events
redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('reconnecting', () => {
    console.log('Reconnecting to Redis...');
});

redisClient.on('end', () => {
    console.log('Disconnected from Redis');
});

// Connect to Redis server
redisClient.connect().catch(console.error);

// Export Redis client for use in other parts of the application
module.exports = redisClient; 