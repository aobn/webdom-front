# EdgeOne Pages 部署配置

## API代理配置

本项目已配置EdgeOne Pages的API代理规则，将前端的 `/api/*` 请求代理到后端服务器 `https://db.goxi.top/`。

### 配置文件

1. **public/_redirects** - EdgeOne Pages重定向规则
2. **public/_headers** - CORS头配置  
3. **public/edgeone-pages.json** - EdgeOne Pages配置
4. **edge-pages.config.js** - EdgeOne Pages配置文件
5. **.env.production** - 生产环境变量
6. **vite.config.mts** - 开发环境代理配置
+++++++ REPLACE</div>
</replace_in_file>

<replace_in_file>
<path>DEPLOYMENT.md</path>
<diff>------- SEARCH
### 部署步骤

1. 构建项目：
   ```bash
   npm run build
   ```

2. 将 `dist` 目录上传到EdgeOne Pages

3. 在EdgeOne Pages控制台中配置：
   - 确保启用了函数功能 (Functions)
   - 检查重写规则是否生效
   - 验证CORS配置
   - 如果使用Cloudflare Pages，确保启用了Edge Functions

### EdgeOne Pages特殊配置

如果仍然遇到405错误，请在EdgeOne Pages控制台中：

1. **启用Functions功能**
2. **添加环境变量**（如果需要）
3. **检查域名绑定**
4. **验证SSL证书**

### Cloudflare Pages配置

如果使用Cloudflare Pages：
1. 确保启用了Functions
2. 检查_routes.json配置
3. 验证_middleware.js是否正确部署
=======
### 部署步骤

1. 构建项目：
   ```bash
   npm run build
   ```

2. 将 `dist` 目录上传到EdgeOne Pages

3. 在EdgeOne Pages控制台中配置路由规则：
   ```
   /api/* -> https://db.goxi.top/api/:splat (200)
   /* -> /index.html (200)
   ```

### EdgeOne Pages配置说明

项目包含以下配置文件，EdgeOne Pages会自动识别：

1. **`public/_redirects`** - 自动配置路由重定向
2. **`public/_headers`** - 自动配置CORS头部
3. **`edge-pages.config.js`** - EdgeOne Pages配置文件

### 环境变量配置

确保以下环境变量正确设置：
- `VITE_API_BASE_URL`: https://db.goxi.top

### 测试用例

部署完成后，可以使用以下测试用例验证功能：

**成功案例：**
- 邮箱: 12345678@example.com
- 密码: 12345678

### 代理规则

- 前端请求: `/api/users` 
- 实际请求: `https://db.goxi.top/api/users`

### 部署步骤

1. 构建项目：
   ```bash
   npm run build
   ```

2. 将 `dist` 目录上传到EdgeOne Pages

3. 在EdgeOne Pages控制台中配置：
   - 确保启用了函数功能 (Functions)
   - 检查重写规则是否生效
   - 验证CORS配置
   - 如果使用Cloudflare Pages，确保启用了Edge Functions

### EdgeOne Pages特殊配置

如果仍然遇到405错误，请在EdgeOne Pages控制台中：

1. **启用Functions功能**
2. **添加环境变量**（如果需要）
3. **检查域名绑定**
4. **验证SSL证书**

### Cloudflare Pages配置

如果使用Cloudflare Pages：
1. 确保启用了Functions
2. 检查_routes.json配置
3. 验证_middleware.js是否正确部署

### 故障排除

如果API请求仍然失败，请检查：

1. **EdgeOne Pages控制台**：
   - 查看函数日志
   - 检查重写规则配置
   - 验证域名绑定

2. **浏览器开发者工具**：
   - 检查网络请求是否正确代理
   - 查看CORS错误信息
   - 验证请求头设置

3. **备用方案**：
   如果代理不工作，可以直接修改前端代码使用完整URL：
   ```javascript
   // 在 src/utils/http.ts 中修改 baseURL
   baseURL: 'https://db.goxi.top'
   ```

### 开发环境

开发环境中，vite会自动将 `/api/*` 请求代理到 `https://db.goxi.top/api/*`，确保开发和生产环境的一致性。

### 注意事项

- 后端服务器已配置CORS，支持跨域请求
- 所有API请求都会通过HTTPS进行
- 代理配置支持所有HTTP方法（GET, POST, PUT, DELETE等）