const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const UserService = require('../services/userService');
require('dotenv').config();

// 登录
router.post('/login', 
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { username, password } = req.body;
      const result = await UserService.login(username, password);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: error.message });
    }
  }
);

// 注册
router.post('/register',
  body('username').notEmpty().withMessage('Username is required').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be a valid email address'),
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const user = await UserService.register(req.body);
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
);

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await UserService.getUserById(decoded.id);
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;