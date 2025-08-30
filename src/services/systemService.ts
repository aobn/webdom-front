/**
 * @fileoverview 系统服务
 * @description 系统相关API请求服务
 * @author 开发者
 * @created 2024-01-20
 */

import { http } from '@/utils/http'

/**
 * 健康检查响应接口
 */
export interface HealthCheckResponse {
  status: string
  timestamp: string
  version?: string
  uptime?: number
  [key: string]: any
}

/**
 * 系统服务类
 */
export class SystemService {
  /**
   * 健康检查
   * @returns Promise<HealthCheckResponse>
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return http.get<HealthCheckResponse>('/health')
  }
}

// 创建并导出系统服务实例
export const systemService = new SystemService()

export default systemService