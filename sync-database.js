const { sequelize } = require('./config/database');
const User = require('./models/User');
const Department = require('./models/Department');
const Device = require('./models/Device');
const Maintenance = require('./models/Maintenance');
const MaintenancePlan = require('./models/MaintenancePlan');
const RepairOrder = require('./models/RepairOrder');
const RunningData = require('./models/RunningData');

// 同步数据库表结构
async function syncDatabase() {
  try {
    console.log('Starting database sync...');
    
    // 同步所有模型
    await sequelize.sync({ alter: true });
    
    console.log('Database sync completed successfully!');
  } catch (error) {
    console.error('Error during database sync:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 执行同步操作
syncDatabase();