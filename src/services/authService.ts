/**
 * @fileoverview 认证服务
 * @description 处理用户登录、认证等相关API请求
 * @author 开发团队
 * @created 2024-01-20
 */

import { http } from '@/utils/http';
import type { LoginRequest, LoginResponse, ApiResponse } from '@/types/auth';

/**
 * JWT Token载荷接口
 */
interface JwtPayload {
  sub: string; // 用户ID
  email: string; // 用户邮箱
  role: string; // 用户角色
  iat: number; // 签发时间
  exp: number; // 过期时间
}

/**
 * 用户信息接口
 */
interface UserInfo {
  id: number;
  username: string;
  email: string;
  role?: string;
}

/**
 * 认证服务类
 * 
 * @description 封装所有认证相关的API请求方法
 */
class AuthService {
  /**
   * 用户登录
   * @param credentials 登录凭据
   * @returns 登录响应
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('开始登录请求:', credentials.email);
      
      // 直接发送请求并获取原始响应
      const response = await http.post('/api/auth/login', credentials);
      
      console.log('登录原始响应:', response);
      
      // 检查响应格式
      if (response && typeof response === 'object') {
        if (response.code === 200 && response.data) {
          // 这是标准API响应格式
          const loginData = response.data;
          
          console.log('提取的登录数据:', loginData);
          
          // 存储认证信息到localStorage
          localStorage.setItem('token', loginData.token);
          
          // 从token中提取用户信息并存储
          const userInfo = this.getUserInfoFromToken(loginData.token);
          if (userInfo) {
            localStorage.setItem('user', JSON.stringify(userInfo));
          } else {
            // 如果无法从token提取信息，使用响应中的用户信息
            localStorage.setItem('user', JSON.stringify({
              id: loginData.id,
              username: loginData.username,
              email: loginData.email,
              role: loginData.role
            }));
          }
          
          console.log('登录成功，token有效期:', this.getTokenRemainingTime(), '秒');
          return loginData;
        } else {
          console.error('登录响应格式不正确:', response);
          throw new Error('登录响应格式不正确');
        }
      } else {
        console.error('登录响应数据为空或格式错误');
        throw new Error('登录响应数据为空或格式错误');
      }
    } catch (error) {
      console.error('登录过程中发生错误:', error);
      throw error;
    }
  }

  /**
   * 用户登出
   * 
   * @description 清除本地存储的认证信息
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('用户已登出');
  }

  /**
   * 获取当前用户信息
   * 
   * @description 从本地存储获取用户信息
   * @returns 用户信息对象或null
   */
  getCurrentUser(): { id: number; username: string; email: string } | null {
    try {
      const userInfo = localStorage.getItem('user');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 获取认证令牌
   * 
   * @description 从本地存储获取JWT令牌
   * @returns JWT令牌字符串或null
   */
  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * 检查用户是否已登录
   * 
   * @description 检查本地是否存在有效的认证令牌
   * @returns 是否已登录
   */
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    if (!token) return false;
    
    // 验证token是否过期
    if (this.isTokenExpired(token)) {
      this.logout(); // 清除过期token
      return false;
    }
    
    return true;
  }

  /**
   * 解析JWT token
   * 
   * @description 解析JWT token获取载荷信息
   * @param token JWT token字符串
   * @returns JWT载荷对象或null
   */
  private parseJwtToken(token: string): JwtPayload | null {
    try {
      // JWT token格式: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT token format');
        return null;
      }

      // 解码payload部分（Base64URL编码）
      const payload = parts[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedPayload) as JwtPayload;
    } catch (error) {
      console.error('Failed to parse JWT token:', error);
      return null;
    }
  }

  /**
   * 检查token是否过期
   * 
   * @description 检查JWT token是否已过期
   * @param token JWT token字符串
   * @returns 是否过期
   */
  private isTokenExpired(token: string): boolean {
    const payload = this.parseJwtToken(token);
    if (!payload || !payload.exp) {
      return true; // 无法解析或没有过期时间，视为过期
    }

    // JWT的exp是秒级时间戳，JavaScript的Date.now()是毫秒级
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * 从token获取用户信息
   * 
   * @description 从JWT token中提取用户信息
   * @param token JWT token字符串
   * @returns 用户信息对象或null
   */
  private getUserInfoFromToken(token: string): UserInfo | null {
    const payload = this.parseJwtToken(token);
    if (!payload) return null;

    return {
      id: parseInt(payload.sub),
      username: payload.email.split('@')[0], // 从邮箱提取用户名
      email: payload.email,
      role: payload.role
    };
  }

  /**
   * 自动登录
   * 
   * @description 使用存储的token自动登录用户
   * @returns 是否自动登录成功
   */
  autoLogin(): boolean {
    const token = this.getAuthToken();
    if (!token) return false;

    // 检查token是否有效
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    // 从token中获取用户信息并更新本地存储
    const userInfo = this.getUserInfoFromToken(token);
    if (userInfo) {
      localStorage.setItem('user', JSON.stringify(userInfo));
      console.log('自动登录成功:', userInfo);
      return true;
    }

    return false;
  }

  /**
   * 获取token剩余有效时间
   * 
   * @description 获取JWT token的剩余有效时间（秒）
   * @returns 剩余时间（秒），-1表示无效或已过期
   */
  getTokenRemainingTime(): number {
    const token = this.getAuthToken();
    if (!token) return -1;

    const payload = this.parseJwtToken(token);
    if (!payload || !payload.exp) return -1;

    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = payload.exp - currentTime;
    return remainingTime > 0 ? remainingTime : -1;
  }

  /**
   * 检查token是否即将过期
   * 
   * @description 检查token是否在指定时间内过期
   * @param thresholdMinutes 阈值时间（分钟），默认5分钟
   * @returns 是否即将过期
   */
  isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const remainingTime = this.getTokenRemainingTime();
    if (remainingTime === -1) return true;
    
    const thresholdSeconds = thresholdMinutes * 60;
    return remainingTime <= thresholdSeconds;
  }

  /**
   * 验证令牌有效性
   * 
   * @description 验证当前存储的JWT令牌是否有效
   * @returns Promise<boolean> 令牌是否有效
   */
  async validateToken(): Promise<boolean> {
    try {
      // 检查本地是否有token
      const token = this.getAuthToken();
      if (!token) return false;
      
      // 检查token是否已过期
      if (this.isTokenExpired(token)) {
        this.logout();
        return false;
      }
      
      // 可以选择向后端发送验证请求
      // 这里简化处理，只检查本地token的有效性
      return true;
    } catch (error) {
      console.error('验证令牌失败:', error);
      return false;
    }
  }
}

// 导出认证服务实例
export const authService = new AuthService();
export default authService;