const { DeviceType, Device } = require('../models');
const logger = require('../utils/logger');

class DeviceTypeService {
  // 获取所有设备类型
  static async getDeviceTypes() {
    try {
      const deviceTypes = await DeviceType.findAll({
        order: [['createdAt', 'DESC']]
      });
      logger.info(`Get all device types successful: ${deviceTypes.length} types found`);
      return deviceTypes;
    } catch (error) {
      logger.error(`Get all device types error: ${error.message}`);
      throw error;
    }
  }

  // 根据ID获取设备类型
  static async getDeviceTypeById(id) {
    try {
      const deviceType = await DeviceType.findByPk(id);
      if (!deviceType) {
        logger.warn(`Get device type by id failed: Type ${id} not found`);
        throw new Error('Device type not found');
      }
      logger.info(`Get device type by id successful: Type ${id}`);
      return deviceType;
    } catch (error) {
      logger.error(`Get device type by id error: ${error.message}`);
      throw error;
    }
  }

  // 创建设备类型
  static async createDeviceType(deviceTypeData) {
    try {
      if (deviceTypeData && typeof deviceTypeData.name === 'string') {
        const name = deviceTypeData.name.trim();
        const existing = await DeviceType.findOne({ where: { name } });
        if (existing) {
          logger.warn(`Create device type failed: Name ${name} already exists`);
          throw new Error('设备类型名称已存在');
        }
      }
      const deviceType = await DeviceType.create(deviceTypeData);
      logger.info(`Create device type successful: Type ${deviceType.id}`);
      return deviceType;
    } catch (error) {
      if (error && (error.name === 'SequelizeUniqueConstraintError' || error.name === 'UniqueConstraintError')) {
        throw new Error('设备类型名称已存在');
      }
      logger.error(`Create device type error: ${error.message}`);
      throw error;
    }
  }

  // 更新设备类型
  static async updateDeviceType(id, deviceTypeData) {
    try {
      const deviceType = await DeviceType.findByPk(id);
      if (!deviceType) {
        logger.warn(`Update device type failed: Type ${id} not found`);
        throw new Error('Device type not found');
      }
      if (deviceTypeData && typeof deviceTypeData.name === 'string') {
        const name = deviceTypeData.name.trim();
        if (name !== '' && name !== deviceType.name) {
          const existing = await DeviceType.findOne({ where: { name, id: { [require('sequelize').Op.ne]: id } } });
          if (existing) {
            logger.warn(`Update device type failed: Name ${name} already exists`);
            throw new Error('设备类型名称已存在');
          }
        }
      }
      await deviceType.update(deviceTypeData);
      logger.info(`Update device type successful: Type ${id}`);
      return deviceType;
    } catch (error) {
      if (error && (error.name === 'SequelizeUniqueConstraintError' || error.name === 'UniqueConstraintError')) {
        throw new Error('设备类型名称已存在');
      }
      logger.error(`Update device type error: ${error.message}`);
      throw error;
    }
  }

  // 删除设备类型
  static async deleteDeviceType(id) {
    try {
      const deviceType = await DeviceType.findByPk(id);
      if (!deviceType) {
        logger.warn(`Delete device type failed: Type ${id} not found`);
        throw new Error('Device type not found');
      }
      const deviceCount = await Device.count({ where: { deviceTypeId: id } });
      if (deviceCount > 0) {
        throw new Error('该设备类型下有关联设备，无法删除');
      }
      await deviceType.destroy();
      logger.info(`Delete device type successful: Type ${id}`);
      return { message: 'Device type deleted successfully' };
    } catch (error) {
      logger.error(`Delete device type error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = DeviceTypeService;
