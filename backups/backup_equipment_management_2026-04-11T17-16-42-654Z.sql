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
  UNIQUE KEY `name_2` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  KEY `departmentId` (`departmentId`),
  CONSTRAINT `devices_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `devices_ibfk_2` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (1,'CNC-A-001','五轴联动加工中心','加工设备','DMG MORI DMU 50',NULL,'normal',1,'一号车间 A1区','2025-04-11 16:08:19',1200000.00,'DMG MORI','2026-10-08 16:08:19',NULL,NULL,1560,NULL,'2026-04-11 16:08:19','2026-04-11 16:08:19'),(2,'CNC-A-002','立式加工中心','加工设备','MAZAK VCN-530C',NULL,'fault',1,'一号车间 A2区','2026-01-11 16:08:19',850000.00,'MAZAK','2027-01-06 16:08:19',NULL,NULL,420,NULL,'2026-04-11 16:08:19','2026-04-11 16:08:19'),(3,'PACK-B-001','全自动包装流水线','包装设备','SF-600',NULL,'maintenance',1,'二号车间 B1区','2025-04-11 16:08:19',450000.00,'上海帆顺','2026-03-12 16:08:19',NULL,NULL,2100,NULL,'2026-04-11 16:08:19','2026-04-11 16:08:19'),(4,'TEST-Q-001','三坐标测量机','检测设备','ZEISS Contura',NULL,'normal',3,'质检中心','2026-01-11 16:08:19',600000.00,'ZEISS','2027-02-05 16:08:19',NULL,NULL,120,NULL,'2026-04-11 16:08:19','2026-04-11 16:08:19'),(5,'FORK-W-001','电动叉车','其他设备','Linde E20',NULL,'normal',4,'成品库','2025-04-11 16:08:19',150000.00,'Linde','2026-04-21 16:08:19',NULL,NULL,850,NULL,'2026-04-11 16:08:19','2026-04-11 16:08:19');
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
  CONSTRAINT `maintenanceplans_ibfk_2` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenanceplans`
--

