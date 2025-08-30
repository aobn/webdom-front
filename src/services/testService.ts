/**
 * @fileoverview API测试服务
 * @description API测试相关请求服务
 * @author 开发者
 * @created 2024-01-20
 */

import { http } from '@/utils/http'

/**
 * 测试数据接口
 */
export interface TestData {
  name: string
  age: number
  email: string
}

/**
 * 创建资源响应接口
 */
export interface CreateResourceResponse {
  id: number
  username: string
  password: string
  email: string
}

/**
 * API测试服务类
 */
export class TestService {
  /**
   * 测试成功响应
   * @returns Promise<string>
   */
  async testSuccess(): Promise<string> {
    return http.get<string>('/api/test/success')
  }

  /**
   * 测试带数据的成功响应
   * @returns Promise<TestData>
   */
  async testData(): Promise<TestData> {
    return http.get<TestData>('/api/test/data')
  }

  /**
   * 测试创建资源响应
   * @returns Promise<CreateResourceResponse>
   */
  async testCreate(): Promise<CreateResourceResponse> {
    return http.post<CreateResourceResponse>('/api/test/create')
  }

  /**
   * 测试列表数据响应
   * @returns Promise<string[]>
   */
  async testList(): Promise<string[]> {
    return http.get<string[]>('/api/test/list')
  }

  /**
   * 测试业务异常
   * @returns Promise<never> - 该接口总是抛出异常
   */
  async testBusinessError(): Promise<never> {
    return http.get('/api/test/business-error')
  }

  /**
   * 测试资源未找到异常
   * @param id 资源ID
   * @returns Promise<never> - 该接口总是抛出异常
   */
  async testNotFound(id: number): Promise<never> {
    return http.get(`/api/test/not-found/${id}`)
  }

  /**
   * 测试服务器错误
   * @returns Promise<never> - 该接口总是抛出异常
   */
  async testServerError(): Promise<never> {
    return http.get('/api/test/server-error')
  }
}

// 创建并导出测试服务实例
export const testService = new TestService()

export default testService