const { sequelize } = require('./config/database');
const Department = require('./models/Department');

// 创建部门
async function createDepartment() {
  try {
    console.log('Creating department...');
    
    // 创建一个部门
    const department = await Department.create({
      name: 'Test Department',
      description: 'Test Department Description'
    });
    
    console.log(`Department created successfully: ID: ${department.id}, Name: ${department.name}, Description: ${department.description}`);
  } catch (error) {
    console.error('Error creating department:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 执行创建操作
createDepartment();