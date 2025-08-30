/**
 * @fileoverview 认证相关类型定义
 * @description 定义登录、认证等相关的数据结构
 * @author 开发团队
 * @created 2024-01-20
 */

/**
 * 登录请求参数
 */
export interface LoginRequest {
  /** 用户邮箱地址 */
  email: string;
  /** 用户密码 */
  password: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  /** 用户ID */
  id: number;
  /** 用户名 */
  username: string;
  /** 用户邮箱 */
  email: string;
  /** 用户角色 */
  role: string;
  /** JWT令牌 */
  token: string;
}

/**
 * API响应包装器
 */
export interface ApiResponse<T> {
  /** 响应状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T | null;
  /** 时间戳 */
  timestamp: string;
}

/**
 * 登录表单数据
 */
export interface LoginFormData {
  /** 用户邮箱 */
  email: string;
  /** 密码 */
  password: string;
  /** 是否记住登录状态 */
  rememberMe: boolean;
}