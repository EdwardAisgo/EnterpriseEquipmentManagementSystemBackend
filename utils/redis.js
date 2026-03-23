const redis = require('redis');
const logger = require('./logger');

// 创建Redis客户端
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || ''
});

// 处理Redis连接错误
redisClient.on('error', (err) => {
  logger.error(`Redis connection error: ${err.message}`);
  // 不要因为Redis连接错误而退出服务器
  logger.info('Server will continue to run without Redis');
});

// 处理Redis连接成功
redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

// 旧版本的Redis客户端会自动连接，不需要手动调用connect()方法
// 所以我们只需要设置事件监听器即可

// 缓存操作类
class RedisCache {
  // 设置缓存
  static async set(key, value, expiration = 3600) {
    return new Promise((resolve) => {
      redisClient.set(key, JSON.stringify(value), 'EX', expiration, (err) => {
        if (err) {
          logger.error(`Redis set error: ${err.message}`);
          // 即使Redis出错，也不影响主流程，直接resolve
        }
        resolve();
      });
    });
  }

  // 获取缓存
  static async get(key) {
    return new Promise((resolve) => {
      redisClient.get(key, (err, value) => {
        if (err) {
          logger.error(`Redis get error: ${err.message}`);
          // 即使Redis出错，也不影响主流程，直接返回null
          resolve(null);
        } else {
          resolve(value ? JSON.parse(value) : null);
        }
      });
    });
  }

  // 删除缓存
  static async del(key) {
    return new Promise((resolve) => {
      redisClient.del(key, (err) => {
        if (err) {
          logger.error(`Redis del error: ${err.message}`);
          // 即使Redis出错，也不影响主流程，直接resolve
        }
        resolve();
      });
    });
  }

  // 清除所有缓存
  static async flushAll() {
    return new Promise((resolve) => {
      redisClient.flushall((err) => {
        if (err) {
          logger.error(`Redis flushall error: ${err.message}`);
          // 即使Redis出错，也不影响主流程，直接resolve
        }
        resolve();
      });
    });
  }
}

module.exports = RedisCache;