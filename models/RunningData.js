const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RunningData = sequelize.define('RunningData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Devices',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  runningHours: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  production: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  energyConsumption: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  operator: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'RunningData'
});

module.exports = RunningData;