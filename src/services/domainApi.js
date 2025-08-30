import { request } from '@/utils/request'

/**
 * 域名API服务
 */
export const domainApi = {
  /**
   * 修改3级域名解析记录
   * @param {Object} params - 请求参数
   * @param {string} params.domain - 域名
   * @param {string} params.recordType - 记录类型 (A, CNAME, MX, TXT等)
   * @param {string} params.recordValue - 记录值
   * @param {number} params.ttl - TTL值
   * @param {string} params.subdomain - 子域名
   * @returns {Promise} API响应
   */
  updateDnsRecord(params) {
    return request({
      url: '/api/domain/dns/update',
      method: 'POST',
      data: params
    })
  },

  /**
   * 获取域名解析记录列表
   * @param {string} domain - 域名
   * @returns {Promise} API响应
   */
  getDnsRecords(domain) {
    return request({
      url: '/api/domain/dns/list',
      method: 'GET',
      params: { domain }
    })
  },

  /**
   * 删除DNS解析记录
   * @param {string} recordId - 记录ID
   * @returns {Promise} API响应
   */
  deleteDnsRecord(recordId) {
    return request({
      url: `/api/domain/dns/delete/${recordId}`,
      method: 'DELETE'
    })
  }
}