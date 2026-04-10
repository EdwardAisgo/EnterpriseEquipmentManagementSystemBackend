const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 3306
};

const dbName = process.env.DB_NAME || 'equipment_management';

// 创建数据库（如果不存在）
async function createDatabaseIfNotExists() {
  try {
    // 连接到MySQL服务器
    const connection = await mysql.createConnection({
      ...config,
      charset: 'utf8mb4',
      multipleStatements: true
    });
    
    // 检查数据库是否存在
    const [result] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${dbName}'`
    );
    
    // 如果数据库不存在，创建它
    if (result.length === 0) {
      console.log(`Creating database ${dbName}...`);
      await connection.execute(
        `CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`Database ${dbName} created successfully`);
    }
    
    // 关闭连接
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
  }
}

// 创建Sequelize实例
const sequelize = new Sequelize(
  dbName,
  config.user,
  config.password,
  {
    host: config.host,
    dialect: 'mysql',
    port: config.port,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// 导出函数，以便在需要时手动执行
module.exports = {
  sequelize,
  createDatabaseIfNotExists,
  testConnection
};