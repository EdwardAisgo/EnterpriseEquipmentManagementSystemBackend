const axios = require('axios');

// 后端 API 地址
const API_BASE_URL = 'http://localhost:3001/api';

// 模拟数据
const mockData = {
  // 用户数据
  users: [
    {
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      name: '管理员',
      role: 'admin'
    },
    {
      username: 'user',
      password: 'user123',
      email: 'user@example.com',
      name: '普通用户',
      role: 'staff'
    }
  ],
  // 设备数据
  devices: [
    {
      deviceCode: 'EQ001',
      name: '注塑机',
      type: '生产设备',
      model: 'Model A',
      status: 'normal',
      departmentId: null
    },
    {
      deviceCode: 'EQ002',
      name: '包装机',
      type: '包装设备',
      model: 'Model B',
      status: 'maintenance',
      departmentId: null
    },
    {
      deviceCode: 'EQ003',
      name: '切割机',
      type: '加工设备',
      model: 'Model C',
      status: 'fault',
      departmentId: null
    },
    {
      deviceCode: 'EQ004',
      name: '检测设备',
      type: '检测设备',
      model: 'Model D',
      status: 'normal',
      departmentId: null
    }
  ],
  // 维护计划数据
  maintenancePlans: [
    {
      deviceId: 1,
      maintenanceType: '日常维护',
      cycle: 1,
      cycleUnit: 'month',
      nextMaintenance: '2023-07-15',
      responsiblePerson: '张三'
    },
    {
      deviceId: 2,
      maintenanceType: '定期维护',
      cycle: 3,
      cycleUnit: 'month',
      nextMaintenance: '2023-08-20',
      responsiblePerson: '李四'
    },
    {
      deviceId: 3,
      maintenanceType: '日常维护',
      cycle: 1,
      cycleUnit: 'month',
      nextMaintenance: '2023-07-10',
      responsiblePerson: '王五'
    }
  ],
  // 维护记录数据
  maintenanceRecords: [
    {
      deviceId: 1,
      maintenanceDate: '2023-06-15',
      maintenanceContent: '检查设备运行状态，更换机油',
      maintenancePerson: '张三',
      cost: 500
    },
    {
      deviceId: 1,
      maintenanceDate: '2023-05-15',
      maintenanceContent: '检查设备运行状态，清洁设备',
      maintenancePerson: '张三',
      cost: 300
    },
    {
      deviceId: 2,
      maintenanceDate: '2023-05-20',
      maintenanceContent: '检查设备运行状态，更换零件',
      maintenancePerson: '李四',
      cost: 800
    }
  ],
  // 维修工单数据
  repairOrders: [
    {
      equipmentId: 1,
      faultDescription: '设备无法正常启动',
      reporter: '张三',
      reportDate: '2023-07-01'
    },
    {
      equipmentId: 2,
      faultDescription: '包装效果不佳',
      reporter: '李四',
      reportDate: '2023-07-02'
    },
    {
      equipmentId: 3,
      faultDescription: '切割精度下降',
      reporter: '赵六',
      reportDate: '2023-07-03'
    },
    {
      equipmentId: 4,
      faultDescription: '检测结果不准确',
      reporter: '周八',
      reportDate: '2023-07-04'
    }
  ],
  // 运行数据
  runningData: [
    {
      equipmentId: 1,
      temperature: 30.5,
      pressure: 1.2,
      vibration: 0.5,
      power: 1000,
      runningHours: 8,
      recordTime: '2023-07-01T08:00:00Z'
    },
    {
      equipmentId: 1,
      temperature: 31.0,
      pressure: 1.3,
      vibration: 0.6,
      power: 1100,
      runningHours: 10,
      recordTime: '2023-07-02T08:00:00Z'
    },
    {
      equipmentId: 2,
      temperature: 29.5,
      pressure: 1.1,
      vibration: 0.4,
      power: 800,
      runningHours: 6,
      recordTime: '2023-07-01T08:00:00Z'
    }
  ]
};

