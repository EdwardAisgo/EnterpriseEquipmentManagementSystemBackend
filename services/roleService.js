const { Role } = require('../models');
const logger = require('../utils/logger');

class RoleService {
  static async getAllRoles() {
    try {
      const roles = await Role.findAll({
        order: [['createdAt', 'DESC']]
      });
      return roles;
    } catch (error) {
      logger.error(`Get roles error: ${error.message}`);
      throw error;
    }
  }

  static async createRole(roleData) {
    try {
      const role = await Role.create(roleData);
      return role;
    } catch (error) {
      logger.error(`Create role error: ${error.message}`);
      throw error;
    }
  }

  static async updateRole(id, roleData) {
    try {
      const role = await Role.findByPk(id);
      if (!role) throw new Error('Role not found');
      await role.update(roleData);
      return role;
    } catch (error) {
      logger.error(`Update role error: ${error.message}`);
      throw error;
    }
  }

  static async deleteRole(id) {
    try {
      const role = await Role.findByPk(id);
      if (!role) throw new Error('Role not found');
      await role.destroy();
      return { success: true };
    } catch (error) {
      logger.error(`Delete role error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = RoleService;
