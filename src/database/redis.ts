const redis = require('redis');

export const redisClient = redis.createClient({
  socket: {
    host: 'localhost',
    port: '6380'
},
});


