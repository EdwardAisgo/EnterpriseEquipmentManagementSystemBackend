const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const MenuService = require('../services/menuService');
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

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const menus = await MenuService.getMenuTreeForUser(req.user.id);
    res.json({ menus });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

router.get('/all', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const menus = await MenuService.getAllMenuTree();
    res.json({ menus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/sync', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await MenuService.initMenusFromClient(req.body?.menus);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
