const { Device, Department } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const RedisCache = require('../utils/redis');

class DeviceService {
  // 获取设备列表
  static async getDevices(query) {
    try {
      const { search, status } = query;
      const where = {};

      if (status && status !== 'all' && status !== '') {
        where.status = status;
      }

      if (search && search.trim() !== '') {
        const searchKeyword = `%${search.trim()}%`;
        where[Op.or] = [
          { name: { [Op.like]: searchKeyword } },
          { deviceCode: { [Op.like]: searchKeyword } },
        ];
      }

      const devices = await Device.findAll({
        where,
        include: [{ model: Department, attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']]
      });

      logger.info(`Get devices successful: ${devices.length} devices found`);
      return devices;
    } catch (error) {
      logger.error(`Get devices error: ${error.message}`);
      throw error;
    }
  }

  // 根据ID获取设备详情
  static async getDeviceById(id) {
    try {
      // 尝试从缓存获取
      const cachedDevice = await RedisCache.get(`device:${id}`);
      if (cachedDevice) {
        logger.info(`Get device by id from cache: Device ${id}`);
        return cachedDevice;
      }

      // 从数据库获取
      const device = await Device.findByPk(id, {
        include: [{ model: Department, attributes: ['id', 'name'] }]
      });
      if (!device) {
        logger.warn(`Get device by id failed: Device ${id} not found`);
        throw new Error('Device not found');
      }

      // 缓存结果
      await RedisCache.set(`device:${id}`, device, 600); // 10分钟缓存
      logger.info(`Get device by id successful: Device ${id}`);
      return device;
    } catch (error) {
      logger.error(`Get device by id error: ${error.message}`);
      throw error;
    }
  }

  // 添加设备
  static async createDevice(deviceData) {
    try {
      const device = await Device.create(deviceData);
      
      // 清除设备列表缓存
      await RedisCache.del('devices:all');
      logger.info(`Create device successful: Device ${device.id}`);
      return device;
    } catch (error) {
      logger.error(`Create device error: ${error.message}`);
      throw error;
    }
  }

  // 更新设备
  static async updateDevice(id, deviceData) {
    try {
      const device = await Device.findByPk(id);
      if (!device) {
        logger.warn(`Update device failed: Device ${id} not found`);
        throw new Error('Device not found');
      }
      await device.update(deviceData);
      
      // 清除相关缓存
      await RedisCache.del('devices:all');
      await RedisCache.del(`device:${id}`);
      logger.info(`Update device successful: Device ${id}`);
      return device;
    } catch (error) {
      logger.error(`Update device error: ${error.message}`);
      throw error;
    }
  }

  // 报废设备
  static async scrapDevice(id, scrapReason) {
    try {
      const device = await Device.findByPk(id);
      if (!device) {
        logger.warn(`Scrap device failed: Device ${id} not found`);
        throw new Error('Device not found');
      }
      await device.update({
        status: 'scrapped',
        scrapDate: new Date(),
        scrapReason
      });
      
      // 清除相关缓存
      await RedisCache.del('devices:all');
      await RedisCache.del(`device:${id}`);
      logger.info(`Scrap device successful: Device ${id}`);
      return device;
    } catch (error) {
      logger.error(`Scrap device error: ${error.message}`);
      throw error;
    }
  }

  // 删除设备
  static async deleteDevice(id) {
    try {
      const device = await Device.findByPk(id);
      if (!device) {
        logger.warn(`Delete device failed: Device ${id} not found`);
        throw new Error('Device not found');
      }
      await device.destroy();
      
      // 清除相关缓存
      await RedisCache.del('devices:all');
      await RedisCache.del(`device:${id}`);
      logger.info(`Delete device successful: Device ${id}`);
      return { message: 'Device deleted successfully' };
    } catch (error) {
      logger.error(`Delete device error: ${error.message}`);
      throw error;
    }
  }

  // 按状态筛选设备
  static async getDevicesByStatus(status) {
    try {
      // 尝试从缓存获取
      const cachedDevices = await RedisCache.get(`devices:status:${status}`);
      if (cachedDevices) {
        logger.info(`Get devices by status from cache: ${cachedDevices.length} devices found for status ${status}`);
        return cachedDevices;
      }

      // 从数据库获取
      const devices = await Device.findAll({
        where: { status },
        include: [{ model: Department, attributes: ['id', 'name'] }]
      });

      // 缓存结果
      await RedisCache.set(`devices:status:${status}`, devices, 300); // 5分钟缓存
      logger.info(`Get devices by status successful: ${devices.length} devices found for status ${status}`);
      return devices;
    } catch (error) {
      logger.error(`Get devices by status error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = DeviceService;