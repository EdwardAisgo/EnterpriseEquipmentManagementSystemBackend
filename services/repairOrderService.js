const { RepairOrder, Device } = require('../models');
const logger = require('../utils/logger');
const RedisCache = require('../utils/redis');

class RepairOrderService {
  // 获取维修工单列表
  static async getRepairOrders() {
    try {
      // 尝试从缓存获取
      const cachedRepairOrders = await RedisCache.get('repairOrders:all');
      if (cachedRepairOrders) {
        logger.info('Get repair orders from cache');
        return cachedRepairOrders;
      }

      // 从数据库获取
      const repairOrders = await RepairOrder.findAll({
        include: [{ model: Device, attributes: ['id', 'deviceCode', 'name', 'model'] }],
        order: [['createdAt', 'DESC']]
      });

      // 缓存结果
      await RedisCache.set('repairOrders:all', repairOrders, 300); // 5分钟缓存
      logger.info(`Get repair orders successful: ${repairOrders.length} orders found`);
      return repairOrders;
    } catch (error) {
      logger.error(`Get repair orders error: ${error.message}`);
      throw error;
    }
  }

  // 根据ID获取维修工单详情
  static async getRepairOrderById(id) {
    try {
      // 尝试从缓存获取
      const cachedRepairOrder = await RedisCache.get(`repairOrder:${id}`);
      if (cachedRepairOrder) {
        logger.info(`Get repair order by id from cache: Order ${id}`);
        return cachedRepairOrder;
      }

      // 从数据库获取
      const repairOrder = await RepairOrder.findByPk(id, {
        include: [{ model: Device, attributes: ['id', 'deviceCode', 'name', 'model'] }]
      });
      if (!repairOrder) {
        logger.warn(`Get repair order by id failed: Order ${id} not found`);
        throw new Error('Repair order not found');
      }

      // 缓存结果
      await RedisCache.set(`repairOrder:${id}`, repairOrder, 600); // 10分钟缓存
      logger.info(`Get repair order by id successful: Order ${id}`);
      return repairOrder;
    } catch (error) {
      logger.error(`Get repair order by id error: ${error.message}`);
      throw error;
    }
  }

  // 添加维修工单
  static async createRepairOrder(repairOrderData) {
    try {
      // 检查设备状态
      const device = await Device.findByPk(repairOrderData.equipmentId);
      if (!device) {
        throw new Error('设备不存在');
      }
      if (device.status === 'scrapped') {
        throw new Error('设备已报废，无法提交报修');
      }
      if (device.status === 'fault' || device.status === 'maintenance') {
        throw new Error('设备已在故障维修中，请勿重复报修');
      }

      // 转换数据格式，使其与后端模型匹配
      // 生成工单编号：WO + yyyyMMdd + 设备ID(补位) + 4位随机数
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const deviceIdStr = String(repairOrderData.equipmentId).padStart(4, '0');
      const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const orderId = `WO${dateStr}${deviceIdStr}${randomStr}`;

      const transformedData = {
        id: orderId,
        equipmentId: repairOrderData.equipmentId,
        faultDescription: repairOrderData.faultDescription,
        applicant: repairOrderData.reporter,
        applyDate: repairOrderData.reportDate,
        status: 'pending' // 默认状态为待处理
      };
      const repairOrder = await RepairOrder.create(transformedData);
      
      // 更新设备状态为故障
      if (device) {
        await device.update({ status: 'fault' });
        logger.info(`Update device status to fault: Device ${device.id}`);
      }
      
      // 清除维修工单列表缓存
      await RedisCache.del('repairOrders:all');
      logger.info(`Create repair order successful: Order ${repairOrder.id}`);
      return repairOrder;
    } catch (error) {
      logger.error(`Create repair order error: ${error.message}`);
      throw error;
    }
  }

