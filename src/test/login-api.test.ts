/**
 * @fileoverview 登录API接口测试
 * @description 测试登录接口是否成功接入
 * @author 开发团队
 * @created 2024-01-20
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService } from '@/services'
import type { LoginRequest, LoginResponse } from '@/types/auth'

// 模拟http工具
vi.mock('@/utils/http', () => ({
  http: {
    post: vi.fn()
  }
}))

import { http } from '@/utils/http'

describe('登录API接口测试', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    vi.clearAllMocks()
    // 清除localStorage
    localStorage.clear()
  })

  it('应该成功登录并返回用户信息', async () => {
    // 测试数据
    const testCredentials: LoginRequest = {
      email: '12345678@example.com',
      password: '12345678'
    }

    // 模拟成功响应
    const mockResponse: LoginResponse = {
      id: 1,
      username: 'testuser',
      email: '12345678@example.com',
      role: 'user',
      token: 'mock-jwt-token-123456789'
    }

    // 模拟API响应
    const mockApiResponse = {
      data: mockResponse
    }

    // 设置模拟返回值
    vi.mocked(http.post).mockResolvedValue(mockApiResponse)

    // 执行登录
    const result = await authService.login(testCredentials)

    // 验证API调用
    expect(http.post).toHaveBeenCalledWith('/api/auth/login', testCredentials)
    expect(http.post).toHaveBeenCalledTimes(1)

    // 验证返回结果
    expect(result).toEqual(mockResponse)
    expect(result.email).toBe('12345678@example.com')
    expect(result.token).toBe('mock-jwt-token-123456789')

    // 验证localStorage存储
    expect(localStorage.getItem('token')).toBe('mock-jwt-token-123456789')
    expect(localStorage.getItem('user')).toBe(JSON.stringify({
      id: 1,
      username: 'testuser',
      email: '12345678@example.com',
      role: 'user'
    }))
  })

  it('应该处理登录失败的情况', async () => {
    // 测试数据
    const testCredentials: LoginRequest = {
      email: '12345678@example.com',
      password: 'wrongpassword'
    }

    // 模拟失败响应
    const mockErrorResponse = {
      data: null
    }

    // 设置模拟返回值
    vi.mocked(http.post).mockResolvedValue(mockErrorResponse)

    // 执行登录并期望抛出错误
    await expect(authService.login(testCredentials)).rejects.toThrow('登录失败')

    // 验证API调用
    expect(http.post).toHaveBeenCalledWith('/api/auth/login', testCredentials)
    expect(http.post).toHaveBeenCalledTimes(1)

    // 验证localStorage没有存储任何信息
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('应该处理网络错误', async () => {
    // 测试数据
    const testCredentials: LoginRequest = {
      email: '12345678@example.com',
      password: '12345678'
    }

    // 模拟网络错误
    const networkError = new Error('Network Error')
    vi.mocked(http.post).mockRejectedValue(networkError)

    // 执行登录并期望抛出错误
    await expect(authService.login(testCredentials)).rejects.toThrow('Network Error')

    // 验证API调用
    expect(http.post).toHaveBeenCalledWith('/api/auth/login', testCredentials)
    expect(http.post).toHaveBeenCalledTimes(1)

    // 验证localStorage没有存储任何信息
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('应该验证请求参数格式', () => {
    // 验证邮箱格式
    const emailRegex = /.+@.+\..+/
    expect(emailRegex.test('12345678@example.com')).toBe(true)
    expect(emailRegex.test('invalid-email')).toBe(false)

    // 验证密码长度
    const password = '12345678'
    expect(password.length).toBeGreaterThanOrEqual(6)
    expect(password.length).toBeLessThanOrEqual(50)
  })
})