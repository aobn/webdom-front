/**
 * @fileoverview Vitest 测试环境设置文件
 * @description 配置测试环境，处理CSS导入和其他全局设置
 * @author 开发团队 <dev@example.com>
 * @created 2024-01-20
 * @version 1.0.0
 */

import { vi, beforeEach, afterEach, afterAll } from 'vitest'

// Mock CSS 导入
vi.mock('*.css', () => ({}))
vi.mock('*.scss', () => ({}))
vi.mock('*.sass', () => ({}))
vi.mock('*.less', () => ({}))
vi.mock('*.styl', () => ({}))

// Mock Vuetify CSS
vi.mock('vuetify/styles', () => ({}))
vi.mock('vuetify/lib/styles/main.css', () => ({}))

// Mock 图片和其他静态资源
vi.mock('*.png', () => 'mock-image.png')
vi.mock('*.jpg', () => 'mock-image.jpg')
vi.mock('*.jpeg', () => 'mock-image.jpeg')
vi.mock('*.gif', () => 'mock-image.gif')
vi.mock('*.svg', () => 'mock-image.svg')
vi.mock('*.webp', () => 'mock-image.webp')

// 全局测试环境设置
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock console methods for cleaner test output
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(() => {
  // 可以在这里添加每个测试前的设置
})

afterEach(() => {
  // 可以在这里添加每个测试后的清理
})

// 恢复 console 方法
afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})