const { Menu, User, Role } = require('../models');
const logger = require('../utils/logger');

const DEFAULT_MENUS = [
  { id: 'analytics', parentId: null, name: '数据统计', path: '/analytics', icon: 'barChart', sort: 10 },
  { id: 'analytics_overview', parentId: 'analytics', name: '统计概览', path: '/analytics/overview', icon: 'pieChart', sort: 11 },

  { id: 'equipment', parentId: null, name: '设备台账', path: '/equipment', icon: 'tool', sort: 20 },
  { id: 'equipment_list', parentId: 'equipment', name: '设备列表', path: '/equipment/list', icon: 'unorderedList', sort: 21 },
  { id: 'equipment_device_types', parentId: 'equipment', name: '设备类型', path: '/equipment/device-types', icon: 'tags', sort: 22 },

  { id: 'monitoring', parentId: null, name: '运行监控', path: '/monitoring', icon: 'dashboard', sort: 30 },

  { id: 'maintenance', parentId: null, name: '维护保养', path: '/maintenance', icon: 'build', sort: 40 },
  { id: 'maintenance_plans', parentId: 'maintenance', name: '维护计划', path: '/maintenance/plans', icon: 'calendar', sort: 41 },
  { id: 'maintenance_records', parentId: 'maintenance', name: '保养记录', path: '/maintenance/records', icon: 'history', sort: 42 },

  { id: 'repair', parentId: null, name: '故障维修', path: '/repair', icon: 'warning', sort: 50 },
  { id: 'repair_orders', parentId: 'repair', name: '维修工单', path: '/repair/orders', icon: 'fileText', sort: 51 },

  { id: 'system', parentId: null, name: '系统管理', path: '/system', icon: 'setting', sort: 60 },
  { id: 'system_users', parentId: 'system', name: '用户管理', path: '/system/users', icon: 'user', sort: 61 },
  { id: 'system_departments', parentId: 'system', name: '部门管理', path: '/system/departments', icon: 'team', sort: 62 },
  { id: 'system_roles', parentId: 'system', name: '角色管理', path: '/system/roles', icon: 'lock', sort: 63 },
  { id: 'system_logs', parentId: 'system', name: '日志管理', path: '/system/logs', icon: 'profile', sort: 64 },
  { id: 'system_backup', parentId: 'system', name: '数据备份', path: '/system/backup', icon: 'database', sort: 65 },
];

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

function buildTreeFromFlat(flatMenus) {
  const nodesById = new Map();
  const roots = [];

  flatMenus.forEach((m) => {
    nodesById.set(m.id, {
      id: m.id,
      name: m.name,
      path: m.path,
      icon: m.icon,
      hideInMenu: !!m.hideInMenu,
      parentId: m.parentId,
      sort: m.sort,
      children: [],
    });
  });

  nodesById.forEach((node) => {
    if (node.parentId && nodesById.has(node.parentId)) {
      nodesById.get(node.parentId).children.push(node);
      return;
    }
    roots.push(node);
  });

  const sortTree = (arr) => {
    arr.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    arr.forEach((n) => sortTree(n.children || []));
  };

  sortTree(roots);
  return roots;
}

function flattenTree(tree) {
  const out = [];
  const walk = (nodes) => {
    (nodes || []).forEach((n) => {
      out.push(n);
      walk(n.children);
    });
  };
  walk(tree);
  return out;
}

class MenuService {
  static async ensureDefaultMenus() {
    const count = await Menu.count();
    if (count > 0) {
      await Menu.destroy({ where: { id: ['admin', 'admin_subpage'] } });
      return;
    }

    await Promise.all(
      DEFAULT_MENUS.map((m) =>
        Menu.upsert({
          id: m.id,
          parentId: m.parentId,
          name: m.name,
          path: m.path,
          icon: m.icon,
          sort: m.sort,
          hideInMenu: !!m.hideInMenu,
        }),
      ),
    );
    logger.info(`Init default menus successful: ${DEFAULT_MENUS.length} menus`);
  }