  // 更新维修工单
  static async updateRepairOrder(id, repairOrderData) {
    try {
      const repairOrder = await RepairOrder.findByPk(id);
      if (!repairOrder) {
        logger.warn(`Update repair order failed: Order ${id} not found`);
        throw new Error('Repair order not found');
      }
      
      const oldStatus = repairOrder.status;
      await repairOrder.update(repairOrderData);
      
      // 处理设备状态更新
      if (oldStatus !== repairOrder.status) {
        const device = await Device.findByPk(repairOrder.equipmentId);
        if (device) {
          if (repairOrder.status === 'in_progress') {
            await device.update({ status: 'maintenance' });
            logger.info(`Update device status to maintenance: Device ${device.id}`);
          } else if (repairOrder.status === 'completed') {
            await device.update({ status: 'normal' });
            logger.info(`Update device status to normal: Device ${device.id}`);
          } else if (repairOrder.status === 'cancelled') {
            await device.update({ status: 'normal' });
            logger.info(`Update device status to normal: Device ${device.id}`);
          }
        }
      }
      
      // 清除相关缓存
      await RedisCache.del('repairOrders:all');
      await RedisCache.del(`repairOrder:${id}`);
      logger.info(`Update repair order successful: Order ${id}`);
      return repairOrder;
    } catch (error) {
      logger.error(`Update repair order error: ${error.message}`);
      throw error;
    }
  }

  // 删除维修工单
  static async deleteRepairOrder(id) {
    try {
      const repairOrder = await RepairOrder.findByPk(id);
      if (!repairOrder) {
        logger.warn(`Delete repair order failed: Order ${id} not found`);
        throw new Error('Repair order not found');
      }
      await repairOrder.destroy();
      
      // 清除相关缓存
      await RedisCache.del('repairOrders:all');
      await RedisCache.del(`repairOrder:${id}`);
      logger.info(`Delete repair order successful: Order ${id}`);
      return { message: 'Repair order deleted successfully' };
    } catch (error) {
      logger.error(`Delete repair order error: ${error.message}`);
      throw error;
    }
  }

  // 按设备ID获取维修工单
  static async getRepairOrdersByEquipmentId(equipmentId) {
    try {
      // 尝试从缓存获取
      const cachedRepairOrders = await RedisCache.get(`repairOrders:equipment:${equipmentId}`);
      if (cachedRepairOrders) {
        logger.info(`Get repair orders by equipment id from cache: ${cachedRepairOrders.length} orders found for equipment ${equipmentId}`);
        return cachedRepairOrders;
      }

      // 从数据库获取
      const repairOrders = await RepairOrder.findAll({
        where: { equipmentId },
        include: [{ model: Device, attributes: ['id', 'deviceCode', 'name', 'model'] }],
        order: [['createdAt', 'DESC']]
      });

      // 缓存结果
      await RedisCache.set(`repairOrders:equipment:${equipmentId}`, repairOrders, 300); // 5分钟缓存
      logger.info(`Get repair orders by equipment id successful: ${repairOrders.length} orders found for equipment ${equipmentId}`);
      return repairOrders;
    } catch (error) {
      logger.error(`Get repair orders by equipment id error: ${error.message}`);
      throw error;
    }
  }

  // 按状态获取维修工单
  static async getRepairOrdersByStatus(status) {
    try {
      // 尝试从缓存获取
      const cachedRepairOrders = await RedisCache.get(`repairOrders:status:${status}`);
      if (cachedRepairOrders) {
        logger.info(`Get repair orders by status from cache: ${cachedRepairOrders.length} orders found for status ${status}`);
        return cachedRepairOrders;
      }

      // 从数据库获取
      const repairOrders = await RepairOrder.findAll({
        where: { status },
        include: [{ model: Device, attributes: ['id', 'deviceCode', 'name', 'model'] }],
        order: [['createdAt', 'DESC']]
      });

      // 缓存结果
      await RedisCache.set(`repairOrders:status:${status}`, repairOrders, 300); // 5分钟缓存
      logger.info(`Get repair orders by status successful: ${repairOrders.length} orders found for status ${status}`);
      return repairOrders;
    } catch (error) {
      logger.error(`Get repair orders by status error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = RepairOrderService;