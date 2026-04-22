const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

// 引入所有模型
const User = require('../models/User');
const Role = require('../models/Role');
const Department = require('../models/Department');
const Device = require('../models/Device');
const DeviceType = require('../models/DeviceType');
const Maintenance = require('../models/Maintenance');
const MaintenancePlan = require('../models/MaintenancePlan');
const RepairOrder = require('../models/RepairOrder');
const RunningData = require('../models/RunningData');
const Menu = require('../models/Menu');

async function seedAllData() {
  const t = await sequelize.transaction();
  try {
    console.log('开始初始化数据...');

    // ========== 1. 确保基础数据存在（角色、菜单） ==========
    const adminRole = await Role.findOne({ where: { name: 'admin' }, transaction: t });
    const managerRole = await Role.findOne({ where: { name: 'manager' }, transaction: t });
    const staffRole = await Role.findOne({ where: { name: 'staff' }, transaction: t });

    const allMenus = await Menu.findAll({ attributes: ['id'], transaction: t });
    const allMenuIds = allMenus.map(m => m.id);

    if (!adminRole) {
      await Role.create({ name: 'admin', description: '管理员', permissions: allMenuIds }, { transaction: t });
    }
    if (!managerRole) {
      await Role.create({
        name: 'manager',
        description: '经理',
        permissions: ['analytics', 'analytics_overview', 'equipment', 'equipment_list', 'monitoring', 'maintenance', 'maintenance_plans', 'maintenance_records', 'repair', 'repair_orders']
      }, { transaction: t });
    }
    if (!staffRole) {
      await Role.create({
        name: 'staff',
        description: '员工',
        permissions: ['equipment', 'equipment_list', 'maintenance', 'maintenance_plans', 'maintenance_records', 'repair', 'repair_orders', 'monitoring']
      }, { transaction: t });
    }

    // ========== 2. 部门 ==========
    console.log('  创建部门...');
    const departments = await Department.bulkCreate([
      { name: '生产车间', description: '负责产品加工与制造' },
      { name: '质检部', description: '负责产品质量检测与控制' },
      { name: '设备管理部', description: '负责设备维护与资产管理' },
      { name: '仓储物流部', description: '负责原材料与成品仓储管理' }
    ], { transaction: t, ignoreDuplicates: true });

    const deptMap = {};
    (await Department.findAll({ transaction: t })).forEach(d => { deptMap[d.name] = d.id; });

    // ========== 3. 用户 ==========
    console.log('  创建用户...');
    const roles = await Role.findAll({ transaction: t });
    const roleMap = {};
    roles.forEach(r => { roleMap[r.name] = r.id; });

    const usersData = [
      { username: 'zhangsan', password: await bcrypt.hash('zhangsan123', 10), email: 'zhangsan@company.com', name: '张三', roleId: roleMap['manager'], departmentId: deptMap['生产车间'] },
      { username: 'lisi', password: await bcrypt.hash('lisi123', 10), email: 'lisi@company.com', name: '李四', roleId: roleMap['staff'], departmentId: deptMap['生产车间'] },
      { username: 'wangwu', password: await bcrypt.hash('wangwu123', 10), email: 'wangwu@company.com', name: '王五', roleId: roleMap['staff'], departmentId: deptMap['质检部'] },
      { username: 'zhaoliu', password: await bcrypt.hash('zhaoliu123', 10), email: 'zhaoliu@company.com', name: '赵六', roleId: roleMap['staff'], departmentId: deptMap['设备管理部'] }
    ];

    for (const u of usersData) {
      const [user, created] = await User.findOrCreate({
        where: { username: u.username },
        defaults: u,
        transaction: t
      });
      if (!created && !user.roleId) {
        await user.update({ roleId: u.roleId, departmentId: u.departmentId }, { transaction: t });
      }
    }

    // ========== 4. 设备类型 ==========
    console.log('  创建设备类型...');
    const deviceTypesData = [
      { name: '生产设备', description: '直接用于产品制造的设备' },
      { name: '包装设备', description: '用于产品包装的设备' },
      { name: '加工设备', description: '用于零部件加工的设备' },
      { name: '检测设备', description: '用于质量检测的设备' },
      { name: '物流设备', description: '用于仓储物流的设备' },
      { name: '辅助设备', description: '为生产提供辅助支持的设备' }
    ];

    for (const dt of deviceTypesData) {
      await DeviceType.findOrCreate({ where: { name: dt.name }, defaults: dt, transaction: t });
    }

    const deviceTypeMap = {};
    (await DeviceType.findAll({ transaction: t })).forEach(dt => { deviceTypeMap[dt.name] = dt.id; });

    // ========== 5. 设备 ==========
    console.log('  创建设备...');
    const devicesData = [
      { deviceCode: 'EQ001', name: '注塑机-01', type: '生产设备', deviceTypeId: deviceTypeMap['生产设备'], model: 'HTF-200X', specification: '锁模力2000KN，射胶量500g', status: 'normal', departmentId: deptMap['生产车间'], location: 'A车间-01号位', purchaseDate: '2022-03-15', purchasePrice: 285000.00, supplier: '海天塑机', warrantyEndDate: '2025-03-15' },
      { deviceCode: 'EQ002', name: '注塑机-02', type: '生产设备', deviceTypeId: deviceTypeMap['生产设备'], model: 'HTF-200X', specification: '锁模力2000KN，射胶量500g', status: 'normal', departmentId: deptMap['生产车间'], location: 'A车间-02号位', purchaseDate: '2022-03-15', purchasePrice: 285000.00, supplier: '海天塑机', warrantyEndDate: '2025-03-15' },
      { deviceCode: 'EQ003', name: '自动包装机', type: '包装设备', deviceTypeId: deviceTypeMap['包装设备'], model: 'ZB-800A', specification: '包装速度40包/分钟，袋宽100-300mm', status: 'normal', departmentId: deptMap['生产车间'], location: 'A车间-包装线', purchaseDate: '2021-08-20', purchasePrice: 128000.00, supplier: '松川机械', warrantyEndDate: '2024-08-20' },
      { deviceCode: 'EQ004', name: '数控机床', type: '加工设备', deviceTypeId: deviceTypeMap['加工设备'], model: 'VMC-850L', specification: '行程800×500×500mm，主轴转速12000rpm', status: 'normal', departmentId: deptMap['生产车间'], location: 'B车间-精加工区', purchaseDate: '2023-01-10', purchasePrice: 360000.00, supplier: '沈阳机床', warrantyEndDate: '2026-01-10' },
      { deviceCode: 'EQ005', name: '激光切割机', type: '加工设备', deviceTypeId: deviceTypeMap['加工设备'], model: 'LF-3015', specification: '切割范围3000×1500mm，激光功率3000W', status: 'normal', departmentId: deptMap['生产车间'], location: 'B车间-下料区', purchaseDate: '2020-05-08', purchasePrice: 450000.00, supplier: '大族激光', warrantyEndDate: '2023-05-08' },
      { deviceCode: 'EQ006', name: '三坐标测量仪', type: '检测设备', deviceTypeId: deviceTypeMap['检测设备'], model: 'CMM-8106', specification: '测量范围800×1000×600mm，精度1.9μm', status: 'normal', departmentId: deptMap['质检部'], location: '质检室-恒温区', purchaseDate: '2022-11-01', purchasePrice: 520000.00, supplier: '海克斯康', warrantyEndDate: '2025-11-01' },
      { deviceCode: 'EQ007', name: '电动叉车', type: '物流设备', deviceTypeId: deviceTypeMap['物流设备'], model: 'CPD-30', specification: '额定载重3吨，起升高度3米', status: 'normal', departmentId: deptMap['仓储物流部'], location: '仓库-装卸区', purchaseDate: '2023-06-12', purchasePrice: 86000.00, supplier: '杭叉集团', warrantyEndDate: '2026-06-12' },
      { deviceCode: 'EQ008', name: '螺杆空压机', type: '辅助设备', deviceTypeId: deviceTypeMap['辅助设备'], model: 'GA-55+', specification: '排气量9.5m³/min，工作压力0.8MPa', status: 'normal', departmentId: deptMap['设备管理部'], location: '动力站房', purchaseDate: '2021-12-20', purchasePrice: 95000.00, supplier: '阿特拉斯·科普柯', warrantyEndDate: '2024-12-20' }
    ];

    for (const d of devicesData) {
      await Device.findOrCreate({ where: { deviceCode: d.deviceCode }, defaults: d, transaction: t });
    }

    const deviceMap = {};
    (await Device.findAll({ transaction: t })).forEach(d => { deviceMap[d.deviceCode] = d.id; });

    // ========== 5. 维护计划 ==========
    console.log('  创建维护计划...');
    const now = new Date();
    const fmt = (d) => d.toISOString().slice(0, 10);
    const nextMonth = new Date(now); nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextWeek = new Date(now); nextWeek.setDate(nextWeek.getDate() + 7);
    const nextQuarter = new Date(now); nextQuarter.setMonth(nextQuarter.getMonth() + 3);
    const nextYear = new Date(now); nextYear.setFullYear(nextYear.getFullYear() + 1);

    const plansData = [
      { deviceId: deviceMap['EQ001'], maintenanceType: '日常维护', cycle: 1, cycleUnit: 'month', nextMaintenance: fmt(nextMonth), responsiblePerson: '张三' },
      { deviceId: deviceMap['EQ002'], maintenanceType: '日常维护', cycle: 1, cycleUnit: 'month', nextMaintenance: fmt(nextMonth), responsiblePerson: '李四' },
      { deviceId: deviceMap['EQ003'], maintenanceType: '定期维护', cycle: 3, cycleUnit: 'month', nextMaintenance: fmt(nextQuarter), responsiblePerson: '王五' },
      { deviceId: deviceMap['EQ004'], maintenanceType: '日常维护', cycle: 2, cycleUnit: 'week', nextMaintenance: fmt(nextWeek), responsiblePerson: '赵六' },
      { deviceId: deviceMap['EQ005'], maintenanceType: '定期维护', cycle: 6, cycleUnit: 'month', nextMaintenance: fmt(nextQuarter), responsiblePerson: '张三' },
      { deviceId: deviceMap['EQ006'], maintenanceType: '精度校准', cycle: 1, cycleUnit: 'year', nextMaintenance: fmt(nextYear), responsiblePerson: '王五' },
      { deviceId: deviceMap['EQ008'], maintenanceType: '日常维护', cycle: 1, cycleUnit: 'month', nextMaintenance: fmt(nextMonth), responsiblePerson: '赵六' }
    ];

    await MaintenancePlan.bulkCreate(plansData, { transaction: t, ignoreDuplicates: true });

    // ========== 6. 维护记录 ==========
    console.log('  创建维护记录...');
    const maintData = [
      { deviceId: deviceMap['EQ001'], maintenanceType: 'preventive', description: '更换液压油、检查管路密封性、清洁散热系统', startDate: '2025-03-15', endDate: '2025-03-15', status: 'completed', technician: '张三', cost: 520.00, notes: '液压油型号：46#抗磨液压油' },
      { deviceId: deviceMap['EQ001'], maintenanceType: 'preventive', description: '检查电气控制系统、紧固接线端子、校准温控模块', startDate: '2025-04-10', endDate: '2025-04-10', status: 'completed', technician: '张三', cost: 320.00, notes: '' },
      { deviceId: deviceMap['EQ002'], maintenanceType: 'preventive', description: '清洁设备表面及料斗、检查安全门联锁装置', startDate: '2025-03-20', endDate: '2025-03-20', status: 'completed', technician: '李四', cost: 180.00, notes: '' },
      { deviceId: deviceMap['EQ003'], maintenanceType: 'corrective', description: '调整传送带张紧度、更换磨损导向轮、校准光电传感器', startDate: '2025-04-01', endDate: '2025-04-02', status: 'completed', technician: '王五', cost: 850.00, notes: '导向轮型号：ZB-800-Roller-02' },
      { deviceId: deviceMap['EQ004'], maintenanceType: 'preventive', description: '导轨润滑保养、检查丝杠间隙、清洁排屑器', startDate: '2025-04-05', endDate: null, status: 'in_progress', technician: '赵六', cost: 420.00, notes: '预计4月8日完成' },
      { deviceId: deviceMap['EQ005'], maintenanceType: 'corrective', description: '更换切割头陶瓷体、清洁切割喷嘴、校准光路同轴度', startDate: '2025-03-25', endDate: '2025-03-26', status: 'completed', technician: '张三', cost: 1280.00, notes: '切割头型号：RayTools-BM110' },
      { deviceId: deviceMap['EQ006'], maintenanceType: 'preventive', description: '校准测量基准、清洁气浮导轨、检查测头灵敏度', startDate: '2025-02-10', endDate: '2025-02-11', status: 'completed', technician: '王五', cost: 650.00, notes: '使用标准球进行校准验证' },
      { deviceId: deviceMap['EQ008'], maintenanceType: 'predictive', description: '更换空气滤芯、油滤芯、检查主机轴承振动值', startDate: '2025-04-12', endDate: null, status: 'scheduled', technician: '赵六', cost: 380.00, notes: '待备件到货后实施' }
    ];

    await Maintenance.bulkCreate(maintData, { transaction: t, ignoreDuplicates: true });

    // ========== 7. 维修工单 ==========
    console.log('  创建维修工单...');
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

    const generateOrderId = (deviceId, seq) => {
      const deviceIdStr = String(deviceId).padStart(4, '0');
      const randomStr = String(seq).padStart(4, '0');
      return `WO${dateStr}${deviceIdStr}${randomStr}`;
    };

    const repairData = [
      {
        id: generateOrderId(deviceMap['EQ003'], 1),
        equipmentId: deviceMap['EQ003'],
        applicant: '李四',
        applyDate: '2025-04-14',
        faultDescription: '传送带运行过程中出现打滑现象，导致包装袋位置偏移，封口不整齐',
        status: 'pending',
        assignedTo: null,
        repairDate: null,
        repairContent: null,
        partsReplaced: null,
        repairCost: null,
        notes: '已停机待修'
      },
      {
        id: generateOrderId(deviceMap['EQ007'], 2),
        equipmentId: deviceMap['EQ007'],
        applicant: '赵六',
        applyDate: '2025-04-15',
        faultDescription: '液压升降系统故障，货叉无法正常举升，伴有异响',
        status: 'in_progress',
        assignedTo: '赵六',
        repairDate: '2025-04-16',
        repairContent: '更换液压泵密封圈、补充液压油至标准液位、排空气路',
        partsReplaced: '液压泵密封圈×2、46#液压油5L',
        repairCost: 680.00,
        notes: '维修中，预计今日完成'
      },
      {
        id: generateOrderId(deviceMap['EQ005'], 3),
        equipmentId: deviceMap['EQ005'],
        applicant: '张三',
        applyDate: '2025-04-10',
        faultDescription: '激光切割头磨损严重，切割面出现毛刺和挂渣，影响加工精度',
        status: 'completed',
        assignedTo: '张三',
        repairDate: '2025-04-11',
        repairContent: '更换切割头组件、重新校准焦点位置、测试切割质量',
        partsReplaced: 'RayTools切割头总成×1、陶瓷体×3、喷嘴×5',
        repairCost: 3200.00,
        notes: '切割质量已恢复正常'
      }
    ];

    await RepairOrder.bulkCreate(repairData, { transaction: t, ignoreDuplicates: true });

    // ========== 8. 运行数据 ==========
    console.log('  创建运行数据...');
    const runningData = [];
    const operators = ['张三', '李四', '王五', '赵六'];

    const generateRunningData = (equipmentId, baseDate, days, hoursRange, prodRange, energyRange) => {
      for (let i = 0; i < days; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        const hours = hoursRange[0] + Math.random() * (hoursRange[1] - hoursRange[0]);
        const production = prodRange[0] + Math.random() * (prodRange[1] - prodRange[0]);
        const energy = energyRange[0] + Math.random() * (energyRange[1] - energyRange[0]);
        runningData.push({
          equipmentId,
          date: date.toISOString().slice(0, 10),
          runningHours: parseFloat(hours.toFixed(2)),
          production: parseFloat(production.toFixed(2)),
          energyConsumption: parseFloat(energy.toFixed(2)),
          operator: operators[Math.floor(Math.random() * operators.length)],
          notes: i === 0 ? '今日运行正常' : ''
        });
      }
    };

    // 为各设备生成最近14天的运行数据
    generateRunningData(deviceMap['EQ001'], now, 14, [6, 10], [800, 1200], [150, 220]);
    generateRunningData(deviceMap['EQ002'], now, 14, [6, 10], [800, 1200], [150, 220]);
    generateRunningData(deviceMap['EQ003'], now, 10, [4, 8], [500, 800], [80, 140]);
    generateRunningData(deviceMap['EQ004'], now, 14, [7, 9], [200, 350], [60, 100]);
    generateRunningData(deviceMap['EQ005'], now, 12, [6, 8], [150, 280], [180, 260]);
    generateRunningData(deviceMap['EQ006'], now, 14, [3, 5], [50, 100], [20, 35]);
    generateRunningData(deviceMap['EQ007'], now, 10, [4, 7], [300, 500], [40, 70]);
    generateRunningData(deviceMap['EQ008'], now, 14, [12, 16], [0, 0], [80, 120]);

    await RunningData.bulkCreate(runningData, { transaction: t, ignoreDuplicates: true });

    // ========== 9. 更新设备最终状态及累计运行时长 ==========
    console.log('  更新设备状态...');
    const statusUpdates = [
      { deviceCode: 'EQ003', status: 'fault' },
      { deviceCode: 'EQ007', status: 'maintenance' },
      { deviceCode: 'EQ005', status: 'scrapped', scrapDate: '2025-04-12', scrapReason: '设备已过质保期，核心部件老化严重，维修成本过高，经评估决定报废处理' }
    ];

    for (const upd of statusUpdates) {
      const device = await Device.findByPk(deviceMap[upd.deviceCode], { transaction: t });
      if (device) {
        await device.update({
          status: upd.status,
          scrapDate: upd.scrapDate || device.scrapDate,
          scrapReason: upd.scrapReason || device.scrapReason
        }, { transaction: t });
      }
    }

    // 更新设备累计运行时长（根据运行数据汇总）
    for (const d of Object.values(deviceMap)) {
      const total = await RunningData.sum('runningHours', { where: { equipmentId: d }, transaction: t });
      if (total && total > 0) {
        await Device.update({ runningHours: total }, { where: { id: d }, transaction: t });
      }
    }

    await t.commit();
    console.log('\n数据初始化完成！');
    console.log('  部门: 4 个');
    console.log('  用户: 5 个（含admin）');
    console.log('  设备: 8 台');
    console.log('  维护计划: 7 个');
    console.log('  维护记录: 8 条');
    console.log('  维修工单: 3 条');
    console.log('  运行数据: ' + runningData.length + ' 条');
    console.log('\n管理员账号: admin / admin123');
    console.log('其他用户密码: 用户名+123  如 zhangsan / zhangsan123');
  } catch (error) {
    await t.rollback();
    console.error('初始化数据失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedAllData();
