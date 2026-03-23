const http = require('http');

// 从登录响应中获取的令牌
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsInJvbGUiOiJzdGFmZiIsImlhdCI6MTc3NDE5MDQ3MCwiZXhwIjoxNzc0Nzk1MjcwfQ.LJz3U1gTUr8XWOZT77pZiXhrDJAu1MYiKgArcjlz0xk';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/device',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': Buffer.byteLength(JSON.stringify({
      deviceCode: 'TEST001',
      name: 'Test Device',
      model: 'Test Model',
      specification: 'Test Specification',
      type: 'Test Type',
      status: 'normal',
      location: 'Test Location',
      departmentId: 1,
      purchaseDate: '2023-01-01',
      purchasePrice: 10000,
      supplier: 'Test Supplier',
      warrantyEndDate: '2024-01-01',
      notes: 'Test Notes'
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
  deviceCode: 'TEST001',
  name: 'Test Device',
  model: 'Test Model',
  specification: 'Test Specification',
  type: 'Test Type',
  status: 'normal',
  location: 'Test Location',
  departmentId: 1,
  purchaseDate: '2023-01-01',
  purchasePrice: 10000,
  supplier: 'Test Supplier',
  warrantyEndDate: '2024-01-01',
  notes: 'Test Notes'
}));

req.end();