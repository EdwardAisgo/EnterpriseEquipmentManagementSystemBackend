const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const logger = require('../utils/logger');
require('dotenv').config();

class BackupService {
  static async createBackup() {
    return new Promise((resolve, reject) => {
      const dbName = process.env.DB_NAME || 'equipment_management';
      const dbUser = process.env.DB_USER || 'root';
      const dbPass = process.env.DB_PASSWORD || 'password';
      const dbHost = process.env.DB_HOST || 'localhost';
      
      const backupDir = path.join(__dirname, '../backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      
      const fileName = `backup_${dbName}_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      const filePath = path.join(backupDir, fileName);
      
      // 使用 mysqldump 命令进行备份
      // 注意：这里假设系统已安装 mysql 客户端工具
      const cmd = `mysqldump -h ${dbHost} -u ${dbUser} -p${dbPass} ${dbName} > "${filePath}"`;
      
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Backup failed: ${error.message}`);
          return reject(new Error('Backup failed: ' + error.message));
        }
        logger.info(`Backup successful: ${fileName}`);
        resolve({ fileName, filePath });
      });
    });
  }

  static async getBackups() {
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) return [];
    
    const files = fs.readdirSync(backupDir);
    return files.filter(f => f.endsWith('.sql')).map(f => {
      const stats = fs.statSync(path.join(backupDir, f));
      return {
        fileName: f,
        size: (stats.size / 1024).toFixed(2) + ' KB',
        createdAt: stats.birthtime
      };
    }).sort((a, b) => b.createdAt - a.createdAt);
  }

  static async restoreBackup(fileName) {
    return new Promise((resolve, reject) => {
      const dbName = process.env.DB_NAME || 'equipment_management';
      const dbUser = process.env.DB_USER || 'root';
      const dbPass = process.env.DB_PASSWORD || 'password';
      const dbHost = process.env.DB_HOST || 'localhost';
      
      const filePath = path.join(__dirname, '../backups', fileName);
      if (!fs.existsSync(filePath)) {
        return reject(new Error('Backup file not found'));
      }
      
      const cmd = `mysql -h ${dbHost} -u ${dbUser} -p${dbPass} ${dbName} < "${filePath}"`;
      
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Restore failed: ${error.message}`);
          return reject(new Error('Restore failed: ' + error.message));
        }
        logger.info(`Restore successful from: ${fileName}`);
        resolve({ success: true });
      });
    });
  }

  static async deleteBackup(fileName) {
    const filePath = path.join(__dirname, '../backups', fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    throw new Error('File not found');
  }
}

module.exports = BackupService;
