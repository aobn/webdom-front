/**
 * @fileoverview 域名API服务
 * @description 提供域名DNS记录相关的API接口
 * @author 开发团队
 * @created 2024-01-20
 * @version 1.0.0
 */

import { request } from '@/utils/request'
import type { UpdateDnsRecordParams } from '@/stores/domain'

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 域名API服务
 */
export const domainApi = {
  /**
   * 修改3级域名解析记录
   * @param params - 请求参数
   * @returns API响应
   */
  updateDnsRecord(params: UpdateDnsRecordParams): Promise<ApiResponse> {
    return request({
      url: '/api/domain/dns/update',
      method: 'POST',
      data: params
    })
  },

  /**
   * 获取域名解析记录列表
   * @param domain - 域名
   * @returns API响应
   */
  getDnsRecords(domain: string): Promise<ApiResponse> {
    return request({
      url: '/api/domain/dns/list',
      method: 'GET',
      params: { domain }
    })
  },

  /**
   * 删除DNS解析记录
   * @param recordId - 记录ID
   * @returns API响应
   */
  deleteDnsRecord(recordId: string): Promise<ApiResponse> {
    return request({
      url: `/api/domain/dns/delete/${recordId}`,
      method: 'DELETE'
    })
  }
}