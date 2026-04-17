const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const OperationLogService = require('../services/operationLogService');
const { User, Role } = require('../models');

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findByPk(req.user?.id, { include: [{ model: Role }] });
    const roleName = user?.Role?.name;
    if (user?.username !== 'admin' && roleName !== 'admin' && roleName !== '系统管理员') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await OperationLogService.query(req.query);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

