# 测试编写规范

## 概述

本文档定义了基于 Vitest + Vue Test Utils 的测试编写规范，包括单元测试、组件测试、集成测试等最佳实践。

## 测试环境配置

### Vitest 配置
```typescript
// vite.config.ts
/**
 * @fileoverview Vite 配置文件，包含测试配置
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    // 测试环境配置
    environment: 'jsdom',
    
    // 全局测试设置
    globals: true,
    
    // 设置文件
    setupFiles: ['./test/setup.ts'],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // 测试文件匹配模式
    include: [
      'src/**/*.{test,spec}.{js,ts,vue}',
      'test/**/*.{test,spec}.{js,ts,vue}'
    ]
  }
})
```

### 测试设置文件
```typescript
// test/setup.ts
/**
 * @fileoverview 测试环境设置文件
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// 创建 Vuetify 实例用于测试
const vuetify = createVuetify({
  components,
  directives
})

// 全局配置 Vue Test Utils
config.global.plugins = [vuetify]

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// 模拟 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})
```

## 单元测试规范

### 工具函数测试
```typescript
// src/utils/format.test.ts
/**
 * @fileoverview 格式化工具函数测试
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { describe, it, expect } from 'vitest'
import { formatDate, formatCurrency, formatFileSize } from './format'

describe('格式化工具函数', () => {
  describe('formatDate', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-20T10:30:00Z')
      const result = formatDate(date, 'YYYY-MM-DD')
      expect(result).toBe('2024-01-20')
    })

    it('应该处理无效日期', () => {
      const result = formatDate(null, 'YYYY-MM-DD')
      expect(result).toBe('')
    })

    it('应该使用默认格式', () => {
      const date = new Date('2024-01-20T10:30:00Z')
      const result = formatDate(date)
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })

  describe('formatCurrency', () => {
    it('应该正确格式化货币', () => {
      expect(formatCurrency(1234.56)).toBe('¥1,234.56')
      expect(formatCurrency(0)).toBe('¥0.00')
      expect(formatCurrency(-100)).toBe('-¥100.00')
    })

    it('应该支持不同货币符号', () => {
      expect(formatCurrency(100, '$')).toBe('$100.00')
      expect(formatCurrency(100, '€')).toBe('€100.00')
    })

    it('应该处理边界值', () => {
      expect(formatCurrency(Number.MAX_SAFE_INTEGER)).toBeDefined()
      expect(formatCurrency(Number.MIN_SAFE_INTEGER)).toBeDefined()
    })
  })

  describe('formatFileSize', () => {
    it('应该正确格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1048576)).toBe('1.0 MB')
      expect(formatFileSize(1073741824)).toBe('1.0 GB')
    })

    it('应该处理小数位数', () => {
      expect(formatFileSize(1536, 2)).toBe('1.50 KB')
      expect(formatFileSize(1536, 0)).toBe('2 KB')
    })
  })
})
```

### API 服务测试
```typescript
// src/services/userService.test.ts
/**
 * @fileoverview 用户服务测试
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { userService } from './userService'
import type { User, CreateUserRequest } from '@/types/user'

// 模拟 fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('UserService', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getUser', () => {
    it('应该成功获取用户信息', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUser })
      })

      const result = await userService.getUser(1)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/users/1')
      expect(result).toEqual(mockUser)
    })

    it('应该处理网络错误', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(userService.getUser(1)).rejects.toThrow('Network error')
    })

    it('应该处理 HTTP 错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(userService.getUser(999)).rejects.toThrow('用户不存在')
    })
  })

  describe('createUser', () => {
    it('应该成功创建用户', async () => {
      const createRequest: CreateUserRequest = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      }

      const mockCreatedUser: User = {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCreatedUser })
      })

      const result = await userService.createUser(createRequest)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createRequest)
      })
      expect(result).toEqual(mockCreatedUser)
    })

    it('应该处理验证错误', async () => {
      const invalidRequest = {
        name: '',
        email: 'invalid-email',
        password: '123'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          errors: {
            name: '姓名不能为空',
            email: '邮箱格式不正确',
            password: '密码长度不足'
          }
        })
      })

      await expect(userService.createUser(invalidRequest as any))
        .rejects.toThrow('验证失败')
    })
  })
})
```

## 组件测试规范

