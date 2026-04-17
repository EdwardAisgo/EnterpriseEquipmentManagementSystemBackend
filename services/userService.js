const { User, Department, Role } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const RedisCache = require('../utils/redis');

class UserService {
  static async normalizeRoleFields(userData) {
    const normalized = { ...userData };

    const hasRole = Object.prototype.hasOwnProperty.call(normalized, 'role');
    const roleValue = hasRole ? normalized.role : undefined;
    if (hasRole) delete normalized.role;

    const hasRoleId = Object.prototype.hasOwnProperty.call(normalized, 'roleId');
    const roleIdValue = hasRoleId ? normalized.roleId : undefined;

    const candidate = hasRole ? roleValue : roleIdValue;
    if (candidate === undefined) return normalized;

    if (candidate === null) {
      normalized.roleId = null;
      return normalized;
    }

    if (typeof candidate === 'number') {
      normalized.roleId = candidate;
      return normalized;
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed === '') {
        normalized.roleId = null;
        return normalized;
      }
      if (/^\d+$/.test(trimmed)) {
        normalized.roleId = Number(trimmed);
        return normalized;
      }
      const role = await Role.findOne({ where: { name: trimmed } });
      if (!role) throw new Error('Role not found');
      normalized.roleId = role.id;
      return normalized;
    }

    if (typeof candidate === 'object') {
      const obj = candidate;
      if (obj && (obj.id !== undefined || obj.name !== undefined)) {
        if (obj.id !== undefined) {
          return UserService.normalizeRoleFields({ ...normalized, roleId: obj.id });
        }
        if (typeof obj.name === 'string') {
          return UserService.normalizeRoleFields({ ...normalized, role: obj.name });
        }
      }
    }

    throw new Error('Role not found');
  }

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

      const newUserData = await UserService.normalizeRoleFields(userData);

      // 创建用户
      const user = await User.create({
        ...newUserData,
        password: hashedPassword,
      });

      // 获取关联的角色信息
      await user.reload({ include: [{ model: Role, attributes: ['id', 'name'] }] });
      // 为了兼容现有前端或 JWT token 生成，将 roleName 附加到 user 对象
      if (user.Role) {
        user.setDataValue('role', user.Role.name);
      }

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

      await user.reload({ include: [{ model: Role, attributes: ['id', 'name'] }] });
      if (user.Role) {
        user.setDataValue('role', user.Role.name);
      }

      // 生成JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.getDataValue('role'),
          roleId: user.roleId,
        },
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
      const { username, name, departmentId, roleId } = params;
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
      if (roleId) {
        where.roleId = roleId;
      }

      // 从数据库获取
      const users = await User.findAll({
        where,
        include: [
          { model: Department, attributes: ['id', 'name'] },
          { model: Role, attributes: ['id', 'name'] } // 包含 Role 模型
        ],
        order: [['createdAt', 'DESC']]
      });

      // 为每个用户附加 roleName，以便兼容前端或 JWT token 生成
      users.forEach(user => {
        if (user.Role) {
          user.setDataValue('role', user.Role.name);
        }
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
        include: [
          { model: Department, attributes: ['id', 'name'] },
          { model: Role, attributes: ['id', 'name'] } // 包含 Role 模型
        ]
      });
      if (!user) {
        logger.warn(`Get user by id failed: User ${id} not found`);
        throw new Error('User not found');
      }

      // 为用户附加 roleName，以便兼容前端或 JWT token 生成
      if (user.Role) {
        user.setDataValue('role', user.Role.name);
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

      const updateFields = await UserService.normalizeRoleFields(userData);

      // 更新用户数据
      if (updateFields.roleId !== undefined && updateFields.roleId !== null) {
        const role = await Role.findByPk(updateFields.roleId);
        if (!role) {
          logger.warn(`Update user failed: Role with ID ${updateFields.roleId} not found`);
          throw new Error('Role not found');
        }
      }
      await user.update(updateFields);

      // 获取关联的角色信息
      await user.reload({ include: [{ model: Role, attributes: ['id', 'name'] }] });
      // 为了兼容现有前端或 JWT token 生成，将 roleName 附加到 user 对象
      if (user.Role) {
        user.setDataValue('role', user.Role.name);
      }
      
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
