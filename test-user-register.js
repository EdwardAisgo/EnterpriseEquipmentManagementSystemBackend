const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/users/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      name: 'Test User'
    }))
  }
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(JSON.stringify({
  username: 'testuser',
  password: 'password123',
  email: 'test@example.com',
  name: 'Test User'
}));

req.end();