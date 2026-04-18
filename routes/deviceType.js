const express = require('express');
const router = express.Router();
const DeviceTypeService = require('../services/deviceTypeService');
const authenticateToken = require('../middleware/auth');
const OperationLogService = require('../services/operationLogService');

// 获取所有设备类型
router.get('/', authenticateToken, async (req, res) => {
  try {
    const deviceTypes = await DeviceTypeService.getDeviceTypes();
    res.json({ deviceTypes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 根据ID获取设备类型详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const deviceType = await DeviceTypeService.getDeviceTypeById(req.params.id);
    res.json({ deviceType });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 新增设备类型
router.post('/', authenticateToken, async (req, res) => {
  try {
    const deviceType = await DeviceTypeService.createDeviceType(req.body);
    try {
      await OperationLogService.record(req, {
        action: '新增设备类型',
        entityType: 'device_type',
        entityId: deviceType?.id,
        entityName: deviceType?.name,
        details: { body: req.body },
      });
    } catch (_e) {}
    res.status(201).json({ message: 'Device type created successfully', deviceType });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// 更新设备类型
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const deviceType = await DeviceTypeService.updateDeviceType(req.params.id, req.body);
    try {
      await OperationLogService.record(req, {
        action: '更新设备类型',
        entityType: 'device_type',
        entityId: deviceType?.id ?? req.params.id,
        entityName: deviceType?.name,
        details: { body: req.body },
      });
    } catch (_e) {}
    res.json({ message: 'Device type updated successfully', deviceType });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// 删除设备类型
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await DeviceTypeService.deleteDeviceType(req.params.id);
    try {
      await OperationLogService.record(req, {
        action: '删除设备类型',
        entityType: 'device_type',
        entityId: req.params.id,
        details: {},
      });
    } catch (_e) {}
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
