# TypeScript 编码规范

## 概述

本文档定义了 TypeScript 在 Vue 3 项目中的编码规范，包括类型定义、接口设计、泛型使用等最佳实践。

## 基本类型规范

### 基础类型定义
```typescript
// ✅ 明确的基础类型
const userName: string = 'John Doe'
const userAge: number = 25
const isActive: boolean = true
const tags: string[] = ['vue', 'typescript']
const scores: number[] = [85, 92, 78]

// ✅ 使用 Array<T> 语法（复杂类型）
const users: Array<User> = []
const responses: Array<ApiResponse<User>> = []

// ❌ 避免使用 any
const data: any = {} // 不推荐

// ✅ 使用 unknown 替代 any
const data: unknown = {}
if (typeof data === 'object' && data !== null) {
  // 类型守卫后使用
}
```

### 联合类型和字面量类型
```typescript
// ✅ 字面量类型
type Theme = 'light' | 'dark' | 'auto'
type Size = 'small' | 'medium' | 'large'
type Status = 'pending' | 'success' | 'error'

// ✅ 联合类型
type ID = string | number
type Response = SuccessResponse | ErrorResponse

// ✅ 可选类型
type User = {
  id: number
  name: string
  email?: string // 可选属性
  avatar?: string | null // 可选且可为 null
}
```

## 接口定义规范

### 接口命名和结构
```typescript
/**
 * 用户信息接口
 * 定义用户的基本属性和方法
 */
interface User {
  readonly id: number // 只读属性
  name: string
  email: string
  createdAt: Date
  updatedAt?: Date
}

/**
 * API 响应接口
 * 统一的 API 响应格式
 */
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

/**
 * 分页接口
 * 用于列表数据的分页信息
 */
interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * 分页响应接口
 * 继承基础响应接口
 */
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination
}
```

### 接口继承和扩展
```typescript
// ✅ 基础接口
interface BaseEntity {
  id: number
  createdAt: Date
  updatedAt: Date
}

// ✅ 继承基础接口
interface User extends BaseEntity {
  name: string
  email: string
  role: UserRole
}

// ✅ 接口合并
interface User {
  avatar?: string // 扩展 User 接口
}

// ✅ 条件类型接口
interface CreateUserRequest extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  password: string
}

interface UpdateUserRequest extends Partial<Pick<User, 'name' | 'email' | 'avatar'>> {
  id: number
}
```

## 类型别名规范

### 复杂类型定义
```typescript
// ✅ 函数类型
type EventHandler<T = Event> = (event: T) => void
type AsyncHandler<T, R> = (data: T) => Promise<R>
type Validator<T> = (value: T) => boolean | string

// ✅ 对象类型
type UserPermissions = {
  read: boolean
  write: boolean
  delete: boolean
}

// ✅ 映射类型
type PartialUser = Partial<User>
type RequiredUser = Required<User>
type UserKeys = keyof User
type UserValues = User[keyof User]

// ✅ 条件类型
type NonNullable<T> = T extends null | undefined ? never : T
type ApiResult<T> = T extends string ? string : T extends number ? number : unknown
```

### 工具类型使用
```typescript
// ✅ 内置工具类型
type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
type UpdateUser = Partial<Pick<User, 'name' | 'email'>>
type UserRecord = Record<string, User>
type UserStatus = Extract<Status, 'active' | 'inactive'>
type NonUserFields = Exclude<keyof User, 'name' | 'email'>

// ✅ 自定义工具类型
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>

// 使用示例
type UserWithOptionalEmail = Optional<User, 'email'>
type UserWithRequiredAvatar = RequireField<User, 'avatar'>
```

## 泛型使用规范

### 泛型函数
```typescript
/**
 * 通用的 API 请求函数
 * @param url 请求地址
 * @param options 请求选项
 * @returns Promise<T> 响应数据
 */
async function apiRequest<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(url, options)
  return response.json()
}

/**
 * 数组去重函数
 * @param array 输入数组
 * @param keyFn 键提取函数
 * @returns T[] 去重后的数组
 */
function uniqueBy<T, K>(
  array: T[],
  keyFn: (item: T) => K
): T[] {
  const seen = new Set<K>()
  return array.filter(item => {
    const key = keyFn(item)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

// 使用示例
const users = await apiRequest<User[]>('/api/users')
const uniqueUsers = uniqueBy(users.data, user => user.id)
```

