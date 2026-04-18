const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const logger = require('../utils/logger');
require('dotenv').config();

class BackupService {
  /**
   * 查找 MySQL 客户端二进制文件路径
   * 在 Windows 上如果命令不在 PATH 中，尝试常见安装路径
   */
  static findMySQLBinary(binaryName) {
    // 如果已在 PATH 中，直接返回命令名
    try {
      const { execSync } = require('child_process');
      if (process.platform === 'win32') {
        execSync(`where ${binaryName} >nul 2>nul`);
      } else {
        execSync(`which ${binaryName} > /dev/null 2>&1`);
      }
      return binaryName;
    } catch (_e) {
      // 不在 PATH 中，继续查找
    }

    if (process.platform === 'win32') {
      const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
      const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

      const possiblePaths = [
        // MySQL Server 官方安装路径
        path.join(programFiles, 'MySQL', 'MySQL Server 8.0', 'bin', `${binaryName}.exe`),
        path.join(programFiles, 'MySQL', 'MySQL Server 8.4', 'bin', `${binaryName}.exe`),
        path.join(programFiles, 'MySQL', 'MySQL Server 9.0', 'bin', `${binaryName}.exe`),
        path.join(programFilesX86, 'MySQL', 'MySQL Server 8.0', 'bin', `${binaryName}.exe`),
        path.join(programFilesX86, 'MySQL', 'MySQL Server 8.4', 'bin', `${binaryName}.exe`),
        // XAMPP
        'C:\\xampp\\mysql\\bin\\' + binaryName + '.exe',
        'D:\\xampp\\mysql\\bin\\' + binaryName + '.exe',
        // WAMP
        'C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\' + binaryName + '.exe',
        'C:\\wamp\\bin\\mysql\\mysql8.0.31\\bin\\' + binaryName + '.exe',
        // 通用 Program Files
        path.join(programFiles, 'MySQL', 'bin', `${binaryName}.exe`),
        path.join(programFilesX86, 'MySQL', 'bin', `${binaryName}.exe`),
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          logger.info(`Found ${binaryName} at: ${p}`);
          return `"${p}"`;
        }
      }
    }

    return null;
  }

  /**
   * 构建并执行命令，自动处理路径和密码中的特殊字符
   */
  static async execMySQLCommand(binaryName, args) {
    const binaryPath = this.findMySQLBinary(binaryName);
    if (!binaryPath) {
      const errMsg = process.platform === 'win32'
        ? `未找到 ${binaryName}.exe。请将 MySQL 的 bin 目录添加到系统 PATH，或确认已安装 MySQL 客户端。`
        : `未找到 ${binaryName}。请确认已安装 MySQL 客户端并添加到 PATH。`;
      throw new Error(errMsg);
    }

    return new Promise((resolve, reject) => {
      const cmd = `${binaryPath} ${args}`;
      logger.info(`Executing: ${binaryName} ...`);

      exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          logger.error(`${binaryName} failed: ${error.message}`);
          if (stderr) logger.error(`stderr: ${stderr}`);
          return reject(new Error(`${binaryName} 执行失败: ${error.message}`));
        }
        if (stderr) {
          logger.warn(`${binaryName} stderr: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  }

  static async createBackup() {
    const dbName = process.env.DB_NAME || 'equipment_management';
    const dbUser = process.env.DB_USER || 'root';
    const dbPass = process.env.DB_PASSWORD || 'password';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '3306';

    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const fileName = `backup_${dbName}_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    const filePath = path.join(backupDir, fileName);

    // 使用 mysqldump 进行备份
    const args = `-h ${dbHost} -P ${dbPort} -u ${dbUser} -p"${dbPass}" ${dbName} > "${filePath}"`;
    await this.execMySQLCommand('mysqldump', args);

    logger.info(`Backup successful: ${fileName}`);
    return { fileName, filePath };
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
    const dbName = process.env.DB_NAME || 'equipment_management';
    const dbUser = process.env.DB_USER || 'root';
    const dbPass = process.env.DB_PASSWORD || 'password';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '3306';

    const filePath = path.join(__dirname, '../backups', fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error('备份文件不存在');
    }

    // 使用 mysql 进行恢复
    const args = `-h ${dbHost} -P ${dbPort} -u ${dbUser} -p"${dbPass}" ${dbName} < "${filePath}"`;
    await this.execMySQLCommand('mysql', args);

    logger.info(`Restore successful from: ${fileName}`);
    return { success: true };
  }

  static async deleteBackup(fileName) {
    const filePath = path.join(__dirname, '../backups', fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    throw new Error('文件不存在');
  }
}

module.exports = BackupService;
