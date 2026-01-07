const redis = require('redis');

const client = redis.createClient({
    url: 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    try {
        await client.connect();
        console.log("Connected to Redis");
    } catch (err) {
        console.log("Error connecting to Redis:", err);
    }
})();

module.exports = client;
