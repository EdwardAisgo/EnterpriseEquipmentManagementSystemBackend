const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MaintenanceService = require('../services/maintenanceService');
const authenticateToken = require('../middleware/auth');

// 获取维护记录列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const maintenances = await MaintenanceService.getMaintenances();
    res.json({ maintenances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 根据ID获取维护记录详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const maintenance = await MaintenanceService.getMaintenanceById(req.params.id);
    res.json({ maintenance });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 添加维护记录
router.post('/', authenticateToken,
  body('deviceId').notEmpty().withMessage('Device ID is required').isInt().withMessage('Device ID must be an integer'),
  body('maintenanceDate').notEmpty().withMessage('Maintenance date is required').isISO8601().withMessage('Maintenance date must be a valid date'),
  body('maintenanceContent').notEmpty().withMessage('Maintenance content is required'),
  body('maintenancePerson').notEmpty().withMessage('Maintenance person is required').isLength({ max: 50 }).withMessage('Maintenance person must not exceed 50 characters'),
  body('cost').optional().isDecimal().withMessage('Cost must be a decimal number'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const maintenance = await MaintenanceService.createMaintenance(req.body);
      res.status(201).json({ message: 'Maintenance record created successfully', maintenance });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 更新维护记录
router.put('/:id', authenticateToken,
  body('maintenanceDate').optional().isISO8601().withMessage('Maintenance date must be a valid date'),
  body('maintenanceContent').optional().notEmpty().withMessage('Maintenance content is required'),
  body('maintenancePerson').optional().isLength({ max: 50 }).withMessage('Maintenance person must not exceed 50 characters'),
  body('cost').optional().isDecimal().withMessage('Cost must be a decimal number'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const maintenance = await MaintenanceService.updateMaintenance(req.params.id, req.body);
      res.json({ message: 'Maintenance record updated successfully', maintenance });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message });
    }
  }
);

// 删除维护记录
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await MaintenanceService.deleteMaintenance(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 获取设备的维护记录
router.get('/device/:deviceId', authenticateToken, async (req, res) => {
  try {
    const maintenances = await MaintenanceService.getMaintenancesByDeviceId(req.params.deviceId);
    res.json({ maintenances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;