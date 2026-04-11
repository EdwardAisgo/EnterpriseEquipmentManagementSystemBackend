const { Department } = require('../models');
const logger = require('../utils/logger');

class DepartmentService {
  // 获取所有部门
  static async getAllDepartments() {
    try {
      const departments = await Department.findAll({
        order: [['name', 'ASC']]
      });
      logger.info(`Get all departments successful: ${departments.length} departments found`);
      return departments;
    } catch (error) {
      logger.error(`Get all departments error: ${error.message}`);
      throw error;
    }
  }

  // 根据ID获取部门
  static async getDepartmentById(id) {
    try {
      const department = await Department.findByPk(id);
      if (!department) {
        logger.warn(`Get department by id failed: Department ${id} not found`);
        throw new Error('Department not found');
      }
      logger.info(`Get department by id successful: Department ${id}`);
      return department;
    } catch (error) {
      logger.error(`Get department by id error: ${error.message}`);
      throw error;
    }
  }

  // 创建部门
  static async createDepartment(departmentData) {
    try {
      const department = await Department.create(departmentData);
      logger.info(`Create department successful: Department ${department.id}`);
      return department;
    } catch (error) {
      logger.error(`Create department error: ${error.message}`);
      throw error;
    }
  }

  // 更新部门
  static async updateDepartment(id, departmentData) {
    try {
      const department = await Department.findByPk(id);
      if (!department) {
        logger.warn(`Update department failed: Department ${id} not found`);
        throw new Error('Department not found');
      }
      await department.update(departmentData);
      logger.info(`Update department successful: Department ${id}`);
      return department;
    } catch (error) {
      logger.error(`Update department error: ${error.message}`);
      throw error;
    }
  }

  // 删除部门
  static async deleteDepartment(id) {
    try {
      const department = await Department.findByPk(id);
      if (!department) {
        logger.warn(`Delete department failed: Department ${id} not found`);
        throw new Error('Department not found');
      }
      
      // 检查是否有用户或设备关联到该部门
      const { User, Device } = require('../models');
      const userCount = await User.count({ where: { departmentId: id } });
      const deviceCount = await Device.count({ where: { departmentId: id } });
      
      if (userCount > 0 || deviceCount > 0) {
        throw new Error('Cannot delete department with associated users or devices');
      }
      
      await department.destroy();
      logger.info(`Delete department successful: Department ${id}`);
      return { message: 'Department deleted successfully' };
    } catch (error) {
      logger.error(`Delete department error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = DepartmentService;
