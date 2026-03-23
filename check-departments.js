const { sequelize } = require('./config/database');
const Department = require('./models/Department');

// 查询部门列表
async function checkDepartments() {
  try {
    console.log('Checking departments...');
    
    // 查询所有部门
    const departments = await Department.findAll();
    
    console.log(`Found ${departments.length} departments:`);
    departments.forEach(department => {
      console.log(`ID: ${department.id}, Name: ${department.name}, Description: ${department.description}`);
    });
  } catch (error) {
    console.error('Error checking departments:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 执行查询操作
checkDepartments();