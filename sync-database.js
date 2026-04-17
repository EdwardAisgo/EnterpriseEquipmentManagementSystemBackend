const { sequelize } = require('./config/database');
const User = require('./models/User');
const Department = require('./models/Department');
const Device = require('./models/Device');
const Maintenance = require('./models/Maintenance');
const MaintenancePlan = require('./models/MaintenancePlan');
const RepairOrder = require('./models/RepairOrder');
const RunningData = require('./models/RunningData');
const Role = require('./models/Role');
const Menu = require('./models/Menu');
const OperationLog = require('./models/OperationLog');
const bcrypt = require('bcryptjs');

// 同步数据库表结构
async function syncDatabase() {
  try {
    console.log('Starting database sync...');
    
    // 同步所有模型
    await sequelize.sync({ alter: true });

    await ensureDefaultMenus();
    const roles = await ensureDefaultRoles();
    await ensureDefaultAdmin(roles.adminRoleId);
    
    console.log('Database sync completed successfully!');
  } catch (error) {
    console.error('Error during database sync:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 执行同步操作
syncDatabase();

async function ensureDefaultMenus() {
  const count = await Menu.count();
  if (count > 0) {
    await Menu.destroy({ where: { id: ['admin', 'admin_subpage'] } });
    return;
  }

  const defaults = [
    { id: 'analytics', parentId: null, name: '数据统计', path: '/analytics', icon: 'barChart', sort: 10 },
    { id: 'analytics_overview', parentId: 'analytics', name: '统计概览', path: '/analytics/overview', icon: 'pieChart', sort: 11 },
    { id: 'equipment', parentId: null, name: '设备台账', path: '/equipment', icon: 'tool', sort: 20 },
    { id: 'equipment_list', parentId: 'equipment', name: '设备列表', path: '/equipment/list', icon: 'unorderedList', sort: 21 },
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
  await Promise.all(defaults.map((m) => Menu.upsert(m)));
}

async function ensureDefaultRoles() {
  const allMenuIds = (await Menu.findAll({ attributes: ['id'] })).map((m) => m.id);
  const validMenuIdSet = new Set(allMenuIds.map(String));

  const cleanPermissions = async (role) => {
    const permissions = Array.isArray(role.permissions) ? role.permissions : [];
    const cleaned = permissions
      .map(String)
      .filter((p) => validMenuIdSet.has(p) && p !== 'admin' && p !== 'admin_subpage');
    const deduped = Array.from(new Set(cleaned));
    if (JSON.stringify(permissions.map(String)) !== JSON.stringify(deduped)) {
      await role.update({ permissions: deduped });
    }
  };

  const [adminRole] = await Role.findOrCreate({
    where: { name: 'admin' },
    defaults: {
      description: '管理员',
      permissions: allMenuIds,
    },
  });
  await cleanPermissions(adminRole);
  if (Array.isArray(adminRole.permissions) && adminRole.permissions.length === 0) {
    await adminRole.update({ permissions: allMenuIds.map(String) });
  }

  const [managerRole] = await Role.findOrCreate({
    where: { name: 'manager' },
    defaults: {
      description: '经理',
      permissions: ['analytics', 'analytics_overview', 'equipment', 'equipment_list', 'monitoring', 'maintenance', 'maintenance_plans', 'maintenance_records', 'repair', 'repair_orders'],
    },
  });
  await cleanPermissions(managerRole);

  const [staffRole] = await Role.findOrCreate({
    where: { name: 'staff' },
    defaults: {
      description: '员工',
      permissions: ['equipment', 'equipment_list', 'maintenance', 'maintenance_plans', 'maintenance_records', 'repair', 'repair_orders', 'monitoring'],
    },
  });
  await cleanPermissions(staffRole);

  return { adminRoleId: adminRole.id };
}

async function ensureDefaultAdmin(adminRoleId) {
  const existingAdmin = await User.findOne({ where: { username: 'admin' } });
  if (existingAdmin) {
    if (adminRoleId && !existingAdmin.roleId) {
      await existingAdmin.update({ roleId: adminRoleId });
    }
    return;
  }
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    username: 'admin',
    password: hashedPassword,
    name: 'Administrator',
    email: 'admin@example.com',
    roleId: adminRoleId || null,
  });
}
