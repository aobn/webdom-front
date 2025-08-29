/**
 * @fileoverview DNS记录修改功能集成测试
 * @description 测试用户修改3级域名解析记录接口的完整集成
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { dnsService } from '@/services/dnsService'

// Mock HTTP工具
vi.mock('@/utils/http', () => ({
  http: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('DNS记录修改接口集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该使用正确的接口路径和参数格式修改DNS记录', async () => {
    const mockResponse = {
      code: 200,
      message: '操作成功',
      data: {
        id: 123,
        userId: 789,
        subdomainId: 456,
        recordId: 162,
        name: 'www',
        type: 'A',
        value: '192.168.1.2',
        line: '默认',
        lineId: '0',
        ttl: 600,
        mx: null,
        weight: null,
        status: 'ENABLE',
        remark: '更新后的网站主页',
        monitorStatus: null,
        updatedOn: '2025-08-25T08:10:00',
        syncStatus: 'SUCCESS',
        syncError: null,
        createTime: '2025-08-25T08:00:00',
        updateTime: '2025-08-25T08:10:00'
      },
      timestamp: '2025-08-25T08:10:00Z'
    }

    // Mock HTTP POST请求
    const { http } = await import('@/utils/http')
    vi.mocked(http.post).mockResolvedValue(mockResponse)

    // 调用更新方法 - 使用DNS记录的主键ID
    const updateParams = {
      type: 'A',
      value: '192.168.1.2',
      ttl: 600,
      status: 'ENABLE',
      remark: '更新后的网站主页'
    }

    const result = await dnsService.updateDnsRecord(123, updateParams)

    // 验证调用了正确的接口 - id是DNS记录的主键ID
    expect(http.post).toHaveBeenCalledWith('/api/user/dns-records/modify', {
      id: 123,
      type: 'A',
      value: '192.168.1.2',
      ttl: 600,
      status: 'ENABLE',
      remark: '更新后的网站主页'
    })

    // 验证返回结果
    expect(result).toEqual(mockResponse)
  })

  it('应该正确处理MX记录的优先级参数', async () => {
    const mockResponse = {
      code: 200,
      message: '操作成功',
      data: {
        id: 124,
        type: 'MX',
        value: 'mail.example.com',
        mx: 5,
        ttl: 3600,
        status: 'ENABLE'
      }
    }

    const { http } = await import('@/utils/http')
    vi.mocked(http.post).mockResolvedValue(mockResponse)

    // MX记录更新参数
    const updateParams = {
      type: 'MX',
      value: 'mail.example.com',
      ttl: 3600,
      mx: 5,
      status: 'ENABLE',
      remark: '更新后的邮件服务器'
    }

    await dnsService.updateDnsRecord(124, updateParams)

    // 验证MX记录包含优先级参数
    expect(http.post).toHaveBeenCalledWith('/api/user/dns-records/modify', {
      id: 124,
      type: 'MX',
      value: 'mail.example.com',
      ttl: 3600,
      mx: 5,
      status: 'ENABLE',
      remark: '更新后的邮件服务器'
    })
  })

  it('应该正确处理权重参数', async () => {
    const mockResponse = {
      code: 200,
      message: '操作成功',
      data: {}
    }

    const { http } = await import('@/utils/http')
    vi.mocked(http.post).mockResolvedValue(mockResponse)

    // 包含权重的更新参数
    const updateParams = {
      type: 'A',
      value: '192.168.1.3',
      ttl: 1800,
      weight: 50,
      status: 'ENABLE',
      remark: '负载均衡记录'
    }

    await dnsService.updateDnsRecord(126, updateParams)

    // 验证权重参数被正确传递
    expect(http.post).toHaveBeenCalledWith('/api/user/dns-records/modify', {
      id: 126,
      type: 'A',
      value: '192.168.1.3',
      ttl: 1800,
      weight: 50,
      status: 'ENABLE',
      remark: '负载均衡记录'
    })
  })

  it('应该正确处理API错误响应', async () => {
    const { http } = await import('@/utils/http')
    
    // Mock 400错误响应
    const errorResponse = {
      response: {
        status: 400,
        data: {
          code: 400,
          message: '参数验证失败：记录值格式不正确',
          data: null,
          timestamp: '2025-08-25T08:10:00Z'
        }
      }
    }

    vi.mocked(http.post).mockRejectedValue(errorResponse)

    // 尝试更新无效的记录
    const invalidParams = {
      type: 'A',
      value: 'invalid-ip',
      ttl: 3600
    }

    await expect(dnsService.updateDnsRecord(127, invalidParams)).rejects.toThrow()
  })

  it('应该正确处理权限不足错误', async () => {
    const { http } = await import('@/utils/http')
    
    // Mock 403错误响应
    const errorResponse = {
      response: {
        status: 403,
        data: {
          code: 403,
          message: '无权限修改该DNS解析记录',
          data: null,
          timestamp: '2025-08-25T08:10:00Z'
        }
      }
    }

    vi.mocked(http.post).mockRejectedValue(errorResponse)

    const updateParams = {
      type: 'A',
      value: '192.168.1.4',
      ttl: 3600
    }

    await expect(dnsService.updateDnsRecord(128, updateParams)).rejects.toThrow()
  })

  it('应该正确处理记录不存在错误', async () => {
    const { http } = await import('@/utils/http')
    
    // Mock 404错误响应
    const errorResponse = {
      response: {
        status: 404,
        data: {
          code: 404,
          message: 'DNS解析记录不存在',
          data: null,
          timestamp: '2025-08-25T08:10:00Z'
        }
      }
    }

    vi.mocked(http.post).mockRejectedValue(errorResponse)

    const updateParams = {
      type: 'A',
      value: '192.168.1.5',
      ttl: 3600
    }

    await expect(dnsService.updateDnsRecord(999, updateParams)).rejects.toThrow()
  })

  it('应该正确处理记录冲突错误', async () => {
    const { http } = await import('@/utils/http')
    
    // Mock 409错误响应
    const errorResponse = {
      response: {
        status: 409,
        data: {
          code: 409,
          message: '记录类型冲突：CNAME记录不能与其他记录类型共存',
          data: null,
          timestamp: '2025-08-25T08:10:00Z'
        }
      }
    }

    vi.mocked(http.post).mockRejectedValue(errorResponse)

    const updateParams = {
      type: 'CNAME',
      value: 'example.com',
      ttl: 3600
    }

    await expect(dnsService.updateDnsRecord(130, updateParams)).rejects.toThrow()
  })

  it('应该正确处理服务器错误', async () => {
    const { http } = await import('@/utils/http')
    
    // Mock 500错误响应
    const errorResponse = {
      response: {
        status: 500,
        data: {
          code: 500,
          message: 'DNS解析记录修改失败: 调用腾讯云DNSPod修改记录API失败',
          data: null,
          timestamp: '2025-08-25T08:10:00Z'
        }
      }
    }

    vi.mocked(http.post).mockRejectedValue(errorResponse)

    const updateParams = {
      type: 'A',
      value: '192.168.1.6',
      ttl: 3600
    }

    await expect(dnsService.updateDnsRecord(131, updateParams)).rejects.toThrow()
  })
})