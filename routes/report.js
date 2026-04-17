const express = require('express');
const router = express.Router();
const ReportService = require('../services/reportService');
const authenticateToken = require('../middleware/auth');

// 获取设备状态统计
router.get('/device-status', authenticateToken, async (req, res) => {
  try {
    const statusCounts = await ReportService.getDeviceStatusCount();
    res.json({ statusCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 获取部门设备统计
router.get('/department-devices', authenticateToken, async (req, res) => {
  try {
    const departmentCounts = await ReportService.getDepartmentDeviceCount();
    res.json({ departmentCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 获取维护类型统计
router.get('/maintenance-type', authenticateToken, async (req, res) => {
  try {
    const typeCounts = await ReportService.getMaintenanceTypeCount();
    res.json({ typeCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 获取年度维护成本统计
router.get('/maintenance-cost/:year', authenticateToken, async (req, res) => {
  try {
    const year = req.params.year;
    const monthlyCosts = await ReportService.getAnnualMaintenanceCost(year);
    res.json({ monthlyCosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 获取即将到期的维护计划 (30天内)
router.get('/maintenance-expiring', authenticateToken, async (req, res) => {
  try {
    const expiringPlans = await ReportService.getExpiringMaintenancePlans();
    res.json({ expiringPlans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;