const { sequelize } = require('../config/database');
const { OperationLog, User, Role, Device, RepairOrder } = require('../models');

function subtractMinutes(date, minutes) {
  return new Date(date.getTime() - minutes * 60 * 1000);
}

async function main() {
  await sequelize.authenticate();

  const adminUser = await User.findOne({ where: { username: 'admin' }, include: [{ model: Role }] });
  const anyUser = await User.findOne({ include: [{ model: Role }], order: [['id', 'DESC']] });
  const device = await Device.findOne({ order: [['id', 'ASC']] });
  const order = await RepairOrder.findOne({ order: [['createdAt', 'DESC']] });

  const now = new Date();
  const baseUser = adminUser || anyUser;
  const username = baseUser?.username || 'admin';
  const displayName = baseUser?.name || '管理员';
  const roleName = baseUser?.Role?.name || baseUser?.getDataValue?.('role') || '系统管理员';
  const userId = baseUser?.id || null;

  const logs = [
    {
      userId,
      username,
      displayName,
      roleName,
      action: '登录',
      entityType: 'auth',
      entityId: username,
      entityName: '系统登录',
      details: { result: 'success' },
      ip: '127.0.0.1',
      userAgent: 'seed-script',
      createdAt: subtractMinutes(now, 60),
      updatedAt: subtractMinutes(now, 60),
    },
    {
      userId,
      username,
      displayName,
      roleName,
      action: '查看设备列表',
      entityType: 'device',
      entityId: null,
      entityName: null,
      details: { page: 1, pageSize: 10 },
      ip: '127.0.0.1',
      userAgent: 'seed-script',
      createdAt: subtractMinutes(now, 42),
      updatedAt: subtractMinutes(now, 42),
    },
    {
      userId,
      username,
      displayName,
      roleName,
      action: '更新设备',
      entityType: 'device',
      entityId: device ? String(device.id) : null,
      entityName: device ? device.name || device.deviceCode : null,
      details: { changed: ['notes'] },
      ip: '127.0.0.1',
      userAgent: 'seed-script',
      createdAt: subtractMinutes(now, 25),
      updatedAt: subtractMinutes(now, 25),
    },
    {
      userId,
      username,
      displayName,
      roleName,
      action: '提交报修',
      entityType: 'repair_order',
      entityId: order ? String(order.id) : null,
      entityName: order ? String(order.id) : null,
      details: { equipmentId: order?.equipmentId ?? null },
      ip: '127.0.0.1',
      userAgent: 'seed-script',
      createdAt: subtractMinutes(now, 12),
      updatedAt: subtractMinutes(now, 12),
    },
    {
      userId,
      username,
      displayName,
      roleName,
      action: '创建备份',
      entityType: 'backup',
      entityId: `backup_seed_${now.toISOString().slice(0, 10)}`,
      entityName: '数据库备份',
      details: { method: 'manual' },
      ip: '127.0.0.1',
      userAgent: 'seed-script',
      createdAt: subtractMinutes(now, 5),
      updatedAt: subtractMinutes(now, 5),
    },
  ];

  const created = await OperationLog.bulkCreate(logs);
  console.log(`Seeded operation logs: ${created.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
