// 测试DNSPod域名接口对接
const testDomainAPI = async () => {
  try {
    console.log('开始测试DNSPod域名接口...');
    
    const response = await fetch('http://localhost:8080/api/dnspod/domains', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('响应状态:', response.status);
    console.log('响应状态文本:', response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('接口响应数据:', JSON.stringify(data, null, 2));
    
    // 检查响应结构
    if (data.code === 200 && data.data && data.data.domainList) {
      console.log('✅ 接口对接成功!');
      console.log(`获取到 ${data.data.domainList.length} 个域名`);
      
      // 提取域名后缀
      const suffixes = [...new Set(data.data.domainList.map(domain => {
        const parts = domain.name.split('.');
        return '.' + parts.slice(1).join('.');
      }))];
      
      console.log('可用域名后缀:', suffixes);
    } else {
      console.log('❌ 接口响应格式不正确');
      console.log('实际响应结构:', Object.keys(data.data || {}));
    }
    
  } catch (error) {
    console.error('❌ 接口测试失败:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('提示: 请确保后端服务器正在运行在 http://localhost:8080');
    }
  }
};

// 执行测试
testDomainAPI();