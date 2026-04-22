const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'equipment_management',
};

const tables = [
  { table: 'Devices', columns: ['purchaseDate', 'warrantyEndDate', 'scrapDate'] },
  { table: 'Maintenances', columns: ['startDate', 'endDate'] },
  { table: 'MaintenancePlans', columns: ['lastMaintenance', 'nextMaintenance'] },
  { table: 'RunningData', columns: ['date'] },
  { table: 'RepairOrders', columns: ['applyDate', 'repairDate'] },
];

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected to database:', config.database);

    for (const { table, columns } of tables) {
      for (const col of columns) {
        try {
          // Strip time from existing values (safe even if already DATE)
          const [updateResult] = await connection.execute(
            `UPDATE \`${table}\` SET \`${col}\` = DATE(\`${col}\`) WHERE \`${col}\` IS NOT NULL`
          );
          console.log(`  [${table}.${col}] truncated times: ${updateResult.affectedRows} rows`);

          // Alter column to DATE if not already
          const [colInfo] = await connection.execute(
            `SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
            [config.database, table, col]
          );

          if (colInfo.length > 0 && colInfo[0].DATA_TYPE !== 'date') {
            await connection.execute(
              `ALTER TABLE \`${table}\` MODIFY \`${col}\` DATE NULL`
            );
            console.log(`  [${table}.${col}] altered to DATE`);
          } else {
            console.log(`  [${table}.${col}] already DATE`);
          }
        } catch (err) {
          console.error(`  [${table}.${col}] error:`, err.message);
        }
      }
    }

    console.log('\nMigration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
