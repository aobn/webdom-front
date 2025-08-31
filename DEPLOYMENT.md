# EdgeOne Pages 部署配置

## API代理配置

本项目已配置EdgeOne Pages的API代理规则，将前端的 `/api/*` 请求代理到后端服务器 `https://db.goxi.top/`。

### 配置文件

1. **public/_redirects** - EdgeOne Pages重定向规则
2. **public/edgeone-pages.json** - EdgeOne Pages完整配置
3. **edgeone.config.json** - EdgeOne配置文件
4. **vite.config.ts** - 开发环境代理配置

### 代理规则

- 前端请求: `/api/users` 
- 实际请求: `https://db.goxi.top/api/users`

### 部署步骤

1. 构建项目：
   ```bash
   npm run build
   ```

2. 将 `dist` 目录上传到EdgeOne Pages

3. EdgeOne Pages会自动识别配置文件并应用代理规则

### 开发环境

开发环境中，vite会自动将 `/api/*` 请求代理到 `https://db.goxi.top/api/*`，确保开发和生产环境的一致性。

### 注意事项

- 后端服务器已配置CORS，支持跨域请求
- 所有API请求都会通过HTTPS进行
- 代理配置支持所有HTTP方法（GET, POST, PUT, DELETE等）