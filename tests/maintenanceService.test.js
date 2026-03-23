const chai = require('chai');
const expect = chai.expect;
const MaintenanceService = require('../services/maintenanceService');
const { Maintenance, Device } = require('../models');

// 模拟数据
const mockDevice = {
  id: 1,
  deviceCode: 'DEV001',
  name: 'Laptop',
  model: 'Dell XPS',
  status: 'active'
};

const mockMaintenances = [
  {
    id: 1,
    deviceId: 1,
    maintenanceType: 'preventive',
    status: 'completed',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-01-02'),
    cost: 100,
    description: 'Regular maintenance',
    Device: mockDevice
  },
  {
    id: 2,
    deviceId: 1,
    maintenanceType: 'corrective',
    status: 'in_progress',
    startDate: new Date('2023-02-01'),
    cost: 200,
    description: 'Repair',
    Device: mockDevice
  }
];

describe('MaintenanceService', () => {
  beforeEach(() => {
    // 模拟Maintenance.findAll
    Maintenance.findAll = async (options) => {
      if (options.where && options.where.deviceId) {
        return mockMaintenances.filter(maintenance => maintenance.deviceId === options.where.deviceId);
      }
      return mockMaintenances;
    };

    // 模拟Maintenance.findByPk
    Maintenance.findByPk = async (id, options) => {
      const maintenance = mockMaintenances.find(maintenance => maintenance.id === id);
      if (maintenance && options.include) {
        return { ...maintenance, Device: mockDevice };
      }
      return maintenance;
    };

    // 模拟Maintenance.create
    Maintenance.create = async (maintenanceData) => {
      return {
        id: 3,
        ...maintenanceData,
        Device: mockDevice
      };
    };

    // 模拟maintenance.update
    const mockUpdate = async (maintenanceData) => {
      return {
        id: 1,
        ...maintenanceData,
        Device: mockDevice
      };
    };

    // 模拟maintenance.destroy
    const mockDestroy = async () => {
      return { message: 'Maintenance record deleted successfully' };
    };

    // 为每个维护记录添加update和destroy方法
    mockMaintenances.forEach(maintenance => {
      maintenance.update = mockUpdate;
      maintenance.destroy = mockDestroy;
    });

    // 模拟Device.findByPk
    Device.findByPk = async (id) => {
      if (id === 1) {
        return {
          ...mockDevice,
          update: async (deviceData) => {
            return { ...mockDevice, ...deviceData };
          }
        };
      }
      return null;
    };
  });

  describe('getMaintenances', () => {
    it('should return list of maintenance records', async () => {
      const result = await MaintenanceService.getMaintenances();
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[0].maintenanceType).to.equal('preventive');
    });
  });

  describe('getMaintenanceById', () => {
    it('should return maintenance record by id', async () => {
      const result = await MaintenanceService.getMaintenanceById(1);
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('maintenanceType', 'preventive');
      expect(result).to.have.property('Device');
    });

    it('should throw error for invalid maintenance id', async () => {
      try {
        await MaintenanceService.getMaintenanceById(999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Maintenance record not found');
      }
    });
  });

  describe('createMaintenance', () => {
    it('should create new maintenance record', async () => {
      const maintenanceData = {
        deviceId: 1,
        maintenanceType: 'preventive',
        status: 'scheduled',
        startDate: new Date('2023-03-01'),
        description: 'Scheduled maintenance'
      };
      const result = await MaintenanceService.createMaintenance(maintenanceData);
      expect(result).to.have.property('id', 3);
      expect(result.maintenanceType).to.equal('preventive');
    });
  });

  describe('updateMaintenance', () => {
    it('should update maintenance record', async () => {
      const maintenanceData = {
        status: 'completed',
        endDate: new Date('2023-02-02')
      };
      const result = await MaintenanceService.updateMaintenance(2, maintenanceData);
      expect(result).to.have.property('id', 1);
      expect(result.status).to.equal('completed');
    });

    it('should throw error for invalid maintenance id', async () => {
      try {
        await MaintenanceService.updateMaintenance(999, { status: 'completed' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Maintenance record not found');
      }
    });
  });

  describe('deleteMaintenance', () => {
    it('should delete maintenance record', async () => {
      const result = await MaintenanceService.deleteMaintenance(1);
      expect(result).to.have.property('message', 'Maintenance record deleted successfully');
    });

    it('should throw error for invalid maintenance id', async () => {
      try {
        await MaintenanceService.deleteMaintenance(999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Maintenance record not found');
      }
    });
  });

  describe('getMaintenancesByDeviceId', () => {
    it('should return maintenance records by device id', async () => {
      const result = await MaintenanceService.getMaintenancesByDeviceId(1);
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[0].deviceId).to.equal(1);
    });
  });
});