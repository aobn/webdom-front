export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // 如果是API请求，代理到后端
  if (url.pathname.startsWith('/api/')) {
    const targetUrl = `https://db.goxi.top${url.pathname}${url.search}`;
    
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
    });
    
    // 添加CORS头
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
  
  // 其他请求继续正常处理
  return context.next();
}