LOCK TABLES `maintenanceplans` WRITE;
/*!40000 ALTER TABLE `maintenanceplans` DISABLE KEYS */;
INSERT INTO `maintenanceplans` VALUES (1,1,'preventive',1,'month',NULL,'2026-04-26 16:08:19','李工','active',0,'2026-04-11 16:08:19','2026-04-11 16:08:19'),(2,3,'preventive',3,'month',NULL,'2026-04-16 16:08:19','李工','active',0,'2026-04-11 16:08:19','2026-04-11 16:08:19');
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
  CONSTRAINT `maintenances_ibfk_2` FOREIGN KEY (`deviceId`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenances`
--

LOCK TABLES `maintenances` WRITE;
/*!40000 ALTER TABLE `maintenances` DISABLE KEYS */;
INSERT INTO `maintenances` VALUES (1,1,'preventive','月度常规检查与导轨润滑','2026-03-22 16:08:19','2026-03-22 20:08:19','completed','李工',500.00,'检查结果良好','2026-04-11 16:08:19','2026-04-11 16:08:19'),(2,5,'corrective','更换电瓶液及检查刹车系统','2026-02-25 16:08:19','2026-02-26 00:08:19','completed','外部维保单位',1200.00,'建议每半年检查一次','2026-04-11 16:08:19','2026-04-11 16:08:19');
/*!40000 ALTER TABLE `maintenances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repairorders`
--

DROP TABLE IF EXISTS `repairorders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repairorders` (
  `id` int NOT NULL AUTO_INCREMENT,
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
  CONSTRAINT `repairorders_ibfk_2` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repairorders`
--

LOCK TABLES `repairorders` WRITE;
/*!40000 ALTER TABLE `repairorders` DISABLE KEYS */;
INSERT INTO `repairorders` VALUES (1,2,'王操作','2026-04-09 16:08:19','主轴高速运转时有异常响声，疑似轴承磨损','pending',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-11 16:08:19','2026-04-11 16:08:19'),(2,3,'王操作','2026-04-01 16:08:19','封口机加热片故障，无法正常封口','completed','李工','2026-04-02 16:08:19','更换加热片及温控器','加热片*2, 温控继电器*1',850.00,NULL,'2026-04-11 16:08:19','2026-04-11 16:08:19');
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
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'系统管理员','拥有系统所有操作权限，包括权限分配、数据备份等。','[\"设备管理\",\"运行监控\",\"维护保养\",\"故障维修\",\"统计报表\",\"用户管理\",\"部门管理\",\"角色管理\",\"数据备份\",\"数据统计\",\"系统管理\"]','2026-04-11 17:03:46','2026-04-11 17:05:37'),(2,'生产经理','负责生产线的统筹管理，可以查看运行监控和审批报修单。','[\"设备管理\",\"运行监控\",\"故障维修\",\"统计报表\",\"部门管理\"]','2026-04-11 17:03:46','2026-04-11 17:03:46'),(3,'维修工程师','负责设备的具体维护与故障修理。','[\"设备管理\",\"维护保养\",\"故障维修\"]','2026-04-11 17:03:46','2026-04-11 17:03:46'),(4,'普通操作员','日常设备操作人员，负责数据上报和提交报修。','[\"运行监控\",\"故障维修\"]','2026-04-11 17:03:46','2026-04-11 17:03:46');
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
  CONSTRAINT `runningdata_ibfk_2` FOREIGN KEY (`equipmentId`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `runningdata`
--

LOCK TABLES `runningdata` WRITE;
/*!40000 ALTER TABLE `runningdata` DISABLE KEYS */;
INSERT INTO `runningdata` VALUES (1,1,'2026-04-11 16:08:19',9.23994,141.085,66.5178,'王操作','今日运行正常','2026-04-11 16:08:20','2026-04-11 16:08:20'),(2,4,'2026-04-11 16:08:19',5.51389,222.395,12.4144,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(3,1,'2026-04-10 16:08:19',11.1956,139.097,65.594,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(4,4,'2026-04-10 16:08:19',4.92673,224.407,13.6245,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(5,1,'2026-04-09 16:08:19',9.25721,103.54,50.7093,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(6,4,'2026-04-09 16:08:19',4.40594,227.254,10.2162,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(7,1,'2026-04-08 16:08:19',10.0096,128.722,68.27,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(8,4,'2026-04-08 16:08:19',5.25675,224.799,10.523,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(9,1,'2026-04-07 16:08:19',8.98772,101.04,68.1547,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(10,4,'2026-04-07 16:08:19',4.82875,212.05,10.4845,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(11,1,'2026-04-06 16:08:19',10.6434,134.427,53.8231,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(12,4,'2026-04-06 16:08:19',5.11959,223.706,14.3042,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(13,1,'2026-04-05 16:08:19',10.9675,140.934,54.9067,'王操作','','2026-04-11 16:08:20','2026-04-11 16:08:20'),(14,4,'2026-04-05 16:08:19',4.50812,224.37,14.5056,'张经理','','2026-04-11 16:08:20','2026-04-11 16:08:20');
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
  `role` enum('admin','manager','staff') COLLATE utf8mb4_unicode_ci DEFAULT 'staff',
  `departmentId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `email_2` (`email`),
  KEY `departmentId` (`departmentId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$dWWIH0mEDCVs9j9M6rM5EOwg8C0FGu8.zbPYoNtwWGvhfMBS1Dlgi','admin@factory.com','系统管理员','admin',2,'2026-04-11 16:08:19','2026-04-11 16:08:19'),(2,'manager_prod','$2b$10$dWWIH0mEDCVs9j9M6rM5EOwg8C0FGu8.zbPYoNtwWGvhfMBS1Dlgi','prod_mgr@factory.com','张经理','manager',1,'2026-04-11 16:08:19','2026-04-11 16:08:19'),(3,'tech_li','$2b$10$dWWIH0mEDCVs9j9M6rM5EOwg8C0FGu8.zbPYoNtwWGvhfMBS1Dlgi','li_tech@factory.com','李工','staff',2,'2026-04-11 16:08:19','2026-04-11 16:08:19'),(4,'operator_wang','$2b$10$dWWIH0mEDCVs9j9M6rM5EOwg8C0FGu8.zbPYoNtwWGvhfMBS1Dlgi','wang_op@factory.com','王操作','staff',1,'2026-04-11 16:08:19','2026-04-11 16:08:19');
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

-- Dump completed on 2026-04-12  1:16:42