  static async getAllMenuTree() {
    await MenuService.ensureDefaultMenus();
    const menus = await Menu.findAll({ order: [['sort', 'ASC'], ['id', 'ASC']] });
    return buildTreeFromFlat(menus.map((m) => m.get({ plain: true })));
  }

  static async getMenuTreeForUser(userId) {
    await MenuService.ensureDefaultMenus();

    const user = await User.findByPk(userId, { include: [{ model: Role }] });
    if (!user) throw new Error('User not found');

    const role = user.Role;
    const isAdmin =
      user.username === 'admin' ||
      (role && (role.name === 'admin' || role.name === '系统管理员'));
    const permissions = normalizeRolePermissions(role ? role.permissions : []);
    if (role && Array.isArray(role.permissions) && permissions.length && role.permissions.some((p) => LEGACY_PERMISSION_MAP[String(p)])) {
      await role.update({ permissions });
    }

    const fullTree = await MenuService.getAllMenuTree();
    if (isAdmin) return fullTree;

    const fullFlat = flattenTree(fullTree);
    const byId = new Map(fullFlat.map((m) => [m.id, m]));

    const allowed = new Set(Array.isArray(permissions) ? permissions : []);
    const addAncestors = (menuId) => {
      let current = byId.get(menuId);
      while (current && current.parentId) {
        if (!allowed.has(current.parentId)) allowed.add(current.parentId);
        current = byId.get(current.parentId);
      }
    };
    Array.from(allowed).forEach((id) => addAncestors(id));

    const prune = (nodes) =>
      (nodes || [])
        .filter((n) => allowed.has(n.id) && !n.hideInMenu)
        .map((n) => ({ ...n, children: prune(n.children) }));

    return prune(fullTree);
  }

  static async getMenuTreeForRole(roleId) {
    await MenuService.ensureDefaultMenus();
    const role = await Role.findByPk(roleId);
    if (!role) throw new Error('Role not found');
    const isAdmin = role.name === 'admin' || role.name === '系统管理员';
    if (isAdmin) return MenuService.getAllMenuTree();

    const permissions = normalizeRolePermissions(role.permissions);
    if (Array.isArray(role.permissions) && permissions.length && role.permissions.some((p) => LEGACY_PERMISSION_MAP[String(p)])) {
      await role.update({ permissions });
    }
    const fullTree = await MenuService.getAllMenuTree();
    const fullFlat = flattenTree(fullTree);
    const byId = new Map(fullFlat.map((m) => [m.id, m]));
    const allowed = new Set(Array.isArray(permissions) ? permissions : []);

    const addAncestors = (menuId) => {
      let current = byId.get(menuId);
      while (current && current.parentId) {
        if (!allowed.has(current.parentId)) allowed.add(current.parentId);
        current = byId.get(current.parentId);
      }
    };
    Array.from(allowed).forEach((id) => addAncestors(id));

    const prune = (nodes) =>
      (nodes || [])
        .filter((n) => allowed.has(n.id) && !n.hideInMenu)
        .map((n) => ({ ...n, children: prune(n.children) }));

    return prune(fullTree);
  }

  static async initMenusFromClient(menus) {
    if (!Array.isArray(menus)) throw new Error('Invalid menus');

    const cleaned = menus
      .filter((m) => m && m.id && m.name && m.path)
      .map((m) => ({
        id: String(m.id),
        parentId: m.parentId ? String(m.parentId) : null,
        name: String(m.name),
        path: String(m.path),
        icon: m.icon ? String(m.icon) : null,
        sort: Number.isFinite(Number(m.sort)) ? Number(m.sort) : 0,
        hideInMenu: !!m.hideInMenu,
      }));

    await Promise.all(cleaned.map((m) => Menu.upsert(m)));
    logger.info(`Sync menus successful: ${cleaned.length} menus`);
    return { success: true, count: cleaned.length };
  }
}

module.exports = MenuService;
