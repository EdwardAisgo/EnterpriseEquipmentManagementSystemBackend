const User = require('./User');
const Department = require('./Department');
const Device = require('./Device');
const Maintenance = require('./Maintenance');
const MaintenancePlan = require('./MaintenancePlan');
const RepairOrder = require('./RepairOrder');
const RunningData = require('./RunningData');

// 模型关联
Department.hasMany(User, { foreignKey: 'departmentId' });
User.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Device, { foreignKey: 'departmentId' });
Device.belongsTo(Department, { foreignKey: 'departmentId' });

Device.hasMany(Maintenance, { foreignKey: 'deviceId' });
Maintenance.belongsTo(Device, { foreignKey: 'deviceId' });

Device.hasMany(MaintenancePlan, { foreignKey: 'deviceId' });
MaintenancePlan.belongsTo(Device, { foreignKey: 'deviceId' });

Device.hasMany(RepairOrder, { foreignKey: 'equipmentId' });
RepairOrder.belongsTo(Device, { foreignKey: 'equipmentId' });

Device.hasMany(RunningData, { foreignKey: 'equipmentId' });
RunningData.belongsTo(Device, { foreignKey: 'equipmentId' });

module.exports = {
  User,
  Department,
  Device,
  Maintenance,
  MaintenancePlan,
  RepairOrder,
  RunningData
};