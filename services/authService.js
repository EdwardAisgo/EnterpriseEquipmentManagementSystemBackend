const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');
require('dotenv').config();

class AuthService {
  // 登录
  static async login(username, password) {
    try {
      // 查找用户
      const user = await User.findOne({ where: { username } });
      if (!user) {
        logger.warn(`Login failed: User ${username} not found`);
        throw new Error('Invalid username or password');
      }
      
      // 验证密码
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        logger.warn(`Login failed: Invalid password for user ${username}`);
        throw new Error('Invalid username or password');
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      logger.info(`Login successful: User ${username}`);
      return { token, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  // 注册
  static async register(username, password, name, role, departmentId) {
    try {
      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        logger.warn(`Registration failed: Username ${username} already exists`);
        throw new Error('Username already exists');
      }
      
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 创建用户
      const user = await User.create({
        username,
        password: hashedPassword,
        name,
        role,
        departmentId
      });
      
      logger.info(`User registered successfully: ${username}`);
      return { id: user.id, username: user.username, name: user.name, role: user.role };
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        logger.warn(`Get current user failed: User ${userId} not found`);
        throw new Error('User not found');
      }
      logger.info(`Get current user successful: User ${userId}`);
      return { id: user.id, username: user.username, name: user.name, role: user.role, departmentId: user.departmentId };
    } catch (error) {
      logger.error(`Get current user error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = AuthService;