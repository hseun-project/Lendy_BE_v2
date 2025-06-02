import Redis from 'ioredis';

const getRedisPort = () => {
  const redisPortStr = process.env.REDIS_PORT;
  const redisPort = redisPortStr ? parseInt(redisPortStr, 10) : 6379;
  return redisPort;
};

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: getRedisPort(),
  password: process.env.REDIS_PASSWORD
});

redis.on('connect', () => {
  console.log('Redis has initted');
});
redis.on('error', (err) => {
  console.error(err);
});
redis.on('reconnecting', () => {
  console.log('Reconnecting redis');
});

export default redis;
