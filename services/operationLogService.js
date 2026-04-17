const { OperationLog, User, Role } = require('../models');
const { Op } = require('sequelize');

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) {
    return xf.split(',')[0].trim();
  }
  return req.ip;
}

class OperationLogService {
  static async record(req, payload) {
    const userId = req.user?.id ?? null;
    const username = req.user?.username ?? null;
    let roleName = req.user?.role ?? null;
    let displayName = null;

    if (userId) {
      const user = await User.findByPk(userId, { include: [{ model: Role }] });
      if (!roleName) roleName = user?.Role?.name ?? null;
      displayName = user?.name ?? null;
    }

    const action = String(payload?.action ?? '');
    if (!action) return null;

    return OperationLog.create({
      userId,
      username,
      displayName,
      roleName,
      action,
      entityType: payload?.entityType ? String(payload.entityType) : null,
      entityId: payload?.entityId ? String(payload.entityId) : null,
      entityName: payload?.entityName ? String(payload.entityName) : null,
      details: payload?.details ?? {},
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] ? String(req.headers['user-agent']) : null,
    });
  }

  static async query(params = {}) {
    const current = Number(params.current || 1);
    const pageSize = Number(params.pageSize || 10);

    const where = {};
    if (params.username) where.username = { [Op.like]: `%${params.username}%` };
    if (params.displayName) where.displayName = { [Op.like]: `%${params.displayName}%` };
    if (params.action) where.action = { [Op.like]: `%${params.action}%` };
    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = String(params.entityId);

    if (params.startTime || params.endTime) {
      where.createdAt = {};
      if (params.startTime) where.createdAt[Op.gte] = new Date(params.startTime);
      if (params.endTime) where.createdAt[Op.lte] = new Date(params.endTime);
    }

    const offset = (current - 1) * pageSize;
    const { rows, count } = await OperationLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
      limit: pageSize,
      offset,
    });

    const plainRows = rows.map((r) => r.get({ plain: true }));
    const userIds = Array.from(
      new Set(plainRows.map((r) => r.userId).filter((id) => id !== null && id !== undefined)),
    );
    let userNameMap = new Map();
    if (userIds.length) {
      const users = await User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ['id', 'name'],
      });
      userNameMap = new Map(users.map((u) => [u.id, u.name]));
    }

    const data = plainRows.map((r) => {
      const nameFromUser = r.userId ? userNameMap.get(r.userId) : null;
      const displayName = nameFromUser || r.displayName || null;
      return {
        ...r,
        displayName,
        name: displayName,
      };
    });

    return {
      data,
      total: count,
      success: true,
      current,
      pageSize,
    };
  }
}

module.exports = OperationLogService;
