const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const UserService = require('../services/userService');
const authenticateToken = require('../middleware/auth');

// 用户注册
router.post('/register',
  body('username').notEmpty().withMessage('Username is required').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be a valid email address'),
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name must not exceed 50 characters'),
  body('departmentId').optional().isInt().withMessage('Department ID must be an integer'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const user = await UserService.register(req.body);
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
);

// 更新用户信息
router.put('/me', authenticateToken,
  body('email').optional().isEmail().withMessage('Email must be a valid email address'),
  body('name').optional().isLength({ max: 50 }).withMessage('Name must not exceed 50 characters'),
  body('departmentId').optional().isInt().withMessage('Department ID must be an integer'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const user = await UserService.updateUser(req.user.id, req.body);
      res.json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message });
    }
  }
);

// 更改密码
router.put('/me/password', authenticateToken,
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').notEmpty().withMessage('New password is required').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      await UserService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
);

// 获取用户列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await UserService.getUsers(req.query);
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 更新用户（管理员/系统管理场景）
router.put('/:id', authenticateToken,
  body('email').optional().isEmail().withMessage('Email must be a valid email address'),
  body('name').optional().isLength({ max: 50 }).withMessage('Name must not exceed 50 characters'),
  body('departmentId').optional().isInt().withMessage('Department ID must be an integer'),
  body('roleId').optional().isInt().withMessage('Role ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      res.json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message });
    }
  }
);

// 根据ID获取用户信息
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

// 管理员重置密码
router.put('/:id/reset-password', authenticateToken,
  body('newPassword').notEmpty().withMessage('New password is required').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  async (req, res) => {
    // 权限检查：只有管理员可以重置他人密码
    const isAdmin =
      req.user &&
      (req.user.username === 'admin' ||
        req.user.role === 'admin' ||
        req.user.role === '系统管理员' ||
        req.user.roleId === 1 ||
        req.user.roleId === 12);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admin can reset password' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await UserService.resetPassword(req.params.id, req.body.newPassword);
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
);

// 删除用户
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await UserService.deleteUser(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