### 基础组件测试
```typescript
// src/components/UserCard.test.ts
/**
 * @fileoverview 用户卡片组件测试
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import UserCard from './UserCard.vue'
import type { User } from '@/types/user'

// 创建 Vuetify 实例
const vuetify = createVuetify()

/**
 * 创建组件包装器
 * @param props 组件属性
 * @returns VueWrapper 组件包装器
 */
const createWrapper = (props: Partial<{ user: User }> = {}) => {
  return mount(UserCard, {
    props: {
      user: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://example.com/avatar.jpg',
        status: 'active',
        createdAt: new Date('2024-01-01')
      },
      ...props
    },
    global: {
      plugins: [vuetify]
    }
  })
}

describe('UserCard', () => {
  describe('渲染测试', () => {
    it('应该正确渲染用户信息', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('John Doe')
      expect(wrapper.text()).toContain('john@example.com')
      expect(wrapper.find('[data-testid="user-avatar"]').exists()).toBe(true)
    })

    it('应该显示用户头像', () => {
      const wrapper = createWrapper()
      const avatar = wrapper.find('[data-testid="user-avatar"] img')
      
      expect(avatar.exists()).toBe(true)
      expect(avatar.attributes('src')).toBe('https://example.com/avatar.jpg')
      expect(avatar.attributes('alt')).toBe('John Doe')
    })

    it('应该在没有头像时显示默认图标', () => {
      const wrapper = createWrapper({
        user: {
          id: 1,
          name: 'Jane Doe',
          email: 'jane@example.com',
          avatar: undefined,
          status: 'active',
          createdAt: new Date()
        }
      })
      
      const defaultIcon = wrapper.find('[data-testid="user-avatar"] .mdi-account')
      expect(defaultIcon.exists()).toBe(true)
    })

    it('应该根据状态显示不同的徽章颜色', () => {
      const activeWrapper = createWrapper({
        user: {
          id: 1,
          name: 'Active User',
          email: 'active@example.com',
          status: 'active',
          createdAt: new Date()
        }
      })
      
      const inactiveWrapper = createWrapper({
        user: {
          id: 2,
          name: 'Inactive User',
          email: 'inactive@example.com',
          status: 'inactive',
          createdAt: new Date()
        }
      })
      
      expect(activeWrapper.find('.v-chip--color-success').exists()).toBe(true)
      expect(inactiveWrapper.find('.v-chip--color-warning').exists()).toBe(true)
    })
  })

  describe('交互测试', () => {
    it('应该在点击编辑按钮时触发 edit 事件', async () => {
      const wrapper = createWrapper()
      const editButton = wrapper.find('[data-testid="edit-button"]')
      
      await editButton.trigger('click')
      
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')?.[0]).toEqual([{
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://example.com/avatar.jpg',
        status: 'active',
        createdAt: expect.any(Date)
      }])
    })

    it('应该在点击删除按钮时触发 delete 事件', async () => {
      const wrapper = createWrapper()
      const deleteButton = wrapper.find('[data-testid="delete-button"]')
      
      await deleteButton.trigger('click')
      
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')?.[0]).toEqual([1])
    })

    it('应该在卡片点击时触发 click 事件', async () => {
      const wrapper = createWrapper()
      const card = wrapper.find('[data-testid="user-card"]')
      
      await card.trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  describe('属性验证', () => {
    it('应该接受必需的 user 属性', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('user')).toBeDefined()
    })

    it('应该处理缺失的可选属性', () => {
      const wrapper = createWrapper({
        user: {
          id: 1,
          name: 'Minimal User',
          email: 'minimal@example.com',
          status: 'active',
          createdAt: new Date()
        }
      })
      
      expect(wrapper.text()).toContain('Minimal User')
    })
  })

  describe('可访问性测试', () => {
    it('应该具有正确的 ARIA 属性', () => {
      const wrapper = createWrapper()
      const card = wrapper.find('[data-testid="user-card"]')
      
      expect(card.attributes('role')).toBe('article')
      expect(card.attributes('aria-labelledby')).toBeDefined()
    })

    it('按钮应该有适当的 aria-label', () => {
      const wrapper = createWrapper()
      
      const editButton = wrapper.find('[data-testid="edit-button"]')
      const deleteButton = wrapper.find('[data-testid="delete-button"]')
      
      expect(editButton.attributes('aria-label')).toContain('编辑')
      expect(deleteButton.attributes('aria-label')).toContain('删除')
    })
  })
})
```

