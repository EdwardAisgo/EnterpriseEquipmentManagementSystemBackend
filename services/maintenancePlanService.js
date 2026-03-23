const { MaintenancePlan, Device } = require('../models');
const logger = require('../utils/logger');
const RedisCache = require('../utils/redis');

class MaintenancePlanService {
  // 获取维护计划列表
  static async getMaintenancePlans() {
    try {
      // 尝试从缓存获取
      const cachedPlans = await RedisCache.get('maintenancePlans:all');
      if (cachedPlans) {
        logger.info('Get maintenance plans from cache');
        return cachedPlans;
      }

      // 从数据库获取
      const plans = await MaintenancePlan.findAll({
        include: [{ model: Device, attributes: ['id', 'deviceCode', 'name'] }],
        order: [['createdAt', 'DESC']]
      });

      // 缓存结果
      await RedisCache.set('maintenancePlans:all', plans, 300); // 5分钟缓存
      logger.info(`Get maintenance plans successful: ${plans.length} plans found`);
      return plans;
    } catch (error) {
      logger.error(`Get maintenance plans error: ${error.message}`);
      throw error;
    }
  }

  // 根据ID获取维护计划详情
  static async getMaintenancePlanById(id) {
    try {
      // 尝试从缓存获取
      const cachedPlan = await RedisCache.get(`maintenancePlan:${id}`);
      if (cachedPlan) {
        logger.info(`Get maintenance plan by id from cache: Plan ${id}`);
        return cachedPlan;
      }

      // 从数据库获取
      const plan = await MaintenancePlan.findByPk(id, {
        include: [{ model: Device, attributes: ['id', 'deviceCode', 'name'] }]
      });
      if (!plan) {
        logger.warn(`Get maintenance plan by id failed: Plan ${id} not found`);
        throw new Error('Maintenance plan not found');
      }

      // 缓存结果
      await RedisCache.set(`maintenancePlan:${id}`, plan, 600); // 10分钟缓存
      logger.info(`Get maintenance plan by id successful: Plan ${id}`);
      return plan;
    } catch (error) {
      logger.error(`Get maintenance plan by id error: ${error.message}`);
      throw error;
    }
  }

  // 添加维护计划
  static async createMaintenancePlan(planData) {
    try {
      const plan = await MaintenancePlan.create(planData);
      
      // 清除维护计划列表缓存
      await RedisCache.del('maintenancePlans:all');
      logger.info(`Create maintenance plan successful: Plan ${plan.id}`);
      return plan;
    } catch (error) {
      logger.error(`Create maintenance plan error: ${error.message}`);
      throw error;
    }
  }

  // 更新维护计划
  static async updateMaintenancePlan(id, planData) {
    try {
      const plan = await MaintenancePlan.findByPk(id);
      if (!plan) {
        logger.warn(`Update maintenance plan failed: Plan ${id} not found`);
        throw new Error('Maintenance plan not found');
      }
      await plan.update(planData);
      
      // 清除相关缓存
      await RedisCache.del('maintenancePlans:all');
      await RedisCache.del(`maintenancePlan:${id}`);
      logger.info(`Update maintenance plan successful: Plan ${id}`);
      return plan;
    } catch (error) {
      logger.error(`Update maintenance plan error: ${error.message}`);
      throw error;
    }
  }

  // 删除维护计划
  static async deleteMaintenancePlan(id) {
    try {
      const plan = await MaintenancePlan.findByPk(id);
      if (!plan) {
        logger.warn(`Delete maintenance plan failed: Plan ${id} not found`);
        throw new Error('Maintenance plan not found');
      }
      await plan.destroy();
      
      // 清除相关缓存
      await RedisCache.del('maintenancePlans:all');
      await RedisCache.del(`maintenancePlan:${id}`);
      logger.info(`Delete maintenance plan successful: Plan ${id}`);
      return { message: 'Maintenance plan deleted successfully' };
    } catch (error) {
      logger.error(`Delete maintenance plan error: ${error.message}`);
      throw error;
    }
  }

  // 按设备ID获取维护计划
  static async getMaintenancePlansByDeviceId(deviceId) {
    try {
      // 尝试从缓存获取
      const cachedPlans = await RedisCache.get(`maintenancePlans:device:${deviceId}`);
      if (cachedPlans) {
        logger.info(`Get maintenance plans by device id from cache: ${cachedPlans.length} plans found for device ${deviceId}`);
        return cachedPlans;
      }

      // 从数据库获取
      const plans = await MaintenancePlan.findAll({
        where: { deviceId },
        include: [{ model: Device, attributes: ['id', 'deviceCode', 'name'] }]
      });

      // 缓存结果
      await RedisCache.set(`maintenancePlans:device:${deviceId}`, plans, 300); // 5分钟缓存
      logger.info(`Get maintenance plans by device id successful: ${plans.length} plans found for device ${deviceId}`);
      return plans;
    } catch (error) {
      logger.error(`Get maintenance plans by device id error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = MaintenancePlanService;