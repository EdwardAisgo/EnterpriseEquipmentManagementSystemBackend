const { User, Department } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const RedisCache = require('../utils/redis');

class UserService {
  // 用户注册
  static async register(userData) {
    try {
      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username: userData.username } });
      if (existingUser) {
        logger.warn(`Register failed: Username ${userData.username} already exists`);
        throw new Error('Username already exists');
      }

      // 检查邮箱是否已存在
      const existingEmail = await User.findOne({ where: { email: userData.email } });
      if (existingEmail) {
        logger.warn(`Register failed: Email ${userData.email} already exists`);
        throw new Error('Email already exists');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // 创建用户
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });

      // 清除用户列表缓存
      await RedisCache.del('users:all');
      logger.info(`Register successful: User ${user.id}`);
      return user;
    } catch (error) {
      logger.error(`Register error: ${error.message}`);
      throw error;
    }
  }

  // 用户登录
  static async login(username, password) {
    try {
      // 查找用户
      const user = await User.findOne({ where: { username } });
      if (!user) {
        logger.warn(`Login failed: User ${username} not found`);
        throw new Error('Invalid username or password');
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn(`Login failed: Invalid password for user ${username}`);
        throw new Error('Invalid username or password');
      }

      // 生成JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      logger.info(`Login successful: User ${user.id}`);
      return { token, user };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  // 获取用户列表
  static async getUsers(params = {}) {
    try {
      const { username, name, departmentId, role } = params;
      const where = {};
      
      if (username) {
        const { Op } = require('sequelize');
        where.username = { [Op.like]: `%${username}%` };
      }
      if (name) {
        const { Op } = require('sequelize');
        where.name = { [Op.like]: `%${name}%` };
      }
      if (departmentId) {
        where.departmentId = departmentId;
      }
      if (role) {
        where.role = role;
      }

      // 从数据库获取
      const users = await User.findAll({
        where,
        include: [{ model: Department, attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']]
      });

      logger.info(`Get users successful: ${users.length} users found`);
      return users;
    } catch (error) {
      logger.error(`Get users error: ${error.message}`);
      throw error;
    }
  }

  // 根据ID获取用户信息
  static async getUserById(id) {
    try {
      // 尝试从缓存获取
      const cachedUser = await RedisCache.get(`user:${id}`);
      if (cachedUser) {
        logger.info(`Get user by id from cache: User ${id}`);
        return cachedUser;
      }

      // 从数据库获取
      const user = await User.findByPk(id, {
        include: [{ model: Department, attributes: ['id', 'name'] }]
      });
      if (!user) {
        logger.warn(`Get user by id failed: User ${id} not found`);
        throw new Error('User not found');
      }

      // 缓存结果
      await RedisCache.set(`user:${id}`, user, 600); // 10分钟缓存
      logger.info(`Get user by id successful: User ${id}`);
      return user;
    } catch (error) {
      logger.error(`Get user by id error: ${error.message}`);
      throw error;
    }
  }

  // 更新用户信息
  static async updateUser(id, userData) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        logger.warn(`Update user failed: User ${id} not found`);
        throw new Error('User not found');
      }

      // 检查邮箱是否已被其他用户使用
      if (userData.email && userData.email !== user.email) {
        const existingEmail = await User.findOne({ where: { email: userData.email } });
        if (existingEmail) {
          logger.warn(`Update user failed: Email ${userData.email} already exists`);
          throw new Error('Email already exists');
        }
      }

      await user.update(userData);
      
      // 清除相关缓存
      await RedisCache.del('users:all');
      await RedisCache.del(`user:${id}`);
      logger.info(`Update user successful: User ${id}`);
      return user;
    } catch (error) {
      logger.error(`Update user error: ${error.message}`);
      throw error;
    }
  }

  // 更改密码
  static async changePassword(id, oldPassword, newPassword) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        logger.warn(`Change password failed: User ${id} not found`);
        throw new Error('User not found');
      }

      // 验证旧密码
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        logger.warn(`Change password failed: Invalid old password for user ${id}`);
        throw new Error('Invalid old password');
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });
      
      // 清除相关缓存
      await RedisCache.del(`user:${id}`);
      logger.info(`Change password successful: User ${id}`);
    } catch (error) {
      logger.error(`Change password error: ${error.message}`);
      throw error;
    }
  }

  // 管理员重置密码
  static async resetPassword(id, newPassword) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        logger.warn(`Reset password failed: User ${id} not found`);
        throw new Error('User not found');
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });
      
      // 清除相关缓存
      await RedisCache.del(`user:${id}`);
      logger.info(`Reset password successful by admin: User ${id}`);
    } catch (error) {
      logger.error(`Reset password error: ${error.message}`);
      throw error;
    }
  }

  // 删除用户
  static async deleteUser(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        logger.warn(`Delete user failed: User ${id} not found`);
        throw new Error('User not found');
      }
      await user.destroy();
      
      // 清除相关缓存
      await RedisCache.del('users:all');
      await RedisCache.del(`user:${id}`);
      logger.info(`Delete user successful: User ${id}`);
      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error(`Delete user error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = UserService;