### 表单组件测试
```typescript
// src/components/UserForm.test.ts
/**
 * @fileoverview 用户表单组件测试
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createVuetify } from 'vuetify'
import UserForm from './UserForm.vue'

const vuetify = createVuetify()

/**
 * 创建表单组件包装器
 * @param props 组件属性
 * @returns VueWrapper 组件包装器
 */
const createWrapper = (props = {}) => {
  return mount(UserForm, {
    props,
    global: {
      plugins: [vuetify]
    }
  })
}

describe('UserForm', () => {
  describe('表单渲染', () => {
    it('应该渲染所有表单字段', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('[data-testid="name-field"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="email-field"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="password-field"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="role-field"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="submit-button"]').exists()).toBe(true)
    })

    it('应该在编辑模式下预填充数据', () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
      }
      
      const wrapper = createWrapper({ user, mode: 'edit' })
      
      expect(wrapper.find('[data-testid="name-field"] input').element.value)
        .toBe('John Doe')
      expect(wrapper.find('[data-testid="email-field"] input').element.value)
        .toBe('john@example.com')
    })
  })

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      const wrapper = createWrapper()
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      
      // 尝试提交空表单
      await submitButton.trigger('click')
      await nextTick()
      
      // 检查验证错误消息
      expect(wrapper.text()).toContain('姓名不能为空')
      expect(wrapper.text()).toContain('邮箱不能为空')
      expect(wrapper.text()).toContain('密码不能为空')
    })

    it('应该验证邮箱格式', async () => {
      const wrapper = createWrapper()
      const emailField = wrapper.find('[data-testid="email-field"] input')
      
      await emailField.setValue('invalid-email')
      await emailField.trigger('blur')
      await nextTick()
      
      expect(wrapper.text()).toContain('邮箱格式不正确')
    })

    it('应该验证密码强度', async () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('[data-testid="password-field"] input')
      
      // 测试弱密码
      await passwordField.setValue('123')
      await passwordField.trigger('blur')
      await nextTick()
      
      expect(wrapper.text()).toContain('密码至少8个字符')
      
      // 测试强密码
      await passwordField.setValue('StrongPass123')
      await passwordField.trigger('blur')
      await nextTick()
      
      expect(wrapper.text()).not.toContain('密码至少8个字符')
    })
  })

  describe('表单提交', () => {
    it('应该在有效数据时触发 submit 事件', async () => {
      const wrapper = createWrapper()
      
      // 填写有效数据
      await wrapper.find('[data-testid="name-field"] input')
        .setValue('John Doe')
      await wrapper.find('[data-testid="email-field"] input')
        .setValue('john@example.com')
      await wrapper.find('[data-testid="password-field"] input')
        .setValue('StrongPass123')
      
      // 选择角色
      const roleSelect = wrapper.find('[data-testid="role-field"]')
      await roleSelect.trigger('click')
      await nextTick()
      
      const adminOption = wrapper.find('[data-value="admin"]')
      await adminOption.trigger('click')
      await nextTick()
      
      // 提交表单
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')
      await nextTick()
      
      // 验证事件
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')?.[0][0]).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123',
        role: 'admin'
      })
    })

    it('应该在提交时显示加载状态', async () => {
      const wrapper = createWrapper({ loading: true })
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      
      expect(submitButton.classes()).toContain('v-btn--loading')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('密码可见性切换', () => {
    it('应该切换密码可见性', async () => {
      const wrapper = createWrapper()
      const passwordField = wrapper.find('[data-testid="password-field"] input')
      const toggleButton = wrapper.find('[data-testid="password-toggle"]')
      
      // 初始状态应该是隐藏密码
      expect(passwordField.attributes('type')).toBe('password')
      
      // 点击切换按钮
      await toggleButton.trigger('click')
      await nextTick()
      
      // 密码应该变为可见
      expect(passwordField.attributes('type')).toBe('text')
      
      // 再次点击切换按钮
      await toggleButton.trigger('click')
      await nextTick()
      
      // 密码应该重新隐藏
      expect(passwordField.attributes('type')).toBe('password')
    })
  })
})
```

## 集成测试规范

