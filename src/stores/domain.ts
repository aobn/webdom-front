/**
 * @fileoverview 域名管理状态存储
 * @description 管理域名DNS记录的状态和操作
 * @author 开发团队
 * @created 2024-01-20
 * @version 1.0.0
 */

import { defineStore } from 'pinia'
import { domainApi } from '@/services/domainApi'

/**
 * DNS记录接口
 */
export interface DnsRecord {
  id: string
  subdomain: string
  recordType: 'A' | 'CNAME' | 'MX' | 'TXT' | 'AAAA'
  recordValue: string
  ttl: number
  status: 'active' | 'inactive'
}

/**
 * 域名状态接口
 */
export interface DomainState {
  dnsRecords: DnsRecord[]
  loading: boolean
  currentDomain: string
}

/**
 * DNS记录更新参数接口
 */
export interface UpdateDnsRecordParams {
  id?: string
  domain: string
  subdomain: string
  recordType: string
  recordValue: string
  ttl: number
}

export const useDomainStore = defineStore('domain', {
  state: (): DomainState => ({
    dnsRecords: [],
    loading: false,
    currentDomain: ''
  }),

  getters: {
    // 按记录类型分组的DNS记录
    recordsByType: (state): Record<string, DnsRecord[]> => {
      const grouped: Record<string, DnsRecord[]> = {}
      state.dnsRecords.forEach(record => {
        if (!grouped[record.recordType]) {
          grouped[record.recordType] = []
        }
        grouped[record.recordType].push(record)
      })
      return grouped
    }
  },

  actions: {
    /**
     * 获取DNS解析记录
     * @param domain - 域名
     */
    async fetchDnsRecords(domain: string): Promise<void> {
      this.loading = true
      try {
        const response = await domainApi.getDnsRecords(domain)
        this.dnsRecords = response.data || []
        this.currentDomain = domain
      } catch (error) {
        console.error('获取DNS记录失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新DNS解析记录
     * @param params - 更新参数
     */
    async updateDnsRecord(params: UpdateDnsRecordParams): Promise<any> {
      this.loading = true
      try {
        const response = await domainApi.updateDnsRecord(params)
        
        // 更新成功后重新获取记录列表
        if (this.currentDomain) {
          await this.fetchDnsRecords(this.currentDomain)
        }
        
        return response
      } catch (error) {
        console.error('更新DNS记录失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除DNS解析记录
     * @param recordId - 记录ID
     */
    async deleteDnsRecord(recordId: string): Promise<any> {
      this.loading = true
      try {
        const response = await domainApi.deleteDnsRecord(recordId)
        
        // 删除成功后重新获取记录列表
        if (this.currentDomain) {
          await this.fetchDnsRecords(this.currentDomain)
        }
        
        return response
      } catch (error) {
        console.error('删除DNS记录失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})