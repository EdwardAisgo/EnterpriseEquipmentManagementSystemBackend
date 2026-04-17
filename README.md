# 企业设备管理系统后端（API）

企业设备管理系统后端提供 RESTful API 服务，负责设备全生命周期相关的业务逻辑与数据持久化，包含设备台账、维护计划与维护记录、故障维修工单、运行数据、报表统计与用户管理等能力。

## 技术栈

- Node.js + Express
- MySQL + Sequelize ORM
- JWT（Authorization: Bearer Token）
- Redis（缓存）
- winston（日志）

## 目录结构

```
EnterpriseEquipmentManagementSystemBackend/
├── app.js                      # 应用入口
├── config/                     # 配置（数据库等）
├── middleware/                 # 中间件（鉴权等）
├── models/                     # Sequelize 模型与关联
├── routes/                     # 路由（REST API）
├── services/                   # 业务服务层
├── utils/                      # 工具（日志/redis/同步脚本等）
├── tests/                      # 单元/接口测试（部分脚本）
├── logs/                       # 运行日志（本地）
├── .env.example                # 环境变量模板（建议复制为 .env）
├── .env                        # 本地环境变量（不要提交）
└── README.md
```

## 环境要求

- Node.js >= 16（建议与前端统一 >= 20）
- MySQL >= 5.7（建议 8.x）
- Redis（可选但推荐，用于缓存）
- MySQL 客户端工具（可选但推荐，用于数据备份与恢复：`mysqldump` / `mysql`）

## 快速开始

### 1. 安装依赖

```bash
cd EnterpriseEquipmentManagementSystemBackend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并按你的本地环境修改：

```bash
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_NAME=equipment_management
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

NODE_ENV=development
```

### 3. 初始化/同步数据库

确保已创建数据库（例如 `equipment_management`），然后执行表结构同步：

```bash
node sync-database.js
```

说明：该脚本会执行 `sequelize.sync({ alter: true })`，用于开发环境快速对齐表结构；生产环境请使用更可控的迁移方案。

### 4. 默认账号与基础数据

执行 `node sync-database.js` 后，系统会尽量自动准备一套可用的基础数据：

- 默认管理员账号：`admin / admin123`
- 默认角色：`admin` / `manager` / `staff`
- 默认菜单：写入 `Menus` 表（用于前端动态侧边栏与角色菜单授权）

### 4. 启动服务

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start
```

默认启动地址：`http://localhost:3001`  
健康检查：`GET http://localhost:3001/health`

### 5.（可选）准备演示数据

- 推荐方式：通过前端页面录入部门、用户、设备、维护计划、维护记录、报修与运行数据，便于验证各模块联动效果。
- 工具脚本：仓库内存在若干测试/辅助脚本（如 `create-department.js`、`test-*.js`），可按需用于快速验证接口连通性。

## API 概览

所有需要登录的接口均要求请求头携带：

```
Authorization: Bearer <token>
```

### 认证

- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/auth/me`
- POST `/api/auth/logout`（为兼容前端模板提供的占位接口）

### 用户

- GET `/api/users`（支持查询参数：`username`/`name`/`departmentId`/`role`）
- POST `/api/users/register`
- GET `/api/users/:id`
- DELETE `/api/users/:id`
- PUT `/api/users/me/password`（个人修改密码）
- PUT `/api/users/:id/reset-password`（管理员重置密码）

### 部门

- GET `/api/departments`
- GET `/api/departments/:id`
- POST `/api/departments`
- PUT `/api/departments/:id`
- DELETE `/api/departments/:id`

### 设备

- GET `/api/device`
- GET `/api/device/:id`
- POST `/api/device`
- PUT `/api/device/:id`
- PUT `/api/device/:id/scrap`
- DELETE `/api/device/:id`
- GET `/api/device/status/:status`

### 维护

- GET `/api/maintenance`
- GET `/api/maintenance/:id`
- POST `/api/maintenance`
- PUT `/api/maintenance/:id`
- DELETE `/api/maintenance/:id`

### 维护计划

- GET `/api/maintenance-plans`
- GET `/api/maintenance-plans/:id`
- POST `/api/maintenance-plans`
- PUT `/api/maintenance-plans/:id`
- DELETE `/api/maintenance-plans/:id`

### 维修工单

- GET `/api/repair-orders`
- GET `/api/repair-orders/:id`
- POST `/api/repair-orders`
- PUT `/api/repair-orders/:id`
- DELETE `/api/repair-orders/:id`
- GET `/api/repair-orders/equipment/:equipmentId`
- GET `/api/repair-orders/status/:status`

### 运行数据

- GET `/api/running-data`
- GET `/api/running-data/:id`
- POST `/api/running-data`
- PUT `/api/running-data/:id`
- DELETE `/api/running-data/:id`

### 报表

- GET `/api/report/device-status`
- GET `/api/report/department-devices`
- GET `/api/report/maintenance-type`
- GET `/api/report/maintenance-cost/:year`
- GET `/api/report/warranty-expiring`

### 角色与权限（基础模块）

- GET `/api/roles`
- POST `/api/roles`
- PUT `/api/roles/:id`
- DELETE `/api/roles/:id`

说明：

- `Roles.permissions` 保存“菜单 ID 列表”（例如 `system_roles`），用于菜单级权限控制。
- 前端的“角色管理”页面会以菜单树形式勾选并保存到 `Roles.permissions`。

### 菜单（动态路由/侧边栏）

- GET `/api/menus/me`（返回当前用户可见菜单树）
- GET `/api/menus/all`（返回完整菜单树，仅管理员）
- POST `/api/menus/sync`（同步菜单到数据库，仅管理员）

说明：前端侧边栏与权限拦截依赖 `/api/menus/me` 返回结果。

### 数据备份

- GET `/api/backup`（备份列表）
- POST `/api/backup/create`（创建备份）
- POST `/api/backup/restore`（恢复备份，body：`{ fileName }`）
- DELETE `/api/backup/:fileName`（删除备份文件）

说明：备份与恢复依赖系统安装 MySQL 客户端工具（`mysqldump`/`mysql`）并可在命令行中直接调用。

### 操作日志（日志管理）

- GET `/api/logs`（分页/筛选查询，仅管理员）

查询参数示例：

```
/api/logs?current=1&pageSize=10&username=&action=&entityType=&entityId=
```

说明：

- 操作日志落库到 `OperationLogs` 表，包含操作人、角色、对象、详情、IP 等信息。
- 已在设备/维修/维护/运行数据/备份等关键写操作中自动记录日志。
- 可用脚本写入演示日志：`node scripts/seed-operation-logs.js`

### 前端模板兼容接口（占位）

以下接口用于兼容 Ant Design Pro 模板内置请求，返回空数据：

- GET `/api/notices`
- GET `/api/rule`
- POST `/api/rule`
- GET `/api/login/captcha`

## 常见问题

- 401/403：检查前端是否携带 `Authorization: Bearer <token>`，以及 token 是否过期。
- 数据库连接失败：检查 `.env` 中 DB_* 配置、MySQL 服务是否启动、数据库是否存在。
- Redis 连接告警：检查 `utils/redis.js` 配置；若本地 Redis 未设置密码，请避免提供密码参数。

## 如何测试

项目使用 Mocha 和 Chai 进行单元测试和集成测试。

### 运行所有测试

```bash
npm test
```

测试文件位于 `tests/` 目录下，并以 `.test.js` 结尾。

