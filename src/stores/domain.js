import { defineStore } from 'pinia'
import { domainApi } from '@/services/domainApi'

export const useDomainStore = defineStore('domain', {
  state: () => ({
    dnsRecords: [],
    loading: false,
    currentDomain: ''
  }),

  getters: {
    // 按记录类型分组的DNS记录
    recordsByType: (state) => {
      const grouped = {}
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
     * @param {string} domain - 域名
     */
    async fetchDnsRecords(domain) {
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
     * @param {Object} params - 更新参数
     */
    async updateDnsRecord(params) {
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
     * @param {string} recordId - 记录ID
     */
    async deleteDnsRecord(recordId) {
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