### 页面级测试
```typescript
// src/pages/UserManagement.test.ts
/**
 * @fileoverview 用户管理页面集成测试
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import UserManagement from './UserManagement.vue'
import { useUserStore } from '@/stores/user'

// 创建测试路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/users', component: UserManagement }
  ]
})

// 创建测试实例
const pinia = createPinia()
const vuetify = createVuetify()

/**
 * 创建页面组件包装器
 * @returns VueWrapper 组件包装器
 */
const createWrapper = () => {
  return mount(UserManagement, {
    global: {
      plugins: [router, pinia, vuetify]
    }
  })
}

// 模拟 API 响应
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    createdAt: new Date('2024-01-02')
  }
]

describe('UserManagement 页面', () => {
  beforeEach(() => {
    // 重置 Pinia 状态
    pinia.state.value = {}
  })

  describe('页面初始化', () => {
    it('应该正确渲染页面标题和操作按钮', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('用户管理')
      expect(wrapper.find('[data-testid="add-user-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="search-input"]').exists()).toBe(true)
    })

    it('应该在挂载时加载用户数据', async () => {
      const userStore = useUserStore()
      const fetchUsersSpy = vi.spyOn(userStore, 'fetchUsers')
        .mockResolvedValue(mockUsers)
      
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(fetchUsersSpy).toHaveBeenCalled()
    })
  })

  describe('用户列表显示', () => {
    it('应该显示用户列表', async () => {
      const userStore = useUserStore()
      vi.spyOn(userStore, 'fetchUsers').mockResolvedValue(mockUsers)
      
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 等待数据加载
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('John Doe')
      expect(wrapper.text()).toContain('Jane Smith')
    })

    it('应该显示加载状态', () => {
      const userStore = useUserStore()
      userStore.loading = true
      
      const wrapper = createWrapper()
      
      expect(wrapper.find('.v-progress-linear').exists()).toBe(true)
    })

    it('应该显示空状态', async () => {
      const userStore = useUserStore()
      vi.spyOn(userStore, 'fetchUsers').mockResolvedValue([])
      
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('暂无用户数据')
    })
  })

  describe('搜索功能', () => {
    it('应该根据搜索条件过滤用户', async () => {
      const userStore = useUserStore()
      vi.spyOn(userStore, 'fetchUsers').mockResolvedValue(mockUsers)
      
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const searchInput = wrapper.find('[data-testid="search-input"] input')
      await searchInput.setValue('John')
      await wrapper.vm.$nextTick()
      
      // 验证搜索结果
      expect(wrapper.text()).toContain('John Doe')
      expect(wrapper.text()).not.toContain('Jane Smith')
    })

    it('应该清除搜索条件', async () => {
      const wrapper = createWrapper()
      const searchInput = wrapper.find('[data-testid="search-input"] input')
      const clearButton = wrapper.find('[data-testid="search-clear"]')
      
      await searchInput.setValue('test')
      await clearButton.trigger('click')
      
      expect(searchInput.element.value).toBe('')
    })
  })

  describe('用户操作', () => {
    it('应该打开添加用户对话框', async () => {
      const wrapper = createWrapper()
      const addButton = wrapper.find('[data-testid="add-user-button"]')
      
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="user-dialog"]').exists()).toBe(true)
    })

    it('应该编辑用户', async () => {
      const userStore = useUserStore()
      vi.spyOn(userStore, 'fetchUsers').mockResolvedValue(mockUsers)
      
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const editButton = wrapper.find('[data-testid="edit-user-1"]')
      await editButton.trigger('click')
      
      expect(wrapper.find('[data-testid="user-dialog"]').exists()).toBe(true)
      // 验证表单是否预填充了用户数据
    })

    it('应该删除用户', async () => {
      const userStore = useUserStore()
      const deleteUserSpy = vi.spyOn(userStore, 'deleteUser')
        .mockResolvedValue(undefined)
      
      const wrapper = createWrapper()
      const deleteButton = wrapper.find('[data-testid="delete-user-1"]')
      
      await deleteButton.trigger('click')
      
      // 确认删除对话框
      const confirmButton = wrapper.find('[data-testid="confirm-delete"]')
      await confirmButton.trigger('click')
      
      expect(deleteUserSpy).toHaveBeenCalledWith(1)
    })
  })

  describe('错误处理', () => {
    it('应该显示错误消息', async () => {
      const userStore = useUserStore()
      vi.spyOn(userStore, 'fetchUsers')
        .mockRejectedValue(new Error('网络错误'))
      
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // 等待错误处理
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('加载失败')
    })
  })
})
```

## 测试工具和辅助函数

