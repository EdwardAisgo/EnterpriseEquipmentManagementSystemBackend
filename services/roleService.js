const { Role } = require('../models');
const logger = require('../utils/logger');

const LEGACY_PERMISSION_MAP = {
  数据统计: ['analytics', 'analytics_overview'],
  统计报表: ['analytics', 'analytics_overview'],
  设备管理: ['equipment', 'equipment_list'],
  运行监控: ['monitoring'],
  维护保养: ['maintenance', 'maintenance_plans', 'maintenance_records'],
  故障维修: ['repair', 'repair_orders'],
  系统管理: [
    'system',
    'system_users',
    'system_departments',
    'system_roles',
    'system_logs',
    'system_backup',
  ],
  用户管理: ['system', 'system_users'],
  部门管理: ['system', 'system_departments'],
  角色管理: ['system', 'system_roles'],
  日志管理: ['system', 'system_logs'],
  数据备份: ['system', 'system_backup'],
};

function normalizeRolePermissions(permissions) {
  if (!Array.isArray(permissions)) return [];
  const mapped = [];
  permissions.forEach((p) => {
    const key = String(p);
    const hit = LEGACY_PERMISSION_MAP[key];
    if (hit) {
      mapped.push(...hit);
      return;
    }
    mapped.push(key);
  });
  return Array.from(new Set(mapped));
}

class RoleService {
  static async getAllRoles() {
    try {
      const roles = await Role.findAll({
        order: [['createdAt', 'DESC']]
      });
      await Promise.all(
        roles.map(async (role) => {
          const normalized = normalizeRolePermissions(role.permissions);
          if (Array.isArray(role.permissions) && role.permissions.some((p) => LEGACY_PERMISSION_MAP[String(p)])) {
            await role.update({ permissions: normalized });
          }
        }),
      );
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