// 主函数
async function importData() {
  try {
    console.log('开始导入前端数据...');
    
    // 1. 注册用户
    console.log('\n1. 注册用户...');
    for (const user of mockData.users) {
      try {
        const response = await axios.post(`${API_BASE_URL}/users/register`, user);
        console.log(`  ✅ 注册用户 ${user.username} 成功`);
      } catch (error) {
        console.log(`  ⚠️  注册用户 ${user.username} 失败: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 2. 登录获取 token
    console.log('\n2. 登录获取 token...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    console.log('  ✅ 登录成功，获取到 token');
    
    // 设置 axios 默认 headers
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // 3. 创建设备并获取设备ID映射
    console.log('\n3. 创建设备...');
    const deviceIdMap = new Map();
    for (const device of mockData.devices) {
      try {
        // 先检查设备是否已经存在
        const existingDevices = await api.get('/device');
        const existingDevice = existingDevices.data.devices.find(d => d.deviceCode === device.deviceCode);
        
        if (existingDevice) {
          console.log(`  ⚠️  设备 ${device.name} 已经存在，跳过创建`);
          deviceIdMap.set(device.deviceCode, existingDevice.id);
          continue;
        }
        
        const response = await api.post('/device', device);
        console.log(`  ✅ 创建设备 ${device.name} 成功`);
        deviceIdMap.set(device.deviceCode, response.data.device.id);
      } catch (error) {
        console.log(`  ⚠️  创建设备 ${device.name} 失败: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 打印设备ID映射
    console.log('\n设备ID映射:');
    for (const [deviceCode, id] of deviceIdMap.entries()) {
      console.log(`  ${deviceCode}: ${id}`);
    }
    
    // 4. 创建维护计划
    console.log('\n4. 创建维护计划...');
    const deviceCodes = Array.from(deviceIdMap.keys());
    for (let i = 0; i < mockData.maintenancePlans.length; i++) {
      try {
        const plan = mockData.maintenancePlans[i];
        const deviceCode = deviceCodes[i % deviceCodes.length];
        const deviceId = deviceIdMap.get(deviceCode);
        
        const planWithActualDeviceId = {
          ...plan,
          deviceId: deviceId
        };
        
        const response = await api.post('/maintenance-plans', planWithActualDeviceId);
        console.log(`  ✅ 创建维护计划成功，设备ID: ${deviceId}`);
      } catch (error) {
        console.log(`  ⚠️  创建维护计划失败: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 5. 创建维护记录
    console.log('\n5. 创建维护记录...');
    for (let i = 0; i < mockData.maintenanceRecords.length; i++) {
      try {
        const record = mockData.maintenanceRecords[i];
        const deviceCode = deviceCodes[i % deviceCodes.length];
        const deviceId = deviceIdMap.get(deviceCode);
        
        // 首先，使用路由验证规则要求的字段格式
        const maintenanceDataForRoute = {
          deviceId: deviceId,
          maintenanceDate: record.maintenanceDate,
          maintenanceContent: record.maintenanceContent,
          maintenancePerson: record.maintenancePerson,
          cost: record.cost
        };
        const response = await api.post('/maintenance', maintenanceDataForRoute);
        console.log(`  ✅ 创建维护记录成功，设备ID: ${deviceId}`);
      } catch (error) {
        console.log(`  ⚠️  创建维护记录失败: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 6. 创建维修工单
    console.log('\n6. 创建维修工单...');
    for (let i = 0; i < mockData.repairOrders.length; i++) {
      try {
        const order = mockData.repairOrders[i];
        const deviceCode = deviceCodes[i % deviceCodes.length];
        const deviceId = deviceIdMap.get(deviceCode);
        
        // 首先，使用路由验证规则要求的字段格式
        const repairOrderDataForRoute = {
          equipmentId: deviceId,
          faultDescription: order.faultDescription,
          reporter: order.reporter,
          reportDate: order.reportDate
        };
        const response = await api.post('/repair-orders', repairOrderDataForRoute);
        console.log(`  ✅ 创建维修工单成功，设备ID: ${deviceId}`);
      } catch (error) {
        console.log(`  ⚠️  创建维修工单失败: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 7. 创建运行数据
    console.log('\n7. 创建运行数据...');
    for (let i = 0; i < mockData.runningData.length; i++) {
      try {
        const data = mockData.runningData[i];
        const deviceCode = deviceCodes[i % deviceCodes.length];
        const deviceId = deviceIdMap.get(deviceCode);
        
        // 首先，使用路由验证规则要求的字段格式
        const runningDataForRoute = {
          equipmentId: deviceId,
          temperature: data.temperature,
          pressure: data.pressure,
          vibration: data.vibration,
          power: data.power,
          runningHours: data.runningHours,
          recordTime: data.recordTime
        };
        const response = await api.post('/running-data', runningDataForRoute);
        console.log(`  ✅ 创建运行数据成功，设备ID: ${deviceId}`);
      } catch (error) {
        console.log(`  ⚠️  创建运行数据失败: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n🎉 数据导入完成！');
  } catch (error) {
    console.error('❌ 导入数据时发生错误:', error);
  }
}

// 运行导入函数
importData();
