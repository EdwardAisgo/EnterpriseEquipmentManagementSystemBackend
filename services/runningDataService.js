const { RunningData, Device } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const RedisCache = require('../utils/redis');
const { toDateString } = require('../utils/dateHelper');

class RunningDataService {
  // 获取运行数据列表
  static async getRunningData() {
    try {
      // 尝试从缓存获取
      const cachedRunningData = await RedisCache.get('runningData:all');
      if (cachedRunningData) {
        logger.info('Get running data from cache');
        return cachedRunningData;
      }

      // 从数据库获取
      const runningData = await RunningData.findAll({
        include: [{ model: Device, attributes: ['id', 'deviceCode', 'name', 'model'] }],
        order: [['date', 'DESC']]
      });

      // 缓存结果
      await RedisCache.set('runningData:all', runningData, 300); // 5分钟缓存
      logger.info(`Get running data successful: ${runningData.length} records found`);
      return runningData;
    } catch (error) {
      logger.error(`Get running data error: ${error.message}`);
      throw error;
    }
  }

  // 根据ID获取运行数据详情
  static async getRunningDataById(id) {
    try {
      // 尝试从缓存获取
      const cachedRunningData = await RedisCache.get(`runningData:${id}`);
      if (cachedRunningData) {
        logger.info(`Get running data by id from cache: Data ${id}`);
        return cachedRunningData;
      }

      // 从数据库获取
      const data = await RunningData.findByPk(id, {
        include: [{ model: Device, attributes: ['id', 'deviceCode', 'name', 'model'] }]
      });
      if (!data) {
        logger.warn(`Get running data by id failed: Data ${id} not found`);
        throw new Error('Running data not found');
      }

      // 缓存结果
      await RedisCache.set(`runningData:${id}`, data, 600); // 10分钟缓存
      logger.info(`Get running data by id successful: Data ${id}`);
      return data;
    } catch (error) {
      logger.error(`Get running data by id error: ${error.message}`);
      throw error;
    }
  }

  // 添加运行数据
  static async createRunningData(runningData) {
    try {
      const equipmentId = runningData.equipmentId ?? runningData.deviceId;
      if (!equipmentId) {
        throw new Error('Equipment ID is required');
      }

      const device = await Device.findByPk(equipmentId);
      if (!device) {
        throw new Error('Device not found');
      }

      const transformedData = {
        equipmentId,
        date: toDateString(runningData.date ?? runningData.recordTime),
        runningHours: runningData.runningHours,
        production: runningData.production,
        energyConsumption: runningData.energyConsumption,
        operator: runningData.operator,
        notes: runningData.notes ?? null,
      };

      if (!transformedData.date) throw new Error('Date is required');
      if (transformedData.runningHours === undefined || transformedData.runningHours === null) {
        throw new Error('Running hours is required');
      }
      if (transformedData.production === undefined || transformedData.production === null) {
        throw new Error('Production is required');
      }
      if (transformedData.energyConsumption === undefined || transformedData.energyConsumption === null) {
        throw new Error('Energy consumption is required');
      }
      if (!transformedData.operator) throw new Error('Operator is required');

      const data = await RunningData.create(transformedData);
      
      // 更新设备的运行小时数
      await device.update({ runningHours: data.runningHours });
      logger.info(`Update device running hours: Device ${device.id}, Running hours ${data.runningHours}`);
      
      // 清除运行数据列表缓存
      await RedisCache.del('runningData:all');
      await RedisCache.del(`runningData:equipment:${data.equipmentId}`);
      await RedisCache.del(`runningData:latest:${data.equipmentId}`);
      logger.info(`Create running data successful: Data ${data.id}`);
      return data;
    } catch (error) {
      logger.error(`Create running data error: ${error.message}`);
      throw error;
    }
  }

