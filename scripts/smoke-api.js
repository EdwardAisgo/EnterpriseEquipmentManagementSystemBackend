const axios = require('axios');

async function main() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001/api';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const loginRes = await axios.post(`${baseUrl}/auth/login`, {
    username: adminUsername,
    password: adminPassword,
  });
  const token = loginRes.data?.token;
  if (!token) {
    throw new Error('Login failed: token not found in response');
  }

  const api = axios.create({
    baseURL: baseUrl,
    headers: { Authorization: `Bearer ${token}` },
  });

  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const deviceCode = `SMOKE_${suffix}`;
  const deviceRes = await api.post('/device', {
    deviceCode,
    name: `Smoke Device ${suffix}`,
    type: '生产设备',
    model: `Model-${suffix}`,
    status: 'normal',
    location: '测试位置',
  });
  const deviceId = deviceRes.data?.device?.id;
  if (!deviceId) throw new Error('Create device failed: device.id missing');

  await api.put(`/device/${deviceId}`, {
    location: '测试位置-更新',
  });

  const planRes = await api.post('/maintenance-plans', {
    deviceId,
    maintenanceType: '日常维护',
    cycle: 1,
    cycleUnit: 'month',
    nextMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    responsiblePerson: '张三',
  });
  const planId = planRes.data?.plan?.id;
  if (!planId) throw new Error('Create maintenance plan failed: plan.id missing');

  const maintenanceRes = await api.post('/maintenance', {
    deviceId,
    maintenanceDate: new Date().toISOString(),
    maintenanceContent: '烟雾测试维护内容',
    maintenancePerson: '张三',
    cost: 10,
    notes: 'smoke',
  });
  const maintenanceId = maintenanceRes.data?.maintenance?.id;
  if (!maintenanceId) throw new Error('Create maintenance failed: maintenance.id missing');

  const repairRes = await api.post('/repair-orders', {
    equipmentId: deviceId,
    faultDescription: '烟雾测试故障描述',
    reporter: '测试人员',
    reportDate: new Date().toISOString(),
  });
  const repairOrderId = repairRes.data?.repairOrder?.id;
  if (!repairOrderId) throw new Error('Create repair order failed: repairOrder.id missing');

  await api.put(`/repair-orders/${repairOrderId}`, { status: 'assigned', assignedTo: '张三' });
  await api.put(`/repair-orders/${repairOrderId}`, { status: 'in_progress' });
  await api.put(`/repair-orders/${repairOrderId}`, {
    status: 'completed',
    repairDate: new Date().toISOString(),
    repairContent: '烟雾测试维修内容',
    repairPerson: '张三',
    cost: 20,
    partsUsed: '无',
  });

  const runningRes = await api.post('/running-data', {
    deviceId,
    date: new Date().toISOString(),
    runningHours: 1,
    production: 1,
    energyConsumption: 1,
    operator: '张三',
    notes: 'smoke',
  });
  const runningDataId = runningRes.data?.data?.id;
  if (!runningDataId) throw new Error('Create running data failed: data.id missing');

  const userRes = await axios.post(`${baseUrl}/users/register`, {
    username: `smoke_${suffix}`,
    password: 'Passw0rd!',
    email: `smoke_${suffix}@example.com`,
    name: '烟雾测试用户',
    role: 'staff',
    departmentId: 1,
  });
  const userId = userRes.data?.user?.id;
  if (!userId) throw new Error('Create user failed: user.id missing');

  await api.get('/device');
  await api.get('/maintenance-plans');
  await api.get('/maintenance');
  await api.get('/repair-orders');
  await api.get('/running-data');
  await api.get('/users');

  await api.delete(`/maintenance/${maintenanceId}`);
  await api.delete(`/maintenance-plans/${planId}`);
  await api.delete(`/running-data/${runningDataId}`);
  await api.delete(`/repair-orders/${repairOrderId}`);
  await api.delete(`/users/${userId}`);
  await api.delete(`/device/${deviceId}`);
}

main()
  .then(() => {
    console.log('SMOKE_OK');
  })
  .catch((err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    console.error('SMOKE_FAIL', status || '', data || err?.message || err);
    process.exitCode = 1;
  });

