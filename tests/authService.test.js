const chai = require('chai');
const expect = chai.expect;
const AuthService = require('../services/authService');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 模拟User模型
const mockUser = {
  id: 1,
  username: 'testuser',
  password: bcrypt.hashSync('password123', 10),
  name: 'Test User',
  role: 'admin',
  departmentId: 1
};

describe('AuthService', () => {
  beforeEach(() => {
    // 模拟User.findOne
    User.findOne = async (options) => {
      if (options.where.username === 'testuser') {
        return mockUser;
      }
      return null;
    };

    // 模拟User.create
    User.create = async (userData) => {
      return {
        id: 2,
        ...userData,
        password: bcrypt.hashSync(userData.password, 10)
      };
    };

    // 模拟User.findByPk
    User.findByPk = async (id) => {
      if (id === 1) {
        return mockUser;
      }
      return null;
    };
  });

  describe('login', () => {
    it('should return token and user info for valid credentials', async () => {
      const result = await AuthService.login('testuser', 'password123');
      expect(result).to.have.property('token');
      expect(result).to.have.property('user');
      expect(result.user.username).to.equal('testuser');
    });

    it('should throw error for invalid username', async () => {
      try {
        await AuthService.login('invaliduser', 'password123');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Invalid username or password');
      }
    });

    it('should throw error for invalid password', async () => {
      try {
        await AuthService.login('testuser', 'invalidpassword');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Invalid username or password');
      }
    });
  });

  describe('register', () => {
    it('should create new user and return user info', async () => {
      const result = await AuthService.register('newuser', 'password123', 'New User', 'user', 1);
      expect(result).to.have.property('id');
      expect(result.username).to.equal('newuser');
      expect(result.name).to.equal('New User');
    });

    it('should throw error for existing username', async () => {
      try {
        await AuthService.register('testuser', 'password123', 'Test User', 'admin', 1);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Username already exists');
      }
    });
  });

  describe('getCurrentUser', () => {
    it('should return user info for valid user id', async () => {
      const result = await AuthService.getCurrentUser(1);
      expect(result.id).to.equal(1);
      expect(result.username).to.equal('testuser');
    });

    it('should throw error for invalid user id', async () => {
      try {
        await AuthService.getCurrentUser(999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });
  });
});