### 泛型类和接口
```typescript
/**
 * 通用的数据存储类
 * 提供基本的 CRUD 操作
 */
class DataStore<T extends { id: number }> {
  private items: Map<number, T> = new Map()

  /**
   * 添加项目
   * @param item 要添加的项目
   */
  add(item: T): void {
    this.items.set(item.id, item)
  }

  /**
   * 获取项目
   * @param id 项目ID
   * @returns T | undefined 项目或undefined
   */
  get(id: number): T | undefined {
    return this.items.get(id)
  }

  /**
   * 获取所有项目
   * @returns T[] 所有项目
   */
  getAll(): T[] {
    return Array.from(this.items.values())
  }
}

// 使用示例
const userStore = new DataStore<User>()
const productStore = new DataStore<Product>()
```

### 泛型约束
```typescript
// ✅ 基础约束
interface Identifiable {
  id: number
}

function updateEntity<T extends Identifiable>(
  entity: T,
  updates: Partial<Omit<T, 'id'>>
): T {
  return { ...entity, ...updates }
}

// ✅ 键约束
function getProperty<T, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key]
}

// ✅ 条件约束
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

function getStringProperty<T, K extends StringKeys<T>>(
  obj: T,
  key: K
): T[K] {
  return obj[key]
}
```

## 模块和导入导出规范

### 导出规范
```typescript
// ✅ 命名导出（推荐）
export interface User {
  id: number
  name: string
}

export type UserRole = 'admin' | 'user' | 'guest'

export class UserService {
  // 类实现
}

export const DEFAULT_PAGE_SIZE = 20

// ✅ 默认导出（适用于主要功能）
export default class ApiClient {
  // 类实现
}

// ✅ 重新导出
export { User, UserRole } from './types'
export * from './constants'
```

### 导入规范
```typescript
// ✅ 具名导入
import { ref, computed, onMounted } from 'vue'
import { User, UserRole, UserService } from '@/types/user'
import { apiRequest } from '@/utils/api'

// ✅ 默认导入
import ApiClient from '@/services/ApiClient'
import UserProfile from '@/components/UserProfile.vue'

// ✅ 类型导入
import type { Component } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

// ✅ 命名空间导入
import * as userUtils from '@/utils/user'
import * as userTypes from '@/types/user'

// ✅ 动态导入
const HeavyComponent = defineAsyncComponent(
  () => import('@/components/HeavyComponent.vue')
)
```

## 类型守卫和断言

### 类型守卫函数
```typescript
/**
 * 检查值是否为字符串
 * @param value 要检查的值
 * @returns boolean 是否为字符串
 */
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 检查对象是否为用户类型
 * @param obj 要检查的对象
 * @returns boolean 是否为用户类型
 */
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    typeof (obj as any).id === 'number' &&
    typeof (obj as any).name === 'string'
  )
}

/**
 * 检查数组是否为用户数组
 * @param arr 要检查的数组
 * @returns boolean 是否为用户数组
 */
function isUserArray(arr: unknown): arr is User[] {
  return Array.isArray(arr) && arr.every(isUser)
}

// 使用示例
function processData(data: unknown): void {
  if (isUser(data)) {
    // data 现在是 User 类型
    console.log(data.name)
  } else if (isUserArray(data)) {
    // data 现在是 User[] 类型
    data.forEach(user => console.log(user.name))
  }
}
```

### 类型断言
```typescript
// ✅ 安全的类型断言
function processApiResponse(response: unknown): User {
  // 先进行类型检查
  if (!isUser(response)) {
    throw new Error('Invalid user data')
  }
  
  // 安全的断言
  return response as User
}

// ✅ DOM 元素断言
const button = document.getElementById('submit-btn') as HTMLButtonElement
if (button) {
  button.disabled = true
}

// ❌ 避免强制断言
const user = data as User // 不安全，可能导致运行时错误

// ✅ 使用类型守卫替代
if (isUser(data)) {
  const user = data // 安全的类型收窄
}
```

