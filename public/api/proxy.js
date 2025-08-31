export default async function handler(request) {
  const url = new URL(request.url);
  const apiPath = url.pathname.replace('/api/', '');
  
  // 构建目标URL
  const targetUrl = `https://db.goxi.top/api/${apiPath}${url.search}`;
  
  // 转发请求
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: {
      ...request.headers,
      'Origin': 'https://db.goxi.top'
    },
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
  });
  
  // 添加CORS头
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...response.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    }
  });
  
  return newResponse;
}