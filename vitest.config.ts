/**
 * @fileoverview Vitest 配置文件
 * @description 配置 Vitest 测试环境和相关设置
 * @author 开发者
 * @created 2024-01-20
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    // 使用 jsdom 环境模拟浏览器环境
    environment: 'jsdom',
    
    // 全局测试设置
    globals: true,
    
    // 包含的测试文件模式
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache'
    ],
    
    // 测试覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts'
      ]
    },
    
    // 设置测试环境的路径别名
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    
    // CSS 处理配置
    css: {
      modules: {
        classNameStrategy: 'stable'
      }
    },
    
    // 模拟 CSS 导入
    setupFiles: ['./src/test/setup.ts']
  },
  
  // 路径别名配置（与 vite.config.mts 保持一致）
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})