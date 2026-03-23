const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const DeviceService = require('../services/deviceService');
const authenticateToken = require('../middleware/auth');

// 获取设备列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const devices = await DeviceService.getDevices();
    res.json({ devices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 根据ID获取设备详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const device = await DeviceService.getDeviceById(req.params.id);
    res.json({ device });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 添加设备
router.post('/', authenticateToken,
  body('deviceCode').notEmpty().withMessage('Device code is required').isLength({ max: 50 }).withMessage('Device code must not exceed 50 characters'),
  body('name').notEmpty().withMessage('Device name is required').isLength({ max: 100 }).withMessage('Device name must not exceed 100 characters'),
  body('type').notEmpty().withMessage('Device type is required').isLength({ max: 50 }).withMessage('Device type must not exceed 50 characters'),
  body('model').notEmpty().withMessage('Device model is required').isLength({ max: 100 }).withMessage('Device model must not exceed 100 characters'),
  body('status').isIn(['normal', 'maintenance', 'fault', 'scrapped']).withMessage('Status must be one of: normal, maintenance, fault, scrapped'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const device = await DeviceService.createDevice(req.body);
      res.status(201).json({ message: 'Device created successfully', device });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 更新设备
router.put('/:id', authenticateToken,
  body('deviceCode').optional().isLength({ max: 50 }).withMessage('Device code must not exceed 50 characters'),
  body('name').optional().isLength({ max: 100 }).withMessage('Device name must not exceed 100 characters'),
  body('type').optional().isLength({ max: 50 }).withMessage('Device type must not exceed 50 characters'),
  body('model').optional().isLength({ max: 100 }).withMessage('Device model must not exceed 100 characters'),
  body('status').optional().isIn(['normal', 'maintenance', 'fault', 'scrapped']).withMessage('Status must be one of: normal, maintenance, fault, scrapped'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const device = await DeviceService.updateDevice(req.params.id, req.body);
      res.json({ message: 'Device updated successfully', device });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message });
    }
  }
);

// 报废设备
router.put('/:id/scrap', authenticateToken,
  body('scrapReason').notEmpty().withMessage('Scrap reason is required'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const device = await DeviceService.scrapDevice(req.params.id, req.body.scrapReason);
      res.json({ message: 'Device scrapped successfully', device });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message });
    }
  }
);

// 删除设备
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await DeviceService.deleteDevice(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 按状态筛选设备
router.get('/status/:status', authenticateToken, async (req, res) => {
  try {
    const devices = await DeviceService.getDevicesByStatus(req.params.status);
    res.json({ devices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;