  // 更新运行数据
  static async updateRunningData(id, runningData) {
    try {
      const data = await RunningData.findByPk(id);
      if (!data) {
        logger.warn(`Update running data failed: Data ${id} not found`);
        throw new Error('Running data not found');
      }
      const normalizedData = {
        ...runningData,
        date: toDateString(runningData.date ?? runningData.recordTime),
      };
      await data.update(normalizedData);
      
      // 清除相关缓存
      await RedisCache.del('runningData:all');
      await RedisCache.del(`runningData:${id}`);
      await RedisCache.del(`runningData:equipment:${data.equipmentId}`);
      await RedisCache.del(`runningData:latest:${data.equipmentId}`);
      logger.info(`Update running data successful: Data ${id}`);
      return data;
    } catch (error) {
      logger.error(`Update running data error: ${error.message}`);
      throw error;
    }
  }

  // 删除运行数据
  static async deleteRunningData(id) {
    try {
      const data = await RunningData.findByPk(id);
      if (!data) {
        logger.warn(`Delete running data failed: Data ${id} not found`);
        throw new Error('Running data not found');
      }
      const equipmentId = data.equipmentId;
      await data.destroy();
      
      // 清除相关缓存
      await RedisCache.del('runningData:all');
      await RedisCache.del(`runningData:${id}`);
      await RedisCache.del(`runningData:equipment:${equipmentId}`);
      await RedisCache.del(`runningData:latest:${equipmentId}`);
      logger.info(`Delete running data successful: Data ${id}`);
      return { message: 'Running data deleted successfully' };
    } catch (error) {
      logger.error(`Delete running data error: ${error.message}`);
      throw error;
    }
  }

  // 按设备ID获取运行数据
  static async getRunningDataByEquipmentId(equipmentId) {
    try {
      // 尝试从缓存获取
      const cachedRunningData = await RedisCache.get(`runningData:equipment:${equipmentId}`);
      if (cachedRunningData) {
        logger.info(`Get running data by equipment id from cache: ${cachedRunningData.length} records found for equipment ${equipmentId}`);
        return cachedRunningData;
      }

      // 从数据库获取
      const runningData = await RunningData.findAll({
        where: { equipmentId },
        order: [['date', 'DESC']]
      });

      // 缓存结果
      await RedisCache.set(`runningData:equipment:${equipmentId}`, runningData, 300); // 5分钟缓存
      logger.info(`Get running data by equipment id successful: ${runningData.length} records found for equipment ${equipmentId}`);
      return runningData;
    } catch (error) {
      logger.error(`Get running data by equipment id error: ${error.message}`);
      throw error;
    }
  }

  // 获取设备的最新运行数据
  static async getLatestRunningDataByEquipmentId(equipmentId) {
    try {
      // 尝试从缓存获取
      const cachedRunningData = await RedisCache.get(`runningData:latest:${equipmentId}`);
      if (cachedRunningData) {
        logger.info(`Get latest running data by equipment id from cache: Equipment ${equipmentId}`);
        return cachedRunningData;
      }

      // 从数据库获取
      const data = await RunningData.findOne({
        where: { equipmentId },
        order: [['date', 'DESC']]
      });
      if (!data) {
        logger.warn(`Get latest running data by equipment id failed: No data found for equipment ${equipmentId}`);
        throw new Error('No running data found for this equipment');
      }

      // 缓存结果
      await RedisCache.set(`runningData:latest:${equipmentId}`, data, 300); // 5分钟缓存
      logger.info(`Get latest running data by equipment id successful: Equipment ${equipmentId}`);
      return data;
    } catch (error) {
      logger.error(`Get latest running data by equipment id error: ${error.message}`);
      throw error;
    }
  }

  // 按时间范围获取运行数据
  static async getRunningDataByTimeRange(equipmentId, startTime, endTime) {
    try {
      // 从数据库获取
      const runningData = await RunningData.findAll({
        where: {
          equipmentId,
          date: {
            [Op.between]: [startTime, endTime]
          }
        },
        order: [['date', 'ASC']]
      });

      logger.info(`Get running data by time range successful: ${runningData.length} records found for equipment ${equipmentId} between ${startTime} and ${endTime}`);
      return runningData;
    } catch (error) {
      logger.error(`Get running data by time range error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = RunningDataService;
