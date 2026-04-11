const { Maintenance, Device } = require('../models');
const logger = require('../utils/logger');
const RedisCache = require('../utils/redis');

class MaintenanceService {
  // 获取维护记录列表
  static async getMaintenances() {
    try {
      // 尝试从缓存获取
      const cachedMaintenances = await RedisCache.get('maintenances:all');
      if (cachedMaintenances) {
        logger.info('Get maintenances from cache');
        return cachedMaintenances;
      }

      // 从数据库获取
      const maintenances = await Maintenance.findAll({
        include: [{ model: Device, attributes: ['id', 'deviceCode', 'name', 'model'] }],
        order: [['startDate', 'DESC']]
      });

      // 缓存结果
      await RedisCache.set('maintenances:all', maintenances, 300); // 5分钟缓存
      logger.info(`Get maintenances successful: ${maintenances.length} records found`);
      return maintenances;
    } catch (error) {
      logger.error(`Get maintenances error: ${error.message}`);
      throw error;
    }
  }

  // 根据ID获取维护记录详情
  static async getMaintenanceById(id) {
    try {
      // 尝试从缓存获取
      const cachedMaintenance = await RedisCache.get(`maintenance:${id}`);
      if (cachedMaintenance) {
        logger.info(`Get maintenance by id from cache: Maintenance ${id}`);
        return cachedMaintenance;
      }

      // 从数据库获取
      const maintenance = await Maintenance.findByPk(id, {
        include: [{ model: Device, attributes: ['id', 'deviceCode', 'name', 'model'] }]
      });
      if (!maintenance) {
        logger.warn(`Get maintenance by id failed: Maintenance ${id} not found`);
        throw new Error('Maintenance record not found');
      }

      // 缓存结果
      await RedisCache.set(`maintenance:${id}`, maintenance, 600); // 10分钟缓存
      logger.info(`Get maintenance by id successful: Maintenance ${id}`);
      return maintenance;
    } catch (error) {
      logger.error(`Get maintenance by id error: ${error.message}`);
      throw error;
    }
  }

  // 添加维护记录
  static async createMaintenance(maintenanceData) {
    try {
      // 转换数据格式，使其与后端模型匹配
      const transformedData = {
        deviceId: maintenanceData.deviceId,
        maintenanceType: maintenanceData.maintenanceType || 'preventive',
        description: maintenanceData.maintenanceContent,
        startDate: maintenanceData.maintenanceDate,
        endDate: maintenanceData.endDate || maintenanceData.maintenanceDate, // 如果没有结束日期，默认为开始日期
        status: maintenanceData.status || 'completed', // 默认为已完成
        technician: maintenanceData.maintenancePerson,
        cost: maintenanceData.cost,
        notes: maintenanceData.notes
      };
      const maintenance = await Maintenance.create(transformedData);
      
      // 如果维护记录已完成，确保设备状态为正常（除非它是报废的）
      if (maintenance.status === 'completed') {
        const device = await Device.findByPk(maintenance.deviceId);
        if (device && device.status !== 'scrapped') {
          await device.update({ status: 'normal' });
          logger.info(`Update device status to normal after maintenance: Device ${device.id}`);
        }
      }
      
      // 清除维护记录列表缓存
      await RedisCache.del('maintenances:all');
      logger.info(`Create maintenance successful: Maintenance ${maintenance.id}`);
      return maintenance;
    } catch (error) {
      logger.error(`Create maintenance error: ${error.message}`);
      throw error;
    }
  }

  // 更新维护记录
  static async updateMaintenance(id, maintenanceData) {
    try {
      const maintenance = await Maintenance.findByPk(id);
      if (!maintenance) {
        logger.warn(`Update maintenance failed: Maintenance ${id} not found`);
        throw new Error('Maintenance record not found');
      }
      await maintenance.update(maintenanceData);
      
      // 清除相关缓存
      await RedisCache.del('maintenances:all');
      await RedisCache.del(`maintenance:${id}`);
      logger.info(`Update maintenance successful: Maintenance ${id}`);
      return maintenance;
    } catch (error) {
      logger.error(`Update maintenance error: ${error.message}`);
      throw error;
    }
  }

  // 删除维护记录
  static async deleteMaintenance(id) {
    try {
      const maintenance = await Maintenance.findByPk(id);
      if (!maintenance) {
        logger.warn(`Delete maintenance failed: Maintenance ${id} not found`);
        throw new Error('Maintenance record not found');
      }
      await maintenance.destroy();
      
      // 清除相关缓存
      await RedisCache.del('maintenances:all');
      await RedisCache.del(`maintenance:${id}`);
      logger.info(`Delete maintenance successful: Maintenance ${id}`);
      return { message: 'Maintenance record deleted successfully' };
    } catch (error) {
      logger.error(`Delete maintenance error: ${error.message}`);
      throw error;
    }
  }

  // 获取设备的维护记录
  static async getMaintenancesByDeviceId(deviceId) {
    try {
      // 尝试从缓存获取
      const cachedMaintenances = await RedisCache.get(`maintenances:device:${deviceId}`);
      if (cachedMaintenances) {
        logger.info(`Get maintenances by device id from cache: ${cachedMaintenances.length} records found for device ${deviceId}`);
        return cachedMaintenances;
      }

      // 从数据库获取
      const maintenances = await Maintenance.findAll({
        where: { deviceId },
        order: [['startDate', 'DESC']]
      });

      // 缓存结果
      await RedisCache.set(`maintenances:device:${deviceId}`, maintenances, 300); // 5分钟缓存
      logger.info(`Get maintenances by device id successful: ${maintenances.length} records found for device ${deviceId}`);
      return maintenances;
    } catch (error) {
      logger.error(`Get maintenances by device id error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = MaintenanceService;
