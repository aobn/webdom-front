/**
 * @fileoverview HTTP请求工具
 * @description 基于axios的HTTP请求封装，包含请求和响应拦截器
 * @author 开发团队
 * @created 2024-01-20
 * @version 1.0.0
 */

import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { globalDialog } from '@/composables/useGlobalDialog'

/**
 * 请求配置接口
 */
export interface RequestConfig extends AxiosRequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  params?: any
}

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api',
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    
    // 如果自定义代码不是200，则判断为错误
    if (res.code !== 200) {
      globalDialog.showError('请求失败', res.message || '请求失败')
      
      // 401: 未授权
      if (res.code === 401) {
        // 清除token并跳转到登录页
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      // 返回完整的响应对象，但将 data 设置为我们的 ApiResponse
      return { ...response, data: res }
    }
  },
  (error) => {
    console.error('响应错误:', error)
    globalDialog.showError('网络错误', error.message || '网络错误')
    return Promise.reject(error)
  }
)

/**
 * 通用请求方法
 * @param config - 请求配置
 * @returns Promise<ApiResponse>
 */
export function request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
  return service(config).then(response => response.data)
}

export { service }