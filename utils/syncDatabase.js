const { sequelize } = require('../config/database');
const models = require('../models');

// 同步数据库表结构
const syncDatabase = async () => {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
    
    // 创建默认管理员用户
    await createDefaultAdmin();
    
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

// 创建默认管理员用户
const createDefaultAdmin = async () => {
  const { User } = models;
  const bcrypt = require('bcryptjs');
  
  const existingAdmin = await User.findOne({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin'
    });
    console.log('Default admin user created');
  }
};

module.exports = syncDatabase;