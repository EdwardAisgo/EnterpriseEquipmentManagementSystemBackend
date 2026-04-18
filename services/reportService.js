const { Device, Maintenance, Department, MaintenancePlan, RunningData, RepairOrder } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

class ReportService {
  // 获取 30 天内需要执行的维护计划
  static async getExpiringMaintenancePlans() {
    try {
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      
      const expiringPlans = await MaintenancePlan.findAll({
        where: {
          nextMaintenance: {
            [Op.between]: [new Date(), thirtyDaysLater]
          },
          status: 'active'
        },
        include: [{ 
          model: Device, 
          attributes: ['id', 'name', 'deviceCode', 'status'],
          include: [{ model: Department, attributes: ['id', 'name'] }]
        }]
      });
      logger.info(`Get expiring maintenance plans successful: ${expiringPlans.length} plans found`);
      return expiringPlans;
    } catch (error) {
      logger.error(`Get expiring maintenance plans error: ${error.message}`);
      throw error;
    }
  }

  // 获取设备状态统计
  static async getDeviceStatusCount() {
    try {
      const statusCounts = await Device.findAll({
        attributes: ['status', [Device.sequelize.fn('COUNT', Device.sequelize.col('id')), 'count']],
        group: ['status']
      });
      logger.info('Get device status count successful');
      return statusCounts;
    } catch (error) {
      logger.error(`Get device status count error: ${error.message}`);
      throw error;
    }
  }

  // 获取部门设备统计
  static async getDepartmentDeviceCount() {
    try {
      const departmentCounts = await Department.findAll({
        attributes: ['id', 'name'],
        include: [{
          model: Device,
          attributes: [[Device.sequelize.fn('COUNT', Device.sequelize.col('id')), 'deviceCount']]
        }],
        group: ['Department.id']
      });
      logger.info('Get department device count successful');
      return departmentCounts;
    } catch (error) {
      logger.error(`Get department device count error: ${error.message}`);
      throw error;
    }
  }

  // 获取维护类型统计
  static async getMaintenanceTypeCount() {
    try {
      const typeCounts = await Maintenance.findAll({
        attributes: ['maintenanceType', [Maintenance.sequelize.fn('COUNT', Maintenance.sequelize.col('id')), 'count']],
        group: ['maintenanceType']
      });
      logger.info('Get maintenance type count successful');
      return typeCounts;
    } catch (error) {
      logger.error(`Get maintenance type count error: ${error.message}`);
      throw error;
    }
  }

  // 获取年度维护成本统计
  static async getAnnualMaintenanceCost(year) {
    try {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);

      const monthlyCosts = await Maintenance.findAll({
        attributes: [
          [Maintenance.sequelize.fn('MONTH', Maintenance.sequelize.col('startDate')), 'month'],
          [Maintenance.sequelize.fn('SUM', Maintenance.sequelize.col('cost')), 'totalCost']
        ],
        where: {
          startDate: {
            [Op.between]: [startDate, endDate]
          },
          cost: {
            [Op.ne]: null
          }
        },
        group: [Maintenance.sequelize.fn('MONTH', Maintenance.sequelize.col('startDate'))],
        order: [[Maintenance.sequelize.fn('MONTH', Maintenance.sequelize.col('startDate')), 'ASC']]
      });
      logger.info(`Get annual maintenance cost successful for year ${year}`);
      return monthlyCosts;
    } catch (error) {
      logger.error(`Get annual maintenance cost error: ${error.message}`);
      throw error;
    }
  }

  // 获取监控面板统计数据
  static async getMonitoringStats() {
    try {
      // 设备状态统计
      const deviceStatusCounts = await Device.findAll({
        attributes: ['status', [Device.sequelize.fn('COUNT', Device.sequelize.col('id')), 'count']],
        group: ['status']
      });

      const statusMap = {};
      let totalDevices = 0;
      deviceStatusCounts.forEach((item) => {
        const count = parseInt(item.get('count'), 10);
        statusMap[item.status] = count;
        totalDevices += count;
      });

      // 今日运行数据（使用 DATE() 函数只比较日期部分，避免时区问题）
      const todayStr = new Date().toISOString().slice(0, 10); // '2026-04-18'

      const todayRunningData = await RunningData.findAll({
        where: sequelize.where(
          sequelize.fn('DATE', sequelize.col('date')),
          todayStr
        ),
        attributes: ['equipmentId', 'runningHours']
      });

      let todayRunningHours = 0;
      const runningDeviceIds = new Set();
      todayRunningData.forEach((record) => {
        todayRunningHours += record.runningHours || 0;
        runningDeviceIds.add(record.equipmentId);
      });

      // 待处理故障报修数
      const pendingRepairCount = await RepairOrder.count({
        where: {
          status: 'pending'
        }
      });

      return {
        totalDevices,
        normalCount: statusMap.normal || 0,
        maintenanceCount: statusMap.maintenance || 0,
        faultCount: statusMap.fault || 0,
        scrappedCount: statusMap.scrapped || 0,
        todayRunningHours: parseFloat(todayRunningHours.toFixed(1)),
        todayRunningDeviceCount: runningDeviceIds.size,
        pendingRepairCount
      };
    } catch (error) {
      logger.error(`Get monitoring stats error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ReportService;