### 测试工具函数
```typescript
// test/utils/testUtils.ts
/**
 * @fileoverview 测试工具函数
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { mount, VueWrapper } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import type { Component } from 'vue'

/**
 * 创建测试用的 Vuetify 实例
 * @returns Vuetify 实例
 */
export const createTestVuetify = () => {
  return createVuetify({
    theme: {
      defaultTheme: 'light'
    }
  })
}

/**
 * 创建测试用的路由实例
 * @param routes 路由配置
 * @returns Router 实例
 */
export const createTestRouter = (routes: any[] = []) => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      ...routes
    ]
  })
}

/**
 * 创建完整的组件测试包装器
 * @param component 要测试的组件
 * @param options 挂载选项
 * @returns VueWrapper 实例
 */
export const createTestWrapper = (
  component: Component,
  options: any = {}
): VueWrapper<any> => {
  const vuetify = createTestVuetify()
  const pinia = createPinia()
  const router = createTestRouter(options.routes)

  return mount(component, {
    global: {
      plugins: [vuetify, pinia, router],
      ...options.global
    },
    ...options
  })
}

/**
 * 等待异步操作完成
 * @param ms 等待时间（毫秒）
 * @returns Promise
 */
export const sleep = (ms: number = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟用户输入
 * @param wrapper 组件包装器
 * @param selector 选择器
 * @param value 输入值
 */
export const typeInInput = async (
  wrapper: VueWrapper<any>,
  selector: string,
  value: string
): Promise<void> => {
  const input = wrapper.find(selector)
  await input.setValue(value)
  await input.trigger('input')
  await wrapper.vm.$nextTick()
}

/**
 * 模拟表单提交
 * @param wrapper 组件包装器
 * @param formSelector 表单选择器
 */
export const submitForm = async (
  wrapper: VueWrapper<any>,
  formSelector: string = 'form'
): Promise<void> => {
  const form = wrapper.find(formSelector)
  await form.trigger('submit')
  await wrapper.vm.$nextTick()
}

/**
 * 等待元素出现
 * @param wrapper 组件包装器
 * @param selector 选择器
 * @param timeout 超时时间
 * @returns Promise<boolean>
 */
export const waitForElement = async (
  wrapper: VueWrapper<any>,
  selector: string,
  timeout: number = 1000
): Promise<boolean> => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    await wrapper.vm.$nextTick()
    if (wrapper.find(selector).exists()) {
      return true
    }
    await sleep(10)
  }
  
  return false
}
```

### Mock 数据生成器
```typescript
// test/mocks/mockData.ts
/**
 * @fileoverview Mock 数据生成器
 * @author 开发者姓名
 * @created 2024-01-20
 */

import type { User, CreateUserRequest } from '@/types/user'

/**
 * 生成模拟用户数据
 * @param overrides 覆盖属性
 * @returns User 用户对象
 */
export const createMockUser = (overrides: Partial<User> = {}): User => {
  return {
    id: Math.floor(Math.random() * 1000),
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    status: 'active',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

/**
 * 生成多个模拟用户
 * @param count 用户数量
 * @param overrides 覆盖属性
 * @returns User[] 用户数组
 */
export const createMockUsers = (
  count: number,
  overrides: Partial<User> = {}
): User[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockUser({
      id: index + 1,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      ...overrides
    })
  )
}

/**
 * 生成模拟创建用户请求
 * @param overrides 覆盖属性
 * @returns CreateUserRequest 创建用户请求
 */
export const createMockUserRequest = (
  overrides: Partial<CreateUserRequest> = {}
): CreateUserRequest => {
  return {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'password123',
    role: 'user',
    ...overrides
  }
}

/**
 * 生成模拟 API 响应
 * @param data 响应数据
 * @param success 是否成功
 * @returns API 响应对象
 */
export const createMockApiResponse = <T>(
  data: T,
  success: boolean = true
) => {
  return {
    code: success ? 200 : 400,
    message: success ? 'Success' : 'Error',
    data,
    timestamp: Date.now()
  }
}
```

## 测试覆盖率要求

### 覆盖率目标
- **语句覆盖率**: ≥ 80%
- **分支覆盖率**: ≥ 80%
- **函数覆盖率**: ≥ 80%
- **行覆盖率**: ≥ 80%

### 覆盖率报告
```bash
# 运行测试并生成覆盖率报告
npm run test:coverage

# 查看 HTML 覆盖率报告
open coverage/index.html
```

## 测试最佳实践

### 1. 测试命名规范
- 使用描述性的测试名称
- 遵循 "应该..." 的格式
- 明确测试的预期行为

### 2. 测试结构
- 使用 AAA 模式（Arrange, Act, Assert）
- 每个测试只验证一个行为
- 保持测试的独立性

### 3. Mock 和 Stub
- 合理使用 Mock 隔离依赖
- 避免过度 Mock
- 确保 Mock 的准确性

### 4. 异步测试
- 正确处理异步操作
- 使用 async/await
- 避免测试竞态条件

### 5. 测试数据
- 使用工厂函数生成测试数据
- 保持测试数据的简洁性
- 避免硬编码测试数据

## 相关链接

- [返回主规范文档](./代码编写约定规则.md)
- [Vue 组件编写规范](./vue-component-rules.md)
- [TypeScript 编码规范](./typescript-rules.md)
- [Vitest 官方文档](https://vitest.dev/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)