## 枚举使用规范

### 字符串枚举（推荐）
```typescript
/**
 * 用户角色枚举
 */
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

/**
 * API 状态枚举
 */
enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// 使用示例
const currentRole: UserRole = UserRole.ADMIN
const status: ApiStatus = ApiStatus.LOADING
```

### 常量枚举
```typescript
// ✅ 常量枚举（编译时内联）
const enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

// 编译后会被内联
const move = Direction.UP // 编译为 const move = 'up'
```

### 联合类型替代枚举
```typescript
// ✅ 使用联合类型（更灵活）
type Theme = 'light' | 'dark' | 'auto'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// ✅ 配合常量对象
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const

type Theme = typeof THEMES[keyof typeof THEMES]
```

## 错误处理类型

### 错误类型定义
```typescript
/**
 * 基础错误接口
 */
interface BaseError {
  code: string
  message: string
  timestamp: number
}

/**
 * API 错误接口
 */
interface ApiError extends BaseError {
  status: number
  details?: Record<string, any>
}

/**
 * 验证错误接口
 */
interface ValidationError extends BaseError {
  field: string
  value: any
}

/**
 * 错误联合类型
 */
type AppError = ApiError | ValidationError | BaseError
```

### Result 类型模式
```typescript
/**
 * 结果类型，用于错误处理
 */
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * 安全的异步操作
 * @param operation 异步操作函数
 * @returns Promise<Result<T, E>> 操作结果
 */
async function safeAsync<T, E = Error>(
  operation: () => Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error as E }
  }
}

// 使用示例
const result = await safeAsync(() => fetchUser(123))
if (result.success) {
  console.log(result.data.name) // 类型安全
} else {
  console.error(result.error) // 错误处理
}
```

## 配置和环境类型

### 环境变量类型
```typescript
/**
 * 环境变量接口
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_MOCK: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 使用示例
const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL
const isDev: boolean = import.meta.env.DEV
```

### 配置类型
```typescript
/**
 * 应用配置接口
 */
interface AppConfig {
  api: {
    baseUrl: string
    timeout: number
    retries: number
  }
  ui: {
    theme: Theme
    language: string
    pageSize: number
  }
  features: {
    enableMock: boolean
    enableAnalytics: boolean
  }
}

/**
 * 配置验证函数
 * @param config 配置对象
 * @returns boolean 配置是否有效
 */
function validateConfig(config: unknown): config is AppConfig {
  // 配置验证逻辑
  return true
}
```

## 最佳实践

### 1. 类型优先设计
```typescript
// ✅ 先定义类型，再实现功能
interface UserService {
  getUser(id: number): Promise<User>
  createUser(data: CreateUserRequest): Promise<User>
  updateUser(id: number, data: UpdateUserRequest): Promise<User>
  deleteUser(id: number): Promise<void>
}

class UserServiceImpl implements UserService {
  // 实现接口
}
```

### 2. 渐进式类型增强
```typescript
// ✅ 从宽松到严格
// 第一阶段：基本类型
interface User {
  id: number
  name: string
  email: string
}

// 第二阶段：添加可选属性
interface User {
  avatar?: string
  lastLoginAt?: Date
}

// 第三阶段：添加严格约束
interface User {
  email: string & { readonly brand: unique symbol } // 品牌类型
}
```

### 3. 类型文档化
```typescript
/**
 * 用户状态类型
 * 
 * @example
 * ```typescript
 * const status: UserStatus = 'active'
 * if (status === 'active') {
 *   // 用户处于活跃状态
 * }
 * ```
 */
type UserStatus = 
  | 'active'    // 活跃用户
  | 'inactive'  // 非活跃用户
  | 'suspended' // 暂停用户
  | 'deleted'   // 已删除用户
```

## 相关链接

- [返回主规范文档](./代码编写约定规则.md)
- [Vue 组件编写规范](./vue-component-rules.md)
- [Vuetify 组件使用规范](./vuetify-rules.md)
- [TypeScript 官方文档](https://www.typescriptlang.org/)