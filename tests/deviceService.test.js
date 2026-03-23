const chai = require('chai');
const expect = chai.expect;
const DeviceService = require('../services/deviceService');
const { Device, Department } = require('../models');

// 模拟数据
const mockDepartment = {
  id: 1,
  name: 'IT Department'
};

const mockDevices = [
  {
    id: 1,
    deviceCode: 'DEV001',
    name: 'Laptop',
    model: 'Dell XPS',
    status: 'active',
    departmentId: 1,
    Department: mockDepartment
  },
  {
    id: 2,
    deviceCode: 'DEV002',
    name: 'Desktop',
    model: 'HP ProDesk',
    status: 'maintenance',
    departmentId: 1,
    Department: mockDepartment
  }
];

describe('DeviceService', () => {
  beforeEach(() => {
    // 模拟Device.findAll
    Device.findAll = async (options) => {
      if (options.where && options.where.status) {
        return mockDevices.filter(device => device.status === options.where.status);
      }
      return mockDevices;
    };

    // 模拟Device.findByPk
    Device.findByPk = async (id, options) => {
      const device = mockDevices.find(device => device.id === id);
      if (device && options.include) {
        return { ...device, Department: mockDepartment };
      }
      return device;
    };

    // 模拟Device.create
    Device.create = async (deviceData) => {
      return {
        id: 3,
        ...deviceData,
        Department: mockDepartment
      };
    };

    // 模拟device.update
    const mockUpdate = async (deviceData) => {
      return {
        id: 1,
        ...deviceData,
        Department: mockDepartment
      };
    };

    // 模拟device.destroy
    const mockDestroy = async () => {
      return { message: 'Device deleted successfully' };
    };

    // 为每个设备添加update和destroy方法
    mockDevices.forEach(device => {
      device.update = mockUpdate;
      device.destroy = mockDestroy;
    });
  });

  describe('getDevices', () => {
    it('should return list of devices', async () => {
      const result = await DeviceService.getDevices();
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[0].name).to.equal('Laptop');
    });
  });

  describe('getDeviceById', () => {
    it('should return device by id', async () => {
      const result = await DeviceService.getDeviceById(1);
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('name', 'Laptop');
      expect(result).to.have.property('Department');
    });

    it('should throw error for invalid device id', async () => {
      try {
        await DeviceService.getDeviceById(999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Device not found');
      }
    });
  });

  describe('createDevice', () => {
    it('should create new device', async () => {
      const deviceData = {
        deviceCode: 'DEV003',
        name: 'Monitor',
        model: 'Dell 24inch',
        status: 'active',
        departmentId: 1
      };
      const result = await DeviceService.createDevice(deviceData);
      expect(result).to.have.property('id', 3);
      expect(result.name).to.equal('Monitor');
    });
  });

  describe('updateDevice', () => {
    it('should update device', async () => {
      const deviceData = {
        name: 'Updated Laptop',
        status: 'repair'
      };
      const result = await DeviceService.updateDevice(1, deviceData);
      expect(result).to.have.property('id', 1);
      expect(result.name).to.equal('Updated Laptop');
      expect(result.status).to.equal('repair');
    });

    it('should throw error for invalid device id', async () => {
      try {
        await DeviceService.updateDevice(999, { name: 'Updated Device' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Device not found');
      }
    });
  });

  describe('deleteDevice', () => {
    it('should delete device', async () => {
      const result = await DeviceService.deleteDevice(1);
      expect(result).to.have.property('message', 'Device deleted successfully');
    });

    it('should throw error for invalid device id', async () => {
      try {
        await DeviceService.deleteDevice(999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Device not found');
      }
    });
  });

  describe('getDevicesByStatus', () => {
    it('should return devices by status', async () => {
      const result = await DeviceService.getDevicesByStatus('active');
      expect(result).to.be.an('array');
      expect(result.length).to.equal(1);
      expect(result[0].status).to.equal('active');
    });
  });
});