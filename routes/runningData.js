const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const RunningDataService = require('../services/runningDataService');
const authenticateToken = require('../middleware/auth');

// 获取运行数据列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const runningData = await RunningDataService.getRunningData();
    res.json({ runningData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 根据ID获取运行数据详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const data = await RunningDataService.getRunningDataById(req.params.id);
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 添加运行数据
router.post('/', authenticateToken,
  body('equipmentId').optional().isInt().withMessage('Equipment ID must be an integer'),
  body('deviceId').optional().isInt().withMessage('Device ID must be an integer'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('recordTime').optional().isISO8601().withMessage('Record time must be a valid date'),
  body('runningHours').notEmpty().withMessage('Running hours is required').isDecimal().withMessage('Running hours must be a decimal number'),
  body('production').notEmpty().withMessage('Production is required').isDecimal().withMessage('Production must be a decimal number'),
  body('energyConsumption').notEmpty().withMessage('Energy consumption is required').isDecimal().withMessage('Energy consumption must be a decimal number'),
  body('operator').notEmpty().withMessage('Operator is required').isLength({ max: 50 }).withMessage('Operator must not exceed 50 characters'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      if (!req.body.equipmentId && !req.body.deviceId) {
        return res.status(400).json({ message: 'Equipment ID is required' });
      }
      const data = await RunningDataService.createRunningData(req.body);
      res.status(201).json({ message: 'Running data created successfully', data });
    } catch (error) {
      console.error(error);
      if (error.message === 'Device not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 更新运行数据
router.put('/:id', authenticateToken,
  body('temperature').optional().isDecimal().withMessage('Temperature must be a decimal number'),
  body('pressure').optional().isDecimal().withMessage('Pressure must be a decimal number'),
  body('vibration').optional().isDecimal().withMessage('Vibration must be a decimal number'),
  body('power').optional().isDecimal().withMessage('Power must be a decimal number'),
  body('runningHours').optional().isDecimal().withMessage('Running hours must be a decimal number'),
  body('recordTime').optional().isISO8601().withMessage('Record time must be a valid date'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const data = await RunningDataService.updateRunningData(req.params.id, req.body);
      res.json({ message: 'Running data updated successfully', data });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message });
    }
  }
);

// 删除运行数据
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await RunningDataService.deleteRunningData(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 按设备ID获取运行数据
router.get('/equipment/:equipmentId', authenticateToken, async (req, res) => {
  try {
    const runningData = await RunningDataService.getRunningDataByEquipmentId(req.params.equipmentId);
    res.json({ runningData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 获取设备的最新运行数据
router.get('/equipment/:equipmentId/latest', authenticateToken, async (req, res) => {
  try {
    const data = await RunningDataService.getLatestRunningDataByEquipmentId(req.params.equipmentId);
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 按时间范围获取运行数据
router.get('/equipment/:equipmentId/range', authenticateToken,
  query('startTime').notEmpty().withMessage('Start time is required').isISO8601().withMessage('Start time must be a valid date'),
  query('endTime').notEmpty().withMessage('End time is required').isISO8601().withMessage('End time must be a valid date'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const runningData = await RunningDataService.getRunningDataByTimeRange(
        req.params.equipmentId,
        req.query.startTime,
        req.query.endTime
      );
      res.json({ runningData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

module.exports = router;
