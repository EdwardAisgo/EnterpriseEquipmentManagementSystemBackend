const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const logger = require('./utils/logger');

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 安全中间件
app.use(helmet());

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const deviceRoutes = require('./routes/device');
const deviceTypeRoutes = require('./routes/deviceType');
const maintenanceRoutes = require('./routes/maintenance');
const maintenancePlanRoutes = require('./routes/maintenancePlan');
const repairOrderRoutes = require('./routes/repairOrder');
const runningDataRoutes = require('./routes/runningData');
const reportRoutes = require('./routes/report');
const departmentRoutes = require('./routes/department');
const roleRoutes = require('./routes/role');
const backupRoutes = require('./routes/backup');
const menuRoutes = require('./routes/menu');
const logRoutes = require('./routes/log');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/device-types', deviceTypeRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/maintenance-plans', maintenancePlanRoutes);
app.use('/api/repair-orders', repairOrderRoutes);
app.use('/api/running-data', runningDataRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/logs', logRoutes);

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

app.get('/api/notices', (req, res) => {
  res.json({ success: true, data: [], total: 0 });
});

app.get('/api/rule', (req, res) => {
  res.json({ success: true, data: [], total: 0 });
});

app.post('/api/rule', (req, res) => {
  res.json({ success: true });
});

app.get('/api/login/captcha', (req, res) => {
  res.json({ success: true, status: 'ok', code: 0 });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    logger.warn('Invalid token');
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // 处理JWT过期错误
  if (err.name === 'TokenExpiredError') {
    logger.warn('Token expired');
    return res.status(401).json({ message: 'Token expired' });
  }
  
  // 处理Sequelize错误
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    logger.warn('Validation error', errors);
    return res.status(400).json({ message: 'Validation error', errors });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    logger.warn('Duplicate entry');
    return res.status(400).json({ message: 'Duplicate entry' });
  }
  
  // 默认错误
  res.status(500).json({ message: 'Internal Server Error' });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  
  // 数据库同步将在需要时手动执行
  // 这样可以避免服务器因为数据库同步过程中的错误而退出
  logger.info('Server started successfully. Database sync can be performed manually if needed.');
});

module.exports = app;
