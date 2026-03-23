const redis = require('redis');

// 创建Redis客户端
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

// 处理Redis连接错误
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
  process.exit(1);
});

// 处理Redis连接成功
redisClient.on('connect', () => {
  console.log('Redis connected successfully');
  
  // 测试Redis命令
  redisClient.ping((err, reply) => {
    if (err) {
      console.error('Redis ping error:', err);
      process.exit(1);
    }
    console.log('Redis ping reply:', reply);
    
    // 关闭Redis连接
    redisClient.quit(() => {
      console.log('Redis connection closed');
      process.exit(0);
    });
  });
});