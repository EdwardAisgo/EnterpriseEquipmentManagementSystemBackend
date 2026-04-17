-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: equipment_management
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'生产部','负责车间设备生产运行与日常管理','2026-04-11 16:08:19','2026-04-11 16:08:19'),(2,'设备部','负责全厂设备统筹管理、维护与备件采购','2026-04-11 16:08:19','2026-04-11 16:08:19'),(3,'质量部','负责产品检测与质量控制设备的运行','2026-04-11 16:08:19','2026-04-11 16:08:19'),(4,'仓储物流部','负责原材料与成品的存储及搬运设备','2026-04-11 16:08:19','2026-04-11 16:08:19'),(5,'行政管理部','负责公司日常办公设备及综合管理','2026-04-11 16:08:19','2026-04-11 16:08:19');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deviceCode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specification` text COLLATE utf8mb4_unicode_ci,
  `status` enum('normal','maintenance','fault','scrapped') COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `departmentId` int DEFAULT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchaseDate` datetime DEFAULT NULL,
  `purchasePrice` decimal(10,2) DEFAULT NULL,
  `supplier` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warrantyEndDate` datetime DEFAULT NULL,
  `scrapDate` datetime DEFAULT NULL,
  `scrapReason` text COLLATE utf8mb4_unicode_ci,
  `runningHours` float DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `deviceCode` (`deviceCode`),
  UNIQUE KEY `deviceCode_2` (`deviceCode`),
  UNIQUE KEY `deviceCode_3` (`deviceCode`),
  UNIQUE KEY `deviceCode_4` (`deviceCode`),
  UNIQUE KEY `deviceCode_5` (`deviceCode`),
  UNIQUE KEY `deviceCode_6` (`deviceCode`),
  UNIQUE KEY `deviceCode_7` (`deviceCode`),
  UNIQUE KEY `deviceCode_8` (`deviceCode`),
  UNIQUE KEY `deviceCode_9` (`deviceCode`),
  UNIQUE KEY `deviceCode_10` (`deviceCode`),
  UNIQUE KEY `deviceCode_11` (`deviceCode`),
  UNIQUE KEY `deviceCode_12` (`deviceCode`),
  KEY `departmentId` (`departmentId`),
  CONSTRAINT `devices_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `devices_ibfk_10` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `devices_ibfk_11` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `devices_ibfk_12` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `devices_ibfk_2` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `devices_ibfk_3` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `devices_ibfk_4` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `devices_ibfk_5` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `devices_ibfk_6` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `devices_ibfk_7` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `devices_ibfk_8` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `devices_ibfk_9` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (1,'CNC-A-001','五轴联动加工中心','加工设备','DMG MORI DMU 50',NULL,'normal',1,'一号车间 A1区','2025-04-11 16:08:19',1200000.00,'DMG MORI','2026-10-08 16:08:19',NULL,NULL,1560,NULL,'2026-04-11 16:08:19','2026-04-11 19:23:03'),(2,'CNC-A-002','立式加工中心','加工设备','MAZAK VCN-530C',NULL,'fault',1,'一号车间 A2区','2026-01-11 16:08:19',850000.00,'MAZAK','2027-01-06 16:08:19',NULL,NULL,125,'name-test','2026-04-11 16:08:19','2026-04-12 19:14:10'),(3,'PACK-B-001','全自动包装流水线','包装设备','SF-600',NULL,'normal',1,'二号车间 B1区','2025-04-11 16:08:19',450000.00,'上海帆顺','2026-03-12 16:08:19',NULL,NULL,2100,NULL,'2026-04-11 16:08:19','2026-04-12 09:58:57'),(4,'TEST-Q-001','三坐标测量机','检测设备','ZEISS Contura',NULL,'normal',3,'质检中心','2026-01-11 16:08:19',600000.00,'ZEISS','2027-02-05 16:08:19',NULL,NULL,120,NULL,'2026-04-11 16:08:19','2026-04-12 09:59:00'),(5,'FORK-W-001','电动叉车','其他设备','Linde E20',NULL,'normal',4,'成品库','2025-04-11 16:08:19',150000.00,'Linde','2026-04-21 16:08:19',NULL,NULL,850,NULL,'2026-04-11 16:08:19','2026-04-12 09:59:03');
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenanceplans`
--

DROP TABLE IF EXISTS `maintenanceplans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenanceplans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deviceId` int NOT NULL,
  `maintenanceType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cycle` int NOT NULL,
  `cycleUnit` enum('day','week','month','year') COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastMaintenance` datetime DEFAULT NULL,
  `nextMaintenance` datetime NOT NULL,
  `responsiblePerson` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `alert` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `deviceId` (`deviceId`),
  CONSTRAINT `maintenanceplans_ibfk_1` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `maintenanceplans_ibfk_10` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenanceplans_ibfk_11` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenanceplans_ibfk_12` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenanceplans_ibfk_2` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `maintenanceplans_ibfk_3` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenanceplans_ibfk_4` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenanceplans_ibfk_5` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenanceplans_ibfk_6` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenanceplans_ibfk_7` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenanceplans_ibfk_8` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenanceplans_ibfk_9` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenanceplans`
