/**
 * @fileoverview DNS记录服务
 * @description 处理DNS记录相关的API调用
 * @author 开发团队
 * @created 2024-01-20
 * @version 1.0.0
 */

import { http } from '@/utils/http'

export interface DnsQueryParams {
  subdomainId?: number
  type?: string
  status?: string
  syncStatus?: string
  offset?: number
  limit?: number
}

export interface DnsRecord {
  id: number
  userId: number
  subdomainId: number
  recordId: number
  name: string
  type: string
  value: string
  line: string
  lineId: string
  ttl: number
  mx?: number
  weight?: number
  status: string
  remark: string
  monitorStatus: string
  updatedOn: string
  syncStatus: string
  syncError?: string
  createTime: string
  updateTime: string
}

export interface DnsRecordCreateParams {
  subdomainId: number
  name: string
  type: string
  value: string
  ttl: number
  line?: string
  mx?: number | null
  weight?: number | null
  remark?: string
}

export interface DnsRecordUpdateParams {
  name?: string
  type?: string
  value?: string
  ttl?: number
  line?: string
  mx?: number | null
  weight?: number | null
  status?: string
  remark?: string
}

/**
 * DNS记录服务类
 */
class DnsService {
  /**
   * 查询DNS记录
   * @param params 查询参数
   * @returns Promise<ApiResponse<DnsRecord[]>>
   */
  async queryDnsRecords(params: DnsQueryParams) {
    return await http.post('/api/user/dns-records/query', params)
  }

  /**
   * 查询指定子域名的所有DNS记录
   * @param subdomainId 子域名ID
   * @returns Promise<ApiResponse<DnsRecord[]>>
   */
  async getDnsRecordsBySubdomain(subdomainId: number) {
    return await this.queryDnsRecords({ subdomainId })
  }

  /**
   * 按类型查询DNS记录
   * @param type 记录类型
   * @param subdomainId 可选的子域名ID
   * @returns Promise<ApiResponse<DnsRecord[]>>
   */
  async getDnsRecordsByType(type: string, subdomainId?: number) {
    return await this.queryDnsRecords({ type, subdomainId })
  }

  /**
   * 按状态查询DNS记录
   * @param status 记录状态
   * @param subdomainId 可选的子域名ID
   * @returns Promise<ApiResponse<DnsRecord[]>>
   */
  async getDnsRecordsByStatus(status: string, subdomainId?: number) {
    return await this.queryDnsRecords({ status, subdomainId })
  }

  /**
   * 按同步状态查询DNS记录
   * @param syncStatus 同步状态
   * @param subdomainId 可选的子域名ID
   * @returns Promise<ApiResponse<DnsRecord[]>>
   */
  async getDnsRecordsBySyncStatus(syncStatus: string, subdomainId?: number) {
    return await this.queryDnsRecords({ syncStatus, subdomainId })
  }

  /**
   * 分页查询DNS记录
   * @param offset 偏移量
   * @param limit 限制数量
   * @param subdomainId 可选的子域名ID
   * @returns Promise<ApiResponse<DnsRecord[]>>
   */
  async getDnsRecordsWithPagination(offset: number, limit: number, subdomainId?: number) {
    return await this.queryDnsRecords({ offset, limit, subdomainId })
  }

  /**
   * 复合条件查询DNS记录
   * @param params 查询参数
   * @returns Promise<ApiResponse<DnsRecord[]>>
   */
  async getDnsRecordsWithFilters(params: DnsQueryParams) {
    return await this.queryDnsRecords(params)
  }

  /**
   * 创建DNS记录
   * @param params 创建参数
   * @returns Promise<ApiResponse<DnsRecord>>
   */
  async createDnsRecord(params: DnsRecordCreateParams) {
    return await http.post('/api/user/dns-records', params)
  }

  /**
   * 更新DNS记录
   * @param id DNS记录的主键ID
   * @param params 更新参数
   * @returns Promise<ApiResponse<DnsRecord>>
   */
  async updateDnsRecord(id: number, params: DnsRecordUpdateParams) {
    // 根据接口文档，使用POST方法调用修改接口，id是DNS记录的主键ID
    return await http.post('/api/user/dns-records/modify', {
      id: id,
      ...params
    })
  }

  /**
   * 删除DNS记录
   * @param id DNS记录ID
   * @returns Promise<ApiResponse<void>>
   */
  async deleteDnsRecord(id: number) {
    return await http.delete(`/api/user/dns-records/${id}`)
  }

  /**
   * 启用DNS记录
   * @param id DNS记录的主键ID
   * @returns Promise<ApiResponse<void>>
   */
  async enableDnsRecord(id: number) {
    return await this.updateDnsRecord(id, { status: 'ENABLE' })
  }

  /**
   * 禁用DNS记录
   * @param id DNS记录的主键ID
   * @returns Promise<ApiResponse<void>>
   */
  async disableDnsRecord(id: number) {
    return await this.updateDnsRecord(id, { status: 'DISABLE' })
  }

  /**
   * 重新同步DNS记录
   * @param recordId 记录ID
   * @returns Promise<ApiResponse<void>>
   */
  async resyncDnsRecord(recordId: number) {
    return await http.post(`/api/user/dns-records/${recordId}/sync`)
  }
}

// 导出DNS服务实例
export const dnsService = new DnsService()