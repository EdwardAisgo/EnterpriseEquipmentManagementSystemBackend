const net = require('net');
const { spawn } = require('child_process');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

function checkRedis() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(REDIS_PORT, REDIS_HOST);
  });
}

function startRedis() {
  return new Promise((resolve, reject) => {
    console.log('Redis not running, attempting to start redis-server...');
    const proc = spawn('redis-server', [], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    proc.on('error', (err) => reject(err));
    proc.unref();
    setTimeout(resolve, 2000);
  });
}

async function main() {
  let isRunning = await checkRedis();
  if (isRunning) {
    console.log(`Redis is already running at ${REDIS_HOST}:${REDIS_PORT}`);
    process.exit(0);
  }

  try {
    await startRedis();
    isRunning = await checkRedis();
    if (isRunning) {
      console.log(`Redis started successfully at ${REDIS_HOST}:${REDIS_PORT}`);
      process.exit(0);
    }
    console.error('Failed to start Redis: redis-server did not become ready');
    process.exit(1);
  } catch (err) {
    console.error(`Failed to start Redis: ${err.message}`);
    console.error('Please ensure redis-server is installed and in your PATH');
    process.exit(1);
  }
}

main();