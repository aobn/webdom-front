/**
 * 登录API接口测试脚本
 * 使用Node.js直接测试登录接口是否成功接入
 */

const https = require('https');
const http = require('http');

// 测试数据
const testData = {
  email: 't@t.com',
  password: '12345678'
};

// API配置
const apiConfig = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

// 执行登录测试
function testLoginAPI() {
  console.log('🚀 开始测试登录API接口...');
  console.log('📧 测试邮箱:', testData.email);
  console.log('🔑 测试密码:', testData.password);
  console.log('🌐 API地址: http://localhost:8080/api/auth/login');
  console.log('=' .repeat(50));

  const postData = JSON.stringify(testData);
  
  const req = http.request(apiConfig, (res) => {
    console.log('📊 响应状态码:', res.statusCode);
    console.log('📋 响应头:', res.headers);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📦 响应数据:');
      console.log(responseData);
      
      try {
        const jsonResponse = JSON.parse(responseData);
        
        if (res.statusCode === 200 && jsonResponse.code === 200) {
          console.log('\n✅ 登录API测试成功!');
          console.log('🎉 接口已成功接入!');
          console.log('👤 用户信息:', {
            id: jsonResponse.data?.id,
            username: jsonResponse.data?.username,
            email: jsonResponse.data?.email
          });
          console.log('🔐 Token已获取:', jsonResponse.data?.token ? '是' : '否');
        } else {
          console.log('\n❌ 登录API测试失败!');
          console.log('💬 错误信息:', jsonResponse.message || '未知错误');
        }
      } catch (error) {
        console.log('\n❌ 响应数据解析失败!');
        console.log('🔍 原始响应:', responseData);
        console.log('💥 解析错误:', error.message);
      }
      
      console.log('\n' + '='.repeat(50));
      console.log('🏁 测试完成');
    });
  });
  
  req.on('error', (error) => {
    console.log('\n❌ 请求失败!');
    console.log('💥 错误信息:', error.message);
    console.log('🔍 可能原因:');
    console.log('  - API服务器未启动');
    console.log('  - 端口8080被占用或不可访问');
    console.log('  - 网络连接问题');
    console.log('\n💡 建议:');
    console.log('  1. 检查后端API服务是否在8080端口运行');
    console.log('  2. 确认登录接口路径是否正确');
    console.log('  3. 检查防火墙设置');
    console.log('\n' + '='.repeat(50));
    console.log('🏁 测试完成');
  });
  
  req.on('timeout', () => {
    console.log('\n⏰ 请求超时!');
    console.log('🔍 可能原因: API服务器响应缓慢或无响应');
    req.destroy();
  });
  
  // 设置超时时间
  req.setTimeout(10000);
  
  // 发送请求数据
  req.write(postData);
  req.end();
}

// 测试API健康状态
function testAPIHealth() {
  console.log('🏥 检查API服务健康状态...');
  
  const healthConfig = {
    hostname: 'localhost',
    port: 8080,
    path: '/health',
    method: 'GET'
  };
  
  const req = http.request(healthConfig, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ API服务健康状态正常');
        console.log('📊 健康检查响应:', responseData);
      } else {
        console.log('⚠️ API服务健康状态异常');
        console.log('📊 状态码:', res.statusCode);
      }
      
      // 健康检查完成后执行登录测试
      setTimeout(testLoginAPI, 1000);
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ API服务健康检查失败:', error.message);
    console.log('⚠️ 将直接进行登录接口测试...');
    
    // 即使健康检查失败也尝试登录测试
    setTimeout(testLoginAPI, 1000);
  });
  
  req.setTimeout(5000);
  req.end();
}

// 主函数
function main() {
  console.log('🔬 登录API接口测试工具');
  console.log('📅 测试时间:', new Date().toLocaleString('zh-CN'));
  console.log('=' .repeat(50));
  
  // 先检查API健康状态
  testAPIHealth();
}

// 启动测试
main();