/**
 * @fileoverview 用户相关类型定义
 * @description 定义用户数据结构和相关接口
 * @author 开发者
 * @created 2024-01-20
 */

/**
 * 用户信息接口
 */
export interface User {
  id: number
  username: string
  password: string
  email: string
}

/**
 * 创建用户请求参数
 */
export interface CreateUserRequest {
  username: string
  password: string
  email: string
}

/**
 * 更新用户请求参数
 */
export interface UpdateUserRequest {
  username?: string
  password?: string
  email?: string
}

/**
 * 用户列表响应
 */
export type UserListResponse = User[]

/**
 * 用户详情响应
 */
export type UserDetailResponse = User