# HTTP 请求工具使用说明

## 概述

本项目实现了基于 axios 的全局请求拦截器，提供统一的 HTTP 请求处理、错误处理和响应格式化功能。

## 功能特性

### 1. 全局配置
- **Base URL**: `http://localhost:8080`（根据后端接口文档配置）
- **超时时间**: 10秒
- **默认请求头**: `Content-Type: application/json`

### 2. 请求拦截器
- 自动添加请求日志
- 支持认证 token 自动添加（预留功能）
- 请求参数格式化

### 3. 响应拦截器
- 统一响应格式处理
- 自动解析业务状态码（200/201 为成功）
- 全局错误处理和用户友好的错误提示

### 4. 错误处理
根据 HTTP 状态码提供不同的错误处理：
- **400**: 请求参数错误
- **401**: 未授权，需要重新登录
- **403**: 权限不足
- **404**: 请求的资源不存在
- **409**: 资源冲突
- **423**: 账户已锁定
- **500**: 服务器内部错误

## 使用方法

### 1. 基本使用

```typescript
import { http } from '@/utils/http'

// GET 请求
const users = await http.get('/api/users')

// POST 请求
const newUser = await http.post('/api/users', {
  username: 'testuser',
  password: 'password123',
  email: 'test@example.com'
})

// PUT 请求
const updatedUser = await http.put('/api/users/1', {
  username: 'updateduser'
})

// DELETE 请求
await http.delete('/api/users/1')
```

### 2. 使用便捷方法

```typescript
import { get, post, put, patch } from '@/utils/http'

// 直接使用导出的方法
const users = await get('/api/users')
const newUser = await post('/api/users', userData)
```

### 3. 在服务类中使用

```typescript
// src/services/userService.ts
import { http } from '@/utils/http'
import type { User, CreateUserRequest } from '@/types/user'

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return http.get<User[]>('/api/users')
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return http.post<User>('/api/users', userData)
  }
}
```

## API 响应格式

根据后端接口文档，所有 API 响应都遵循统一格式：

```typescript
interface ApiResponse<T> {
  code: number        // 业务状态码
  message: string     // 响应消息
  data: T            // 响应数据
  timestamp: string   // 时间戳
}
```

### 成功响应示例
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  },
  "timestamp": "2025-08-11T00:11:11.572155"
}
```

### 错误响应示例
```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null,
  "timestamp": "2025-08-11T00:30:00+08:00"
}
```

## 测试

### 1. 单元测试
项目包含完整的单元测试，使用 Vitest + Vue Test Utils：

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试（一次性）
npm run test:run
```

### 2. API 测试页面
访问 `/api-test` 页面可以测试所有 API 接口：
- 用户管理接口测试
- API 测试接口（成功/错误场景）
- 系统健康检查

## 配置说明

### 1. 修改 Base URL
在 `src/utils/http.ts` 中修改 `baseURL` 配置：

```typescript
this.instance = axios.create({
  baseURL: 'http://your-api-server.com', // 修改为你的 API 服务器地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 2. 添加认证支持
在请求拦截器中取消注释认证相关代码：

```typescript
// 在请求拦截器中添加
const token = localStorage.getItem('token')
if (token) {
  config.headers.Authorization = `Bearer ${token}`
}
```

### 3. 自定义错误处理
可以在响应拦截器中添加自定义错误处理逻辑，如登录跳转、全局提示等。

## 最佳实践

1. **类型安全**: 使用 TypeScript 类型定义确保请求和响应的类型安全
2. **错误处理**: 在组件中使用 try-catch 处理异步请求错误
3. **加载状态**: 在 UI 中显示加载状态，提升用户体验
4. **请求取消**: 对于长时间运行的请求，考虑实现请求取消功能
5. **缓存策略**: 根据业务需求实现适当的缓存策略

## 相关文件

- `src/utils/http.ts` - HTTP 客户端实现
- `src/services/` - API 服务封装
- `src/types/` - 类型定义
- `src/pages/ApiTest.vue` - API 测试页面
- `src/services/__tests__/` - 单元测试