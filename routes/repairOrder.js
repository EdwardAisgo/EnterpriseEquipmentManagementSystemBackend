const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const RepairOrderService = require('../services/repairOrderService');
const authenticateToken = require('../middleware/auth');

// 获取维修工单列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const repairOrders = await RepairOrderService.getRepairOrders();
    res.json({ repairOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 根据ID获取维修工单详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const repairOrder = await RepairOrderService.getRepairOrderById(req.params.id);
    res.json({ repairOrder });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 添加维修工单
router.post('/', authenticateToken,
  body('equipmentId').notEmpty().withMessage('Equipment ID is required').isInt().withMessage('Equipment ID must be an integer'),
  body('faultDescription').notEmpty().withMessage('Fault description is required'),
  body('reporter').notEmpty().withMessage('Reporter is required').isLength({ max: 50 }).withMessage('Reporter must not exceed 50 characters'),
  body('reportDate').notEmpty().withMessage('Report date is required').isISO8601().withMessage('Report date must be a valid date'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const repairOrder = await RepairOrderService.createRepairOrder(req.body);
      res.status(201).json({ message: 'Repair order created successfully', repairOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 更新维修工单
router.put('/:id', authenticateToken,
  body('faultDescription').optional().notEmpty().withMessage('Fault description is required'),
  body('reporter').optional().isLength({ max: 50 }).withMessage('Reporter must not exceed 50 characters'),
  body('reportDate').optional().isISO8601().withMessage('Report date must be a valid date'),
  body('assignedTo').optional().isLength({ max: 50 }).withMessage('Assigned to must not exceed 50 characters'),
  body('repairDate').optional().isISO8601().withMessage('Repair date must be a valid date'),
  body('repairContent').optional().notEmpty().withMessage('Repair content is required'),
  body('repairPerson').optional().isLength({ max: 50 }).withMessage('Repair person must not exceed 50 characters'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Status must be one of: pending, in_progress, completed, cancelled'),
  body('cost').optional().isDecimal().withMessage('Cost must be a decimal number'),
  body('partsUsed').optional().isLength({ max: 255 }).withMessage('Parts used must not exceed 255 characters'),
  body('notes').optional().isLength({ max: 255 }).withMessage('Notes must not exceed 255 characters'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const repairOrder = await RepairOrderService.updateRepairOrder(req.params.id, req.body);
      res.json({ message: 'Repair order updated successfully', repairOrder });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message });
    }
  }
);

// 删除维修工单
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await RepairOrderService.deleteRepairOrder(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 按设备ID获取维修工单
router.get('/equipment/:equipmentId', authenticateToken, async (req, res) => {
  try {
    const repairOrders = await RepairOrderService.getRepairOrdersByEquipmentId(req.params.equipmentId);
    res.json({ repairOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 按状态获取维修工单
router.get('/status/:status', authenticateToken, async (req, res) => {
  try {
    const repairOrders = await RepairOrderService.getRepairOrdersByStatus(req.params.status);
    res.json({ repairOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;