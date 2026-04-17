const express = require('express');
const router = express.Router();
const BackupService = require('../services/backupService');
const authenticateToken = require('../middleware/auth');
const OperationLogService = require('../services/operationLogService');

// 获取备份列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const backups = await BackupService.getBackups();
    res.json({ backups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 执行备份
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const backupInfo = await BackupService.createBackup();
    try {
      await OperationLogService.record(req, {
        action: '创建备份',
        entityType: 'backup',
        entityId: backupInfo?.fileName,
        entityName: backupInfo?.fileName,
        details: {},
      });
    } catch (_e) {}
    res.status(201).json({ message: 'Backup created successfully', backup: backupInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// 执行恢复
router.post('/restore', authenticateToken, async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) return res.status(400).json({ message: 'File name is required' });
    const result = await BackupService.restoreBackup(fileName);
    try {
      await OperationLogService.record(req, {
        action: '恢复备份',
        entityType: 'backup',
        entityId: fileName,
        entityName: fileName,
        details: {},
      });
    } catch (_e) {}
    res.json({ message: 'Restore successful', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// 删除备份
router.delete('/:fileName', authenticateToken, async (req, res) => {
  try {
    const result = await BackupService.deleteBackup(req.params.fileName);
    try {
      await OperationLogService.record(req, {
        action: '删除备份',
        entityType: 'backup',
        entityId: req.params.fileName,
        entityName: req.params.fileName,
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
