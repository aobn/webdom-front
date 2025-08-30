/**
 * @fileoverview 用户服务
 * @description 用户相关API请求服务
 * @author 开发者
 * @created 2024-01-20
 */

import { http } from '@/utils/http'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  UserDetailResponse
} from '@/types/user'

/**
 * 用户服务类
 */
export class UserService {
  /**
   * 获取所有用户
   * @returns Promise<UserListResponse>
   */
  async getAllUsers(): Promise<UserListResponse> {
    return http.get<UserListResponse>('/api/users')
  }

  /**
   * 根据ID获取用户
   * @param id 用户ID
   * @returns Promise<UserDetailResponse>
   */
  async getUserById(id: number): Promise<UserDetailResponse> {
    return http.get<UserDetailResponse>(`/api/users/${id}`)
  }

  /**
   * 创建用户
   * @param userData 用户数据
   * @returns Promise<UserDetailResponse>
   */
  async createUser(userData: CreateUserRequest): Promise<UserDetailResponse> {
    return http.post<UserDetailResponse>('/api/users', userData)
  }

  /**
   * 更新用户
   * @param id 用户ID
   * @param userData 更新的用户数据
   * @returns Promise<UserDetailResponse>
   */
  async updateUser(id: number, userData: UpdateUserRequest): Promise<UserDetailResponse> {
    return http.put<UserDetailResponse>(`/api/users/${id}`, userData)
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns Promise<void>
   */
  async deleteUser(id: number): Promise<void> {
    return http.delete<void>(`/api/users/${id}`)
  }
}

// 创建并导出用户服务实例
export const userService = new UserService()

export default userService