const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenancePlan = sequelize.define('MaintenancePlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  deviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Devices',
      key: 'id'
    }
  },
  maintenanceType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  cycle: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cycleUnit: {
    type: DataTypes.ENUM('day', 'week', 'month', 'year'),
    allowNull: false
  },
  lastMaintenance: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextMaintenance: {
    type: DataTypes.DATE,
    allowNull: false
  },
  responsiblePerson: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  alert: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'MaintenancePlans'
});

module.exports = MaintenancePlan;