/**
 * @fileoverview 用户登出API接口测试
 * @description 测试用户登出功能是否正确调用后端API
 * @author 开发团队 <dev@example.com>
 * @created 2024-01-20
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock fetch API
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// 模拟登出函数（从index.vue中提取的逻辑）
const createLogoutFunction = () => {
  let isLoggedIn = { value: false }
  let loginStatusMessage = { value: '' }
  let loginStatusType = { value: 'info' }

  const handleLogout = async () => {
    try {
      // 从localStorage获取JWT令牌
      const token = localStorage.getItem('token')
      
      if (!token) {
        loginStatusMessage.value = '未找到登录令牌'
        loginStatusType.value = 'warning'
        return
      }
      
      // 调用后端登出接口
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.code === 200) {
        // 登出成功，清除本地令牌
        localStorage.removeItem('token')
        isLoggedIn.value = false
        loginStatusMessage.value = '已成功退出登录'
        loginStatusType.value = 'success'
      } else {
        // 登出失败，但仍然清除本地令牌（防止令牌泄露）
        localStorage.removeItem('token')
        isLoggedIn.value = false
        loginStatusMessage.value = `退出登录失败: ${result.message}`
        loginStatusType.value = 'warning'
      }
    } catch (error) {
      console.error('退出登录时发生错误:', error)
      // 即使网络错误，也要清除本地令牌
      localStorage.removeItem('token')
      isLoggedIn.value = false
      loginStatusMessage.value = '网络错误，但已清除本地登录状态'
      loginStatusType.value = 'warning'
    }
  }

  return {
    handleLogout,
    isLoggedIn,
    loginStatusMessage,
    loginStatusType
  }
}

describe('用户登出功能测试', () => {
  let logoutHandler: ReturnType<typeof createLogoutFunction>

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 创建登出处理器
    logoutHandler = createLogoutFunction()
  })

  afterEach(() => {
    // 清理
  })

  it('应该正确调用登出API接口', async () => {
    // 模拟localStorage中有token
    mockLocalStorage.getItem.mockReturnValue('mock-jwt-token')
    
    // 模拟API成功响应
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        code: 200,
        message: '登出成功',
        data: null,
        timestamp: '2024-01-20T10:30:00'
      })
    })

    // 触发登出操作
    await logoutHandler.handleLogout()

    // 验证API调用
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer mock-jwt-token',
        'Content-Type': 'application/json'
      }
    })

    // 验证localStorage被清除
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
    
    // 验证登录状态更新
    expect(logoutHandler.isLoggedIn.value).toBe(false)
    expect(logoutHandler.loginStatusMessage.value).toBe('已成功退出登录')
    expect(logoutHandler.loginStatusType.value).toBe('success')
  })

  it('应该处理API返回错误的情况', async () => {
    // 模拟localStorage中有token
    mockLocalStorage.getItem.mockReturnValue('mock-jwt-token')
    
    // 模拟API错误响应
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        code: 401,
        message: '未授权',
        data: null,
        timestamp: '2024-01-20T10:30:00'
      })
    })

    // 触发登出操作
    await logoutHandler.handleLogout()

    // 验证API调用
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer mock-jwt-token',
        'Content-Type': 'application/json'
      }
    })

    // 验证即使API失败，localStorage也被清除
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
    
    // 验证登录状态更新
    expect(logoutHandler.isLoggedIn.value).toBe(false)
    expect(logoutHandler.loginStatusMessage.value).toBe('退出登录失败: 未授权')
    expect(logoutHandler.loginStatusType.value).toBe('warning')
  })

  it('应该处理网络错误的情况', async () => {
    // 模拟localStorage中有token
    mockLocalStorage.getItem.mockReturnValue('mock-jwt-token')
    
    // 模拟网络错误
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    // 触发登出操作
    await logoutHandler.handleLogout()

    // 验证API调用
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer mock-jwt-token',
        'Content-Type': 'application/json'
      }
    })

    // 验证即使网络错误，localStorage也被清除
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
    
    // 验证登录状态更新
    expect(logoutHandler.isLoggedIn.value).toBe(false)
    expect(logoutHandler.loginStatusMessage.value).toBe('网络错误，但已清除本地登录状态')
    expect(logoutHandler.loginStatusType.value).toBe('warning')
  })

  it('应该处理没有token的情况', async () => {
    // 模拟localStorage中没有token
    mockLocalStorage.getItem.mockReturnValue(null)

    // 触发登出操作
    await logoutHandler.handleLogout()

    // 验证不会调用API
    expect(mockFetch).not.toHaveBeenCalled()
    
    // 验证状态消息
    expect(logoutHandler.loginStatusMessage.value).toBe('未找到登录令牌')
    expect(logoutHandler.loginStatusType.value).toBe('warning')
  })

  it('应该确保API调用使用正确的HTTP方法和头部', async () => {
    // 模拟localStorage中有token
    mockLocalStorage.getItem.mockReturnValue('test-token-123')
    
    // 模拟API成功响应
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        code: 200,
        message: '登出成功',
        data: null,
        timestamp: '2024-01-20T10:30:00'
      })
    })

    // 触发登出操作
    await logoutHandler.handleLogout()

    // 验证API调用的具体参数
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token-123',
        'Content-Type': 'application/json'
      }
    })
  })
})