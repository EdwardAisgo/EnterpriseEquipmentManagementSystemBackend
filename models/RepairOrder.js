const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RepairOrder = sequelize.define('RepairOrder', {
  id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    allowNull: false
  },
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Devices',
      key: 'id'
    }
  },
  applicant: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  applyDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  faultDescription: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'completed'),
    defaultValue: 'pending'
  },
  assignedTo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  repairDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  repairContent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  partsReplaced: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  repairCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
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
  tableName: 'RepairOrders'
});

module.exports = RepairOrder;