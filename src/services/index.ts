/**
 * @fileoverview 服务统一导出
 * @description 统一导出所有服务模块
 * @author 开发者
 * @created 2024-01-20
 */

// 导出HTTP客户端
export { http, get, post, put, patch } from '@/utils/http'
export type { ApiResponse, RequestConfig } from '@/utils/http'

// 导出认证服务
export { authService } from './authService';

// 导出用户服务
export { userService } from './userService';
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  UserDetailResponse
} from '@/types/user'

// 导出测试服务
export { TestService, testService } from './testService'
export type {
  TestData,
  CreateResourceResponse
} from './testService'

// 导出系统服务
export { SystemService, systemService } from './systemService'
export type { HealthCheckResponse } from './systemService'

// 导出域名服务
export { DomainService, domainService } from './domainService'
export type {
  DomainInfo,
  DomainCountInfo,
  GetDomainListResponse,
  GetDomainListParams
} from './domainService'