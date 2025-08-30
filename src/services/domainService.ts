/**
 * @fileoverview 域名服务
 * @description 提供域名相关的API服务
 * @author 开发者
 * @created 2024-01-20
 */

import { http } from '@/utils/http'
import type { ApiResponse } from '@/utils/http'

/**
 * 域名信息接口
 */
export interface DomainInfo {
  CNAMESpeedup: string
  CreatedOn: string
  DNSStatus: string
  DomainId: number
  EffectiveDNS: string[]
  Grade: string
  GradeLevel: number
  GradeTitle: string
  GroupId: number
  IsVip: string
  Name: string
  Owner: string
  Punycode: string
  RecordCount: number
  Remark: string
  SearchEnginePush: string
  Status: string
  TTL: number
  UpdatedOn: string
  VipAutoRenew: string
  VipEndAt: string
  VipStartAt: string
  TagList: Array<{
    TagKey: string
    TagValue: string
  }>
}

/**
 * 域名统计信息接口
 */
export interface DomainCountInfo {
  AllTotal: number
  DomainTotal: number
  ErrorTotal: number
  GroupTotal: number
  LockTotal: number
  MineTotal: number
  PauseTotal: number
  ShareOutTotal: number
  ShareTotal: number
  SpamTotal: number
  VipExpire: number
  VipTotal: number
}

/**
 * 获取域名列表响应接口
 */
export interface GetDomainListResponse {
  DomainCountInfo: DomainCountInfo
  domainList: DomainInfo[]
  RequestId: string
}

/**
 * 获取域名列表请求参数接口
 */
export interface GetDomainListParams {
  type?: string
  offset?: number
  limit?: number
  groupId?: number
  keyword?: string
}

/**
 * 三级域名解析记录接口
 */
export interface SubdomainRecord {
  id: number
  userId: number
  subdomain: string
  domain: string
  recordId: number
  ipAddress: string
  ttl: number
  status: string
  remark: string
  createTime: string
  updateTime: string
}

/**
 * 获取三级域名解析列表请求参数接口
 */
export interface GetSubdomainListParams {
  subdomain: string
  domain?: string
}

/**
 * 域名服务类
 */
export class DomainService {
  /**
   * 获取域名列表
   * @param params 查询参数
   * @returns Promise<ApiResponse<GetDomainListResponse>>
   */
  async getDomainList(params?: GetDomainListParams): Promise<ApiResponse<GetDomainListResponse>> {
    return http.get<ApiResponse<GetDomainListResponse>>('/api/dnspod/domains', {
      params
    })
  }

  /**
   * 获取可用域名后缀列表
   * 直接调用域名后缀接口
   * @returns Promise<string[]>
   */
  async getAvailableSuffixes(): Promise<string[]> {
    try {
      const response = await http.get<ApiResponse<string[]>>('/api/domains/suffixes')
      if (response.data && response.code === 200) {
        return response.data
      }
      return this.getDefaultSuffixes()
    } catch (error) {
      console.error('获取可用域名后缀失败:', error)
      return this.getDefaultSuffixes()
    }
  }

  /**
   * 获取默认域名后缀
   * @returns string[]
   */
  private getDefaultSuffixes(): string[] {
    return ['cblog.eu', 'test23.cblog.eu', 'twodoller.store', 'vvvv.host']
  }

  /**
   * 获取三级域名解析列表
   * @param params 查询参数
   * @returns Promise<ApiResponse<SubdomainRecord[]>>
   */
  async getSubdomainList(params: GetSubdomainListParams): Promise<ApiResponse<SubdomainRecord[]>> {
    return http.post<ApiResponse<SubdomainRecord[]>>('/api/user/domains/subdomains/list', {
      subdomain: params.subdomain,
      domain: params.domain || 'cblog.eu'
    })
  }
}

// 导出域名服务实例
export const domainService = new DomainService()