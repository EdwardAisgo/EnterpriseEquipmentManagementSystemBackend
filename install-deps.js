const { execSync } = require('child_process');

// 要安装的依赖
const dependencies = [
  'bcryptjs'
];

console.log('Installing dependencies...');

try {
  // 使用npm命令安装依赖
  execSync(`npm install ${dependencies.join(' ')}`, {
    stdio: 'inherit',
    shell: true
  });
  
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}