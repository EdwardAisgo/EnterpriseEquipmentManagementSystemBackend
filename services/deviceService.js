const { Device, Department, RepairOrder, DeviceType } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const RedisCache = require('../utils/redis');
const { toDateString } = require('../utils/dateHelper');

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

      let devices;
      try {
        devices = await Device.findAll({
          where,
          include: [
            { model: Department, attributes: ['id', 'name'] },
            { model: DeviceType, attributes: ['id', 'name'] }
          ],
          order: [['createdAt', 'DESC']]
        });
      } catch (err) {
        // DeviceTypes 表尚未创建时降级查询
        if (err.original && err.original.code === 'ER_NO_SUCH_TABLE') {
          devices = await Device.findAll({
            where,
            include: [{ model: Department, attributes: ['id', 'name'] }],
            order: [['createdAt', 'DESC']]
          });
        } else {
          throw err;
        }
      }

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
      if (deviceData && typeof deviceData.deviceCode === 'string') {
        const deviceCode = deviceData.deviceCode.trim();
        const existing = await Device.findOne({ where: { deviceCode } });
        if (existing) {
          logger.warn(`Create device failed: Device code ${deviceCode} already exists`);
          throw new Error('设备编号已存在');
        }
      }

      // 如果传了 deviceTypeId，同步 type 字段为 DeviceType.name
      if (deviceData.deviceTypeId) {
        try {
          const deviceType = await DeviceType.findByPk(deviceData.deviceTypeId);
          if (deviceType) {
            deviceData.type = deviceType.name;
          }
        } catch (_e) {
          // DeviceTypes 表不存在时忽略
        }
      }

      const normalizedData = {
        ...deviceData,
        purchaseDate: toDateString(deviceData.purchaseDate),
        warrantyEndDate: toDateString(deviceData.warrantyEndDate),
        scrapDate: toDateString(deviceData.scrapDate),
      };
      const device = await Device.create(normalizedData);

      // 清除设备列表缓存
      await RedisCache.del('devices:all');
      logger.info(`Create device successful: Device ${device.id}`);
      return device;
    } catch (error) {
      if (error && (error.name === 'SequelizeUniqueConstraintError' || error.name === 'UniqueConstraintError')) {
        throw new Error('设备编号已存在');
      }
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
      if (deviceData && typeof deviceData.deviceCode === 'string') {
        const deviceCode = deviceData.deviceCode.trim();
        if (deviceCode !== '' && deviceCode !== device.deviceCode) {
          const existing = await Device.findOne({ where: { deviceCode, id: { [Op.ne]: id } } });
          if (existing) {
            logger.warn(`Update device failed: Device code ${deviceCode} already exists`);
            throw new Error('设备编号已存在');
          }
        }
      }

      // 如果传了 deviceTypeId，同步 type 字段为 DeviceType.name
      if (deviceData.deviceTypeId) {
        try {
          const deviceType = await DeviceType.findByPk(deviceData.deviceTypeId);
          if (deviceType) {
            deviceData.type = deviceType.name;
          }
        } catch (_e) {
          // DeviceTypes 表不存在时忽略
        }
      }

      const normalizedData = {
        ...deviceData,
        purchaseDate: toDateString(deviceData.purchaseDate),
        warrantyEndDate: toDateString(deviceData.warrantyEndDate),
        scrapDate: toDateString(deviceData.scrapDate),
      };
      await device.update(normalizedData);

      // 清除相关缓存
      await RedisCache.del('devices:all');
      await RedisCache.del(`device:${id}`);
      logger.info(`Update device successful: Device ${id}`);
      return device;
    } catch (error) {
      if (error && (error.name === 'SequelizeUniqueConstraintError' || error.name === 'UniqueConstraintError')) {
        throw new Error('设备编号已存在');
      }
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
        scrapDate: toDateString(new Date()),
        scrapReason
      });

      const equipmentId = Number(id);
      const openRepairOrders = await RepairOrder.findAll({
        where: {
          equipmentId,
          status: { [Op.in]: ['pending', 'assigned', 'in_progress'] },
        },
        attributes: ['id'],
      });
      if (openRepairOrders.length > 0) {
        await RepairOrder.update(
          {
            status: 'completed',
            repairDate: toDateString(new Date()),
            repairContent: '设备已报废，工单自动关闭',
            notes: '设备已报废，工单自动关闭',
          },
          {
            where: { id: { [Op.in]: openRepairOrders.map((o) => o.id) } },
          }
        );
      }
      
      // 清除相关缓存
      await RedisCache.del('devices:all');
      await RedisCache.del(`device:${id}`);
      await RedisCache.del('repairOrders:all');
      await RedisCache.del(`repairOrders:equipment:${equipmentId}`);
      await RedisCache.del('repairOrders:status:pending');
      await RedisCache.del('repairOrders:status:assigned');
      await RedisCache.del('repairOrders:status:in_progress');
      for (const order of openRepairOrders) {
        await RedisCache.del(`repairOrder:${order.id}`);
      }
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