--

LOCK TABLES `maintenanceplans` WRITE;
/*!40000 ALTER TABLE `maintenanceplans` DISABLE KEYS */;
INSERT INTO `maintenanceplans` VALUES (1,1,'preventive',1,'month',NULL,'2026-04-26 16:08:19','李工','active',0,'2026-04-11 16:08:19','2026-04-11 16:08:19'),(2,3,'preventive',3,'month',NULL,'2026-04-16 16:08:19','李工','active',0,'2026-04-11 16:08:19','2026-04-11 16:08:19'),(3,2,'preventive',12,'month','2025-04-30 16:00:00','2026-04-30 16:00:00','胥星','active',0,'2026-04-12 10:00:10','2026-04-12 10:00:10'),(4,2,'corrective',12,'month','2025-04-30 16:00:00','2026-04-30 16:00:00','胥星','active',0,'2026-04-12 10:18:08','2026-04-12 10:18:08'),(5,2,'preventive',12,'month','2025-04-30 16:00:00','2026-04-30 16:00:00','胥星','active',0,'2026-04-12 10:21:44','2026-04-12 12:07:53');
/*!40000 ALTER TABLE `maintenanceplans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenances`
--

DROP TABLE IF EXISTS `maintenances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deviceId` int NOT NULL,
  `maintenanceType` enum('preventive','corrective','predictive') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `technician` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `deviceId` (`deviceId`),
  CONSTRAINT `maintenances_ibfk_1` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `maintenances_ibfk_10` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenances_ibfk_11` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenances_ibfk_12` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenances_ibfk_2` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `maintenances_ibfk_3` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenances_ibfk_4` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenances_ibfk_5` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenances_ibfk_6` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenances_ibfk_7` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenances_ibfk_8` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`),
  CONSTRAINT `maintenances_ibfk_9` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenances`
--

LOCK TABLES `maintenances` WRITE;
/*!40000 ALTER TABLE `maintenances` DISABLE KEYS */;
INSERT INTO `maintenances` VALUES (1,1,'preventive','月度常规检查与导轨润滑111','2026-03-22 16:08:19','2026-03-22 20:08:19','completed','李工',500.00,'检查结果良好','2026-04-11 16:08:19','2026-04-12 13:21:07'),(2,5,'corrective','更换电瓶液及检查刹车系统','2026-02-25 16:08:19','2026-02-26 00:08:19','completed','外部维保单位',1200.00,'建议每半年检查一次','2026-04-11 16:08:19','2026-04-11 16:08:19'),(3,1,'preventive','整体维护','2026-04-11 16:00:00','2026-04-11 16:00:00','completed','李工',1200.00,NULL,'2026-04-11 19:23:03','2026-04-11 19:23:03'),(4,1,'preventive','1233','2026-04-12 16:00:00','2026-04-12 16:00:00','completed','胥星',1200.00,'2121','2026-04-12 10:22:32','2026-04-12 12:25:26');
/*!40000 ALTER TABLE `maintenances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort` int NOT NULL DEFAULT '0',
  `hideInMenu` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES ('analytics',NULL,'数据统计','/analytics','barChart',10,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('analytics_overview','analytics','统计概览','/analytics/overview','pieChart',11,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('equipment',NULL,'设备台账','/equipment','tool',20,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('equipment_list','equipment','设备列表','/equipment/list','unorderedList',21,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('maintenance',NULL,'维护保养','/maintenance','build',40,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('maintenance_plans','maintenance','维护计划','/maintenance/plans','calendar',41,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('maintenance_records','maintenance','保养记录','/maintenance/records','history',42,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('monitoring',NULL,'运行监控','/monitoring','dashboard',30,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('repair',NULL,'故障维修','/repair','warning',50,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('repair_orders','repair','维修工单','/repair/orders','fileText',51,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('system',NULL,'系统管理','/system','setting',60,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('system_backup','system','数据备份','/system/backup','database',65,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('system_departments','system','部门管理','/system/departments','team',62,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('system_logs','system','日志管理','/system/logs','profile',64,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('system_roles','system','角色管理','/system/roles','lock',63,0,'2026-04-12 17:03:43','2026-04-12 17:03:43'),('system_users','system','用户管理','/system/users','user',61,0,'2026-04-12 17:03:43','2026-04-12 17:03:43');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operationlogs`
--

DROP TABLE IF EXISTS `operationlogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operationlogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `roleName` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entityId` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entityName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `displayName` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operationlogs`
--

LOCK TABLES `operationlogs` WRITE;
/*!40000 ALTER TABLE `operationlogs` DISABLE KEYS */;
INSERT INTO `operationlogs` VALUES (1,1,'admin','系统管理员','更新设备','device','2','立式加工中心','{\"body\":{\"notes\":\"log-test\"}}','::1','axios/1.13.6','2026-04-12 17:37:20','2026-04-12 17:37:20','系统管理员'),(2,1,'admin','系统管理员','登录','auth','admin','系统登录','{\"result\":\"success\"}','127.0.0.1','seed-script','2026-04-12 16:42:06','2026-04-12 16:42:06','系统管理员'),(3,1,'admin','系统管理员','查看设备列表','device',NULL,NULL,'{\"page\":1,\"pageSize\":10}','127.0.0.1','seed-script','2026-04-12 17:00:06','2026-04-12 17:00:06','系统管理员'),(4,1,'admin','系统管理员','更新设备','device','1','五轴联动加工中心','{\"changed\":[\"notes\"]}','127.0.0.1','seed-script','2026-04-12 17:17:06','2026-04-12 17:17:06','系统管理员'),(5,1,'admin','系统管理员','提交报修','repair_order','WO2026041200029709','WO2026041200029709','{\"equipmentId\":2}','127.0.0.1','seed-script','2026-04-12 17:30:06','2026-04-12 17:30:06','系统管理员'),(6,1,'admin','系统管理员','创建备份','backup','backup_seed_2026-04-12','数据库备份','{\"method\":\"manual\"}','127.0.0.1','seed-script','2026-04-12 17:37:06','2026-04-12 17:37:06','系统管理员'),(7,1,'admin','系统管理员','更新设备','device','2','立式加工中心','{\"body\":{\"notes\":\"name-test\"}}','::1','axios/1.13.6','2026-04-12 17:57:02','2026-04-12 17:57:02','系统管理员'),(8,1,'admin','系统管理员','删除设备','device','6',NULL,'{}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36 Edg/123.0.0.0','2026-04-12 18:48:52','2026-04-12 18:48:52','系统管理员'),(9,12,'testUser','普通操作员','新增运行数据','running_data','15','15','{\"body\":{\"deviceId\":2,\"date\":\"2026-04-12T16:00:00.000Z\",\"runningHours\":125,\"production\":100,\"energyConsumption\":30,\"operator\":\"测试用户\",\"notes\":\"测试上报运行数据\"}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36 Edg/123.0.0.0','2026-04-12 19:14:10','2026-04-12 19:14:10','测试用户');
/*!40000 ALTER TABLE `operationlogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repairorders`
--

DROP TABLE IF EXISTS `repairorders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repairorders` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `equipmentId` int NOT NULL,
  `applicant` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applyDate` datetime NOT NULL,
  `faultDescription` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','assigned','in_progress','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `assignedTo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repairDate` datetime DEFAULT NULL,
  `repairContent` text COLLATE utf8mb4_unicode_ci,
  `partsReplaced` text COLLATE utf8mb4_unicode_ci,
  `repairCost` decimal(10,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `equipmentId` (`equipmentId`),
  CONSTRAINT `repairorders_ibfk_1` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `repairorders_ibfk_2` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `repairorders_ibfk_3` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `repairorders_ibfk_4` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `repairorders_ibfk_5` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `repairorders_ibfk_6` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repairorders`
--

LOCK TABLES `repairorders` WRITE;
/*!40000 ALTER TABLE `repairorders` DISABLE KEYS */;
INSERT INTO `repairorders` VALUES ('WO2026041200029709',2,'胥星','2026-04-12 16:00:00','1212','pending',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-12 16:52:21','2026-04-12 16:52:21');
/*!40000 ALTER TABLE `repairorders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permissions` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'系统管理员','拥有系统所有操作权限，包括权限分配、数据备份等。','[\"equipment\",\"equipment_list\",\"monitoring\",\"maintenance\",\"maintenance_plans\",\"maintenance_records\",\"repair\",\"repair_orders\",\"analytics\",\"analytics_overview\",\"system\",\"system_users\",\"system_departments\",\"system_roles\",\"system_backup\",\"system_logs\"]','2026-04-11 17:03:46','2026-04-12 17:07:12'),(2,'生产经理','负责生产线的统筹管理，可以查看运行监控和审批报修单。','[\"equipment\",\"equipment_list\",\"monitoring\",\"analytics\",\"analytics_overview\",\"system\",\"system_departments\",\"system_users\",\"system_roles\",\"system_logs\",\"system_backup\"]','2026-04-11 17:03:46','2026-04-12 17:09:40'),(3,'维修工程师','负责设备的具体维护与故障修理。','[\"equipment\",\"equipment_list\",\"maintenance\",\"maintenance_plans\",\"maintenance_records\",\"repair\",\"repair_orders\",\"monitoring\"]','2026-04-11 17:03:46','2026-04-12 17:09:40'),(4,'普通操作员','日常设备操作人员，负责数据上报和提交报修。','[\"monitoring\",\"maintenance\",\"maintenance_plans\",\"maintenance_records\"]','2026-04-11 17:03:46','2026-04-12 17:09:40'),(11,'设备管理员','负责设备的台账管理，设备的故障上报，设备的维护保养信息更新等。','[\"equipment\",\"equipment_list\",\"maintenance\",\"maintenance_plans\",\"maintenance_records\",\"repair\",\"repair_orders\"]','2026-04-12 17:22:02','2026-04-12 17:22:02');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `runningdata`
--

DROP TABLE IF EXISTS `runningdata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `runningdata` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipmentId` int NOT NULL,
  `date` datetime NOT NULL,
  `runningHours` float NOT NULL,
  `production` float NOT NULL,
  `energyConsumption` float NOT NULL,
  `operator` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `equipmentId` (`equipmentId`),
  CONSTRAINT `runningdata_ibfk_1` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `runningdata_ibfk_10` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `runningdata_ibfk_11` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `runningdata_ibfk_12` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `runningdata_ibfk_2` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `runningdata_ibfk_3` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `runningdata_ibfk_4` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `runningdata_ibfk_5` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `runningdata_ibfk_6` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `runningdata_ibfk_7` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `runningdata_ibfk_8` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`),
  CONSTRAINT `runningdata_ibfk_9` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `runningdata`
--

LOCK TABLES `runningdata` WRITE;
/*!40000 ALTER TABLE `runningdata` DISABLE KEYS */;
INSERT INTO `runningdata` VALUES (1,1,'2026-04-11 16:08:19',9.23994,141.085,66.5178,'王操作','今日运行正常','2026-04-11 16:08:20','2026-04-11 16:08:20'),(2,4,'2026-04-11 16:08:19',5.51389,222.395,12.4144,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(3,1,'2026-04-10 16:08:19',11.1956,139.097,65.594,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(4,4,'2026-04-10 16:08:19',4.92673,224.407,13.6245,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(5,1,'2026-04-09 16:08:19',9.25721,103.54,50.7093,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(6,4,'2026-04-09 16:08:19',4.40594,227.254,10.2162,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(7,1,'2026-04-08 16:08:19',10.0096,128.722,68.27,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(8,4,'2026-04-08 16:08:19',5.25675,224.799,10.523,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(9,1,'2026-04-07 16:08:19',8.98772,101.04,68.1547,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(10,4,'2026-04-07 16:08:19',4.82875,212.05,10.4845,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(11,1,'2026-04-06 16:08:19',10.6434,134.427,53.8231,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(12,4,'2026-04-06 16:08:19',5.11959,223.706,14.3042,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(13,1,'2026-04-05 16:08:19',10.9675,140.934,54.9067,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(14,4,'2026-04-05 16:08:19',4.50812,224.37,14.5056,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(15,2,'2026-04-12 16:00:00',125,100,30,'测试用户','测试上报运行数据','2026-04-12 19:14:10','2026-04-12 19:14:10');
/*!40000 ALTER TABLE `runningdata` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `roleId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `email_12` (`email`),
  KEY `departmentId` (`departmentId`),
  KEY `roleId` (`roleId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `users_ibfk_10` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `users_ibfk_11` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_12` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `users_ibfk_13` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_14` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `users_ibfk_15` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_16` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `users_ibfk_17` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_18` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `users_ibfk_19` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `users_ibfk_20` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `users_ibfk_21` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `users_ibfk_4` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `users_ibfk_5` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_6` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `users_ibfk_7` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_8` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `users_ibfk_9` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`),
  CONSTRAINT `Users_roleId_foreign_idx` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$EgUvyJVQMl1k5/kiRLENUuA6X1BhVDNPs.vLZZAnT707SAycEQLaS','admin@factory.com','系统管理员',2,'2026-04-11 16:08:19','2026-04-12 15:25:30',1),(2,'manager_prod','$2b$10$dWWIH0mEDCVs9j9M6rM5EOwg8C0FGu8.zbPYoNtwWGvhfMBS1Dlgi','prod_mgr@factory.com','张经理',1,'2026-04-11 16:08:19','2026-04-11 20:05:44',2),(3,'tech_li','$2b$10$dWWIH0mEDCVs9j9M6rM5EOwg8C0FGu8.zbPYoNtwWGvhfMBS1Dlgi','li_tech@factory.com','李工',2,'2026-04-11 16:08:19','2026-04-11 20:21:14',3),(4,'operator_wang','$2b$10$dWWIH0mEDCVs9j9M6rM5EOwg8C0FGu8.zbPYoNtwWGvhfMBS1Dlgi','wang_op@factory.com','王操作',1,'2026-04-11 16:08:19','2026-04-11 20:05:52',4),(5,'xuxing','$2b$10$QdAh54hjo6WF8BCnrI92H.rDk6dcWNxkRvlAb45.sz128qbc68/u2','942390306@qq.com','胥星',5,'2026-04-11 19:23:56','2026-04-12 06:25:56',2),(9,'engineer1','$2b$10$thAG42gIfryqPDnkjDdkjOfB5gM9HnVKGvV2ForeKglN95/8rGtyW','engineer1@qq.com','engineer1',3,'2026-04-12 06:22:26','2026-04-12 06:22:26',3);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-13  3:17:21
