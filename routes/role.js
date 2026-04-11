const express = require('express');
const router = express.Router();
const RoleService = require('../services/roleService');
const authenticateToken = require('../middleware/auth');

// 获取所有角色
router.get('/', authenticateToken, async (req, res) => {
  try {
    const roles = await RoleService.getAllRoles();
    res.json({ roles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 新增角色
router.post('/', authenticateToken, async (req, res) => {
  try {
    const role = await RoleService.createRole(req.body);
    res.status(201).json({ message: 'Role created successfully', role });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// 更新角色
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const role = await RoleService.updateRole(req.params.id, req.body);
    res.json({ message: 'Role updated successfully', role });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// 删除角色
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await RoleService.deleteRole(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
