const express = require('express');
const router = express.Router();
const DepartmentService = require('../services/departmentService');
const authenticateToken = require('../middleware/auth');

// 获取所有部门
router.get('/', authenticateToken, async (req, res) => {
  try {
    const departments = await DepartmentService.getAllDepartments();
    res.json({ departments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 根据ID获取部门详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const department = await DepartmentService.getDepartmentById(req.params.id);
    res.json({ department });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 新增部门
router.post('/', authenticateToken, async (req, res) => {
  try {
    const department = await DepartmentService.createDepartment(req.body);
    res.status(201).json({ message: 'Department created successfully', department });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// 更新部门
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const department = await DepartmentService.updateDepartment(req.params.id, req.body);
    res.json({ message: 'Department updated successfully', department });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// 删除部门
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await DepartmentService.deleteDepartment(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
