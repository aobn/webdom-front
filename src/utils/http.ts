/**
 * @fileoverview HTTP请求工具类
 * @description 基于axios的HTTP客户端，包含请求/响应拦截器
 * @author 开发者
 * @created 2024-01-20
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, AxiosHeaders } from 'axios'
import { globalDialog } from '@/composables/useGlobalDialog'

// API响应数据结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: string
}

// 请求配置接口
export interface RequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean // 是否跳过全局错误处理
}

/**
 * HTTP客户端类
 */
class HttpClient {
  private instance: AxiosInstance

  constructor() {
    // 创建axios实例
    this.instance = axios.create({
      baseURL: process.env.NODE_ENV === 'production' ? 'https://db.goxi.top' : '', // 生产环境直接使用后端URL
      timeout: 10000, // 请求超时时间
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // 设置请求拦截器
    this.setupRequestInterceptor()
    
    // 设置响应拦截器
    this.setupResponseInterceptor()
  }

  /**
   * 设置请求拦截器
   */
  private setupRequestInterceptor(): void {
    this.instance.interceptors.request.use(
      (config) => {
        // 在发送请求之前做些什么
        console.log('发送请求:', {
          url: config.url,
          method: config.method,
          data: config.data,
          params: config.params
        })

        // 添加JWT认证token
        const token = localStorage.getItem('token')
        if (token) {
          if (!config.headers) {
            config.headers = new AxiosHeaders()
          }
          config.headers['Authorization'] = `Bearer ${token}`
        }

        // 确保Content-Type正确设置
        if (!config.headers['Content-Type'] && config.data) {
          config.headers['Content-Type'] = 'application/json'
        }

        return config
      },
      async (error) => {
        // 对请求错误做些什么
        console.error('请求错误:', error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * 设置响应拦截器
   */
  private setupResponseInterceptor(): void {
    this.instance.interceptors.response.use(
      async (response: AxiosResponse<ApiResponse>) => {
        // 2xx 范围内的状态码都会触发该函数
        console.log('🟢 我是拦截器 - 成功响应:', JSON.stringify(response.data))
        console.log('响应数据:', JSON.stringify(response.data))

        // 检查响应数据结构
        if (!response.data) {
          console.error('响应数据为空')
          return Promise.reject(new Error('响应数据为空'))
        }

        try {
          const { code, message, data } = response.data

          console.log('解析响应:', { code, message, hasData: !!data })

          // 检查是否为JWT失效错误（即使HTTP状态码是200）
          if (code === 500 && message && (
            message.includes('JWT signature does not match locally computed signature') ||
            message.includes('JWT validity cannot be asserted') ||
            message.includes('JWT signature') ||
            message.includes('JWT expired') ||
            message.includes('Invalid JWT')
          )) {
            console.warn('🔴 在成功响应中检测到JWT失效错误，开始处理认证失效流程')
            console.log('JWT错误详情:', { code, message })
            
            // 显示JWT失效对话框
            globalDialog.showWarning('JWT已失效', '请重新登录', {
              confirmButtonText: '确定',
              persistent: true, // 添加persistent属性，防止用户点击外部关闭对话框
              onConfirm: async () => {
                // 清除本地认证信息
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('rememberedEmail')
                console.log('✅ 已清除本地认证信息')
                
                // 使用Vue Router进行导航
                console.log('🚀 准备跳转到登录页面...')
                try {
                  const { default: router } = await import('@/router')
                  const currentRoute = router.currentRoute.value
                  console.log('当前路由信息:', { path: currentRoute.path, fullPath: currentRoute.fullPath })
                  
                  if (currentRoute.path !== '/login') {
                    console.log('🚀 JWT失效，跳转到登录页面，当前路径:', currentRoute.fullPath)
                    await router.push({
                      path: '/login',
                      query: { redirect: currentRoute.fullPath }
                    })
                    console.log('✅ 跳转命令执行完成')
                  } else {
                    console.log('⚠️ 当前已在登录页面，跳过跳转')
                  }
                } catch (routerError) {
                  console.error('❌ 动态导入router或跳转失败:', routerError)
                  // 降级方案：使用window.location
                  console.log('🔄 使用降级方案进行页面跳转')
                  window.location.href = '/login'
                }
              }
            })
            
            // 抛出JWT失效错误
            const jwtError = new Error('JWT验证失败，请重新登录')
            jwtError.name = 'JWTError'
            ;(jwtError as any).code = code
            ;(jwtError as any).data = data
            return Promise.reject(jwtError)
          }

          // 根据API文档的业务状态码处理响应
          if (code === 200 || code === 201) {
            // 成功响应，直接返回完整的响应数据
            // 不要修改response.data，这会导致数据丢失
            return response
          } else {
            // 业务错误，抛出异常
            const error = new Error(message || '请求失败')
            error.name = 'BusinessError'
            // 添加错误码信息
            ;(error as any).code = code
            ;(error as any).data = data
            return Promise.reject(error)
          }
        } catch (parseError) {
          console.error('解析响应数据失败:', parseError, '原始响应:', response.data)
          return Promise.reject(new Error('解析响应数据失败'))
        }
      },
      async (error) => {
        // 超出 2xx 范围的状态码都会触发该函数
        console.error('响应错误:', error)

        let errorMessage = '网络错误，请稍后重试'

        if (error.response) {
          // 服务器响应了错误状态码
          const { status, data } = error.response
          
          // 根据API文档的状态码定义处理错误
          switch (status) {
            case 400:
              errorMessage = data?.message || '请求参数错误，请检查输入'
              break
            case 401:
              errorMessage = data?.message || '登录已过期，请重新登录'
              // 清除本地token并跳转到登录页
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              localStorage.removeItem('rememberedEmail')
              
              // 使用Vue Router进行导航
              try {
                const { default: router } = await import('@/router')
                const currentRoute = router.currentRoute.value
                if (currentRoute.path !== '/login') {
                  console.log('🚀 JWT失效，跳转到登录页面，当前路径:', currentRoute.fullPath)
                  await router.push({
                    path: '/login',
                    query: { redirect: currentRoute.fullPath }
                  })
                  console.log('✅ 跳转命令执行完成')
                }
              } catch (routerError) {
                console.error('❌ 动态导入router失败:', routerError)
                // 降级方案：使用window.location
                window.location.href = '/login'
              }
              break
            case 403:
              errorMessage = data?.message || '权限不足，无法访问该资源'
              break
            case 404:
              errorMessage = data?.message || '请求的资源不存在'
              break
            case 409:
              errorMessage = data?.message || '资源冲突，请检查数据'
              break
            case 423:
              errorMessage = data?.message || '账户已锁定，请联系管理员'
              break
            case 500:
              errorMessage = '服务器内部错误，请稍后重试'
              break
            default:
              errorMessage = data?.message || `请求失败 (状态码: ${status})`
          }
        } else if (error.request) {
          // 请求已发出但没有收到响应
          errorMessage = '网络连接超时，请检查网络设置'
        }

        // 检查是否为JWT相关错误
        const responseMessage = error.response?.data?.message || ''
        const responseStatus = error.response?.status
        
        console.log('=== JWT失效检查日志 ===')
        console.log('响应状态码:', responseStatus)
        console.log('响应消息:', responseMessage)
        console.log('完整响应数据:', error.response?.data)
        
        const isJwtError = responseMessage.includes('JWT signature does not match locally computed signature') ||
                          responseMessage.includes('JWT validity cannot be asserted') ||
                          responseMessage.includes('JWT signature') ||
                          responseMessage.includes('JWT expired') ||
                          responseMessage.includes('Invalid JWT') ||
                          responseMessage.includes('jwt') ||
                          responseMessage.includes('JWT') ||
                          responseMessage.includes('token')
        
        const is401Error = responseStatus === 401
        const is500JwtError = responseStatus === 500 && isJwtError
        
        console.log('JWT错误匹配结果:', isJwtError)
        console.log('是否401错误:', is401Error)
        console.log('是否500状态码JWT错误:', is500JwtError)
        console.log('本地token存在:', !!localStorage.getItem('token'))
        
        if (isJwtError || is401Error || is500JwtError) {
          console.warn('🔴 检测到JWT失效或401错误，开始处理认证失效流程')
          console.log('错误详情:', { responseStatus, responseMessage, isJwtError, is401Error, is500JwtError })
          
          // 显示JWT失效对话框
          globalDialog.showWarning('JWT已失效', '请重新登录', {
            confirmButtonText: '确定',
            onConfirm: async () => {
              // 清除本地认证信息
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              localStorage.removeItem('rememberedEmail')
              console.log('✅ 已清除本地认证信息')
              
              // 使用Vue Router进行导航
              console.log('🚀 准备跳转到登录页面...')
              try {
                const { default: router } = await import('@/router')
                const currentRoute = router.currentRoute.value
                console.log('当前路由信息:', { path: currentRoute.path, fullPath: currentRoute.fullPath })
                
                if (currentRoute.path !== '/login') {
                  console.log('🚀 JWT失效，跳转到登录页面，当前路径:', currentRoute.fullPath)
                  await router.push({
                    path: '/login',
                    query: { redirect: currentRoute.fullPath }
                  })
                  console.log('✅ 跳转命令执行完成')
                } else {
                  console.log('⚠️ 当前已在登录页面，跳过跳转')
                }
              } catch (routerError) {
                console.error('❌ 动态导入router或跳转失败:', routerError)
                // 降级方案：使用window.location
                console.log('🔄 使用降级方案进行页面跳转')
                window.location.href = '/login'
              }
            }
          })
          
          errorMessage = 'JWT验证失败，请重新登录'
        } else {
          console.log('✅ 未检测到JWT失效，继续正常错误处理')
        }
        console.log('=== JWT失效检查结束 ===')

        // 创建统一的错误对象
        const customError = new Error(errorMessage)
        customError.name = 'HttpError'
        
        return Promise.reject(customError)
      }
    )
  }

  /**
   * GET请求
   */
  get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.get(url, config).then(response => response.data)
  }

  /**
   * POST请求
   */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.post(url, data, config).then(response => {
      console.log('POST请求响应原始数据:', response);
      return response.data;
    })
  }

  /**
   * PUT请求
   */
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.put(url, data, config).then(response => response.data)
  }

  /**
   * DELETE请求
   */
  delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.delete(url, config).then(response => response.data)
  }

  /**
   * PATCH请求
   */
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.patch(url, data, config).then(response => response.data)
  }

  /**
   * 获取axios实例（用于特殊需求）
   */
  getInstance(): AxiosInstance {
    return this.instance
  }
}

// 创建并导出HTTP客户端实例
export const http = new HttpClient()

// 导出默认实例的方法（便于使用）
export const { get, post, put, delete: del, patch } = http

export default http