const chai = require('chai');
const expect = chai.expect;
const ReportService = require('../services/reportService');
const { Device, Maintenance, Department } = require('../models');

// 模拟数据
const mockDepartments = [
  {
    id: 1,
    name: 'IT Department',
    Devices: [
      { id: 1 },
      { id: 2 }
    ]
  },
  {
    id: 2,
    name: 'HR Department',
    Devices: [
      { id: 3 }
    ]
  }
];

const mockDevices = [
  {
    id: 1,
    status: 'active',
    warrantyEndDate: new Date('2023-12-31')
  },
  {
    id: 2,
    status: 'maintenance',
    warrantyEndDate: new Date('2023-06-30')
  },
  {
    id: 3,
    status: 'active',
    warrantyEndDate: new Date('2023-04-15')
  }
];

const mockMaintenances = [
  {
    maintenanceType: 'preventive',
    startDate: new Date('2023-01-15'),
    cost: 100
  },
  {
    maintenanceType: 'corrective',
    startDate: new Date('2023-01-20'),
    cost: 200
  },
  {
    maintenanceType: 'preventive',
    startDate: new Date('2023-02-10'),
    cost: 150
  }
];

describe('ReportService', () => {
  beforeEach(() => {
    // 模拟Device.findAll
    Device.findAll = async (options) => {
      if (options.attributes && options.group) {
        // 设备状态统计
        return [
          { status: 'active', count: 2 },
          { status: 'maintenance', count: 1 }
        ];
      } else if (options.where && options.where.warrantyEndDate) {
        // 即将到期的设备
        return mockDevices.filter(device => {
          const warrantyEndDate = device.warrantyEndDate;
          const now = new Date();
          const thirtyDaysLater = new Date();
          thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
          return warrantyEndDate >= now && warrantyEndDate <= thirtyDaysLater;
        });
      }
      return mockDevices;
    };

    // 模拟Department.findAll
    Department.findAll = async (options) => {
      if (options.include) {
        // 部门设备统计
        return mockDepartments.map(dept => ({
          id: dept.id,
          name: dept.name,
          Devices: dept.Devices
        }));
      }
      return mockDepartments;
    };

    // 模拟Maintenance.findAll
    Maintenance.findAll = async (options) => {
      if (options.attributes && options.group) {
        if (options.attributes[0][1] === 'month') {
          // 年度维护成本统计
          return [
            { month: 1, totalCost: 300 },
            { month: 2, totalCost: 150 }
          ];
        } else {
          // 维护类型统计
          return [
            { maintenanceType: 'preventive', count: 2 },
            { maintenanceType: 'corrective', count: 1 }
          ];
        }
      }
      return mockMaintenances;
    };
  });

  describe('getDeviceStatusCount', () => {
    it('should return device status count', async () => {
      const result = await ReportService.getDeviceStatusCount();
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[0].status).to.equal('active');
      expect(result[0].count).to.equal(2);
    });
  });

  describe('getDepartmentDeviceCount', () => {
    it('should return department device count', async () => {
      const result = await ReportService.getDepartmentDeviceCount();
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[0].name).to.equal('IT Department');
      expect(result[0].Devices.length).to.equal(2);
    });
  });

  describe('getMaintenanceTypeCount', () => {
    it('should return maintenance type count', async () => {
      const result = await ReportService.getMaintenanceTypeCount();
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[0].maintenanceType).to.equal('preventive');
      expect(result[0].count).to.equal(2);
    });
  });

  describe('getAnnualMaintenanceCost', () => {
    it('should return annual maintenance cost', async () => {
      const result = await ReportService.getAnnualMaintenanceCost(2023);
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[0].month).to.equal(1);
      expect(result[0].totalCost).to.equal(300);
    });
  });

  describe('getExpiringWarranties', () => {
    it('should return expiring warranties', async () => {
      const result = await ReportService.getExpiringWarranties();
      expect(result).to.be.an('array');
      // 这里的结果取决于当前日期，所以我们只检查返回类型
      expect(result).to.be.an('array');
    });
  });
});