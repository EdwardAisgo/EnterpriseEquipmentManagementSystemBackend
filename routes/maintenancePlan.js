const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MaintenancePlanService = require('../services/maintenancePlanService');
const authenticateToken = require('../middleware/auth');
const OperationLogService = require('../services/operationLogService');

// 获取维护计划列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const plans = await MaintenancePlanService.getMaintenancePlans();
    res.json({ plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 根据ID获取维护计划详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const plan = await MaintenancePlanService.getMaintenancePlanById(req.params.id);
    res.json({ plan });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 添加维护计划
router.post('/', authenticateToken,
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  body('maintenanceType').notEmpty().withMessage('Maintenance type is required').isLength({ max: 50 }).withMessage('Maintenance type must not exceed 50 characters'),
  body('cycle').notEmpty().withMessage('Cycle is required').isInt({ min: 1 }).withMessage('Cycle must be greater than 0'),
  body('cycleUnit').isIn(['day', 'week', 'month', 'year']).withMessage('Cycle unit must be one of: day, week, month, year'),
  body('nextMaintenance').notEmpty().withMessage('Next maintenance date is required'),
  body('responsiblePerson').notEmpty().withMessage('Responsible person is required').isLength({ max: 50 }).withMessage('Responsible person must not exceed 50 characters'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const plan = await MaintenancePlanService.createMaintenancePlan(req.body);
      try {
        await OperationLogService.record(req, {
          action: '新增维护计划',
          entityType: 'maintenance_plan',
          entityId: plan?.id,
          entityName: plan?.id,
          details: { body: req.body },
        });
      } catch (_e) {}
      res.status(201).json({ message: 'Maintenance plan created successfully', plan });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 更新维护计划
router.put('/:id', authenticateToken,
  body('maintenanceType').optional().isLength({ max: 50 }).withMessage('Maintenance type must not exceed 50 characters'),
  body('cycle').optional().isInt({ min: 1 }).withMessage('Cycle must be greater than 0'),
  body('cycleUnit').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Cycle unit must be one of: day, week, month, year'),
  body('responsiblePerson').optional().isLength({ max: 50 }).withMessage('Responsible person must not exceed 50 characters'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const plan = await MaintenancePlanService.updateMaintenancePlan(req.params.id, req.body);
      try {
        await OperationLogService.record(req, {
          action: '更新维护计划',
          entityType: 'maintenance_plan',
          entityId: plan?.id ?? req.params.id,
          entityName: plan?.id ?? req.params.id,
          details: { body: req.body },
        });
      } catch (_e) {}
      res.json({ message: 'Maintenance plan updated successfully', plan });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message });
    }
  }
);

// 删除维护计划
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await MaintenancePlanService.deleteMaintenancePlan(req.params.id);
    try {
      await OperationLogService.record(req, {
        action: '删除维护计划',
        entityType: 'maintenance_plan',
        entityId: req.params.id,
        entityName: req.params.id,
        details: {},
      });
    } catch (_e) {}
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 按设备ID获取维护计划
router.get('/device/:deviceId', authenticateToken, async (req, res) => {
  try {
    const plans = await MaintenancePlanService.getMaintenancePlansByDeviceId(req.params.deviceId);
    res.json({ plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
