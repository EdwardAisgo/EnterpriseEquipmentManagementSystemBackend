# 企业设备管理系统后端

## 项目概述

企业设备管理系统后端是一个基于Node.js和Express框架开发的API服务，用于管理企业设备的全生命周期，包括设备的注册、维护、状态跟踪和报告生成等功能。

## 技术栈

- **Node.js** - JavaScript运行环境
- **Express** - Web应用框架
- **Sequelize** - ORM数据库工具
- **MySQL** - 关系型数据库
- **JWT** - 身份验证
- **bcrypt** - 密码加密
- **node-schedule** - 任务调度

## 项目结构

```
EnterpriseEquipmentManagementSystemBackend/
├── config/
│   └── database.js       # 数据库配置
├── middleware/
│   └── auth.js           # 身份验证中间件
├── models/
│   ├── Department.js     # 部门模型
│   ├── Device.js         # 设备模型
│   ├── Maintenance.js    # 维护记录模型
│   ├── User.js           # 用户模型
│   └── index.js          # 模型导出
├── routes/
│   ├── auth.js           # 身份验证路由
│   ├── device.js         # 设备管理路由
│   ├── maintenance.js    # 维护管理路由
│   └── report.js         # 报告生成路由
├── utils/
│   └── syncDatabase.js   # 数据库同步工具
├── .env                  # 环境变量配置
├── app.js                # 应用入口
├── ecosystem.config.js   # PM2配置
├── package-lock.json     # 依赖锁定
├── package.json          # 项目配置和依赖
└── README.md             # 项目说明
```

## 安装和运行

### 前提条件

- Node.js 12.x或更高版本
- MySQL 5.7或更高版本

### 安装步骤

1. 克隆项目到本地

```bash
git clone <repository-url>
cd EnterpriseEquipmentManagementSystemBackend
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

复制 `.env` 文件并根据实际情况修改配置：

```bash
# 数据库连接信息
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=equipment_management

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# 服务器配置
PORT=3001
```

4. 运行项目

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API接口说明

### 身份验证接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息

### 设备管理接口

- `GET /api/device` - 获取设备列表
- `GET /api/device/:id` - 获取设备详情
- `POST /api/device` - 添加设备
- `PUT /api/device/:id` - 更新设备
- `DELETE /api/device/:id` - 删除设备
- `GET /api/device/status/:status` - 按状态筛选设备

### 维护管理接口

- `GET /api/maintenance` - 获取维护记录列表
- `GET /api/maintenance/:id` - 获取维护记录详情
- `POST /api/maintenance` - 添加维护记录
- `PUT /api/maintenance/:id` - 更新维护记录
- `DELETE /api/maintenance/:id` - 删除维护记录

### 报告生成接口

- `GET /api/report/device-status` - 设备状态报告
- `GET /api/report/maintenance-history` - 维护历史报告

## 数据库结构

### 用户表 (users)
- `id` - 用户ID
- `username` - 用户名
- `password` - 密码（加密）
- `name` - 姓名
- `role` - 角色
- `departmentId` - 所属部门ID
- `createdAt` - 创建时间
- `updatedAt` - 更新时间

### 部门表 (departments)
- `id` - 部门ID
- `name` - 部门名称
- `createdAt` - 创建时间
- `updatedAt` - 更新时间

### 设备表 (devices)
- `id` - 设备ID
- `name` - 设备名称
- `model` - 设备型号
- `serialNumber` - 序列号
- `status` - 状态
- `departmentId` - 所属部门ID
- `purchaseDate` - 购买日期
- `warrantyEndDate` -  warranty结束日期
- `createdAt` - 创建时间
- `updatedAt` - 更新时间

### 维护记录表 (maintenances)
- `id` - 维护记录ID
- `deviceId` - 设备ID
- `maintenanceType` - 维护类型
- `description` - 维护描述
- `status` - 状态
- `scheduledDate` - 计划维护日期
- `completedDate` - 完成日期
- `createdAt` - 创建时间
- `updatedAt` - 更新时间

## 许可证

ISC License

## 开发团队

- 开发人员：[您的名字]
- 联系邮箱：[您的邮箱]
# EnterpriseEquipmentManagementSystemBackend
