# Vuetify 组件使用规范

## 概述

本文档定义了 Vuetify 3.x 组件库在 Vue 3 项目中的使用规范，包括组件选择、主题定制、响应式设计等最佳实践。

## Vuetify 3.x 基础配置

### 插件配置
```typescript
// src/plugins/vuetify.ts
/**
 * @fileoverview Vuetify 3.x 配置文件
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { VBtn } from 'vuetify/components/VBtn'

// 样式导入
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

/**
 * 创建 Vuetify 实例
 * 配置主题、图标、组件等
 */
export default createVuetify({
  // 组件配置
  components: {
    ...components,
    // 可以在这里覆盖默认组件
  },
  
  // 指令配置
  directives,
  
  // 主题配置
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#424242',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00'
        }
      }
    }
  },
  
  // 图标配置
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  
  // 显示配置
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  }
})
```

## 组件使用规范

### 布局组件

#### VApp 应用容器
```vue
<template>
  <!-- ✅ 正确的应用结构 -->
  <v-app>
    <!-- 应用栏 -->
    <v-app-bar 
      :elevation="2"
      color="primary"
      dark
    >
      <v-app-bar-title>应用标题</v-app-bar-title>
      
      <v-spacer />
      
      <v-btn 
        icon="mdi-theme-light-dark"
        @click="toggleTheme"
      />
    </v-app-bar>
    
    <!-- 导航抽屉 -->
    <v-navigation-drawer 
      v-model="drawer"
      :rail="rail"
      permanent
    >
      <v-list>
        <v-list-item 
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
        />
      </v-list>
    </v-navigation-drawer>
    
    <!-- 主要内容区域 -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    
    <!-- 底部栏 -->
    <v-footer 
      color="primary"
      class="text-center"
    >
      © 2024 公司名称
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
/**
 * @fileoverview 应用主布局组件
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { ref } from 'vue'
import { useTheme } from 'vuetify'

// 主题控制
const theme = useTheme()

// 抽屉状态
const drawer = ref(true)
const rail = ref(false)

// 菜单项配置
const menuItems = ref([
  { title: '首页', icon: 'mdi-home', to: '/' },
  { title: '用户管理', icon: 'mdi-account-group', to: '/users' },
  { title: '设置', icon: 'mdi-cog', to: '/settings' }
])

/**
 * 切换主题
 */
const toggleTheme = (): void => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>
```

#### 网格系统
```vue
<template>
  <!-- ✅ 响应式网格布局 -->
  <v-container>
    <v-row>
      <!-- 全宽列 -->
      <v-col cols="12">
        <h1>页面标题</h1>
      </v-col>
      
      <!-- 响应式列 -->
      <v-col 
        cols="12" 
        sm="6" 
        md="4" 
        lg="3"
      >
        <v-card>
          <v-card-title>卡片 1</v-card-title>
        </v-card>
      </v-col>
      
      <!-- 使用 offset -->
      <v-col 
        cols="12" 
        md="6" 
        offset-md="3"
      >
        <v-card>
          <v-card-title>居中卡片</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
```

### 表单组件

#### 表单验证
```vue
<template>
  <v-form 
    ref="formRef"
    v-model="valid"
    @submit.prevent="handleSubmit"
  >
    <!-- 文本输入 -->
    <v-text-field
      v-model="form.name"
      :rules="nameRules"
      label="姓名"
      required
      clearable
      prepend-inner-icon="mdi-account"
    />
    
    <!-- 邮箱输入 -->
    <v-text-field
      v-model="form.email"
      :rules="emailRules"
      label="邮箱"
      type="email"
      required
      clearable
      prepend-inner-icon="mdi-email"
    />
    
    <!-- 密码输入 -->
    <v-text-field
      v-model="form.password"
      :rules="passwordRules"
      :type="showPassword ? 'text' : 'password'"
      label="密码"
      required
      prepend-inner-icon="mdi-lock"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append-inner="showPassword = !showPassword"
    />
    
    <!-- 选择器 -->
    <v-select
      v-model="form.role"
      :items="roleOptions"
      :rules="roleRules"
      label="角色"
      required
      prepend-inner-icon="mdi-account-group"
    />
    
    <!-- 日期选择 -->
    <v-text-field
      v-model="form.birthDate"
      :rules="dateRules"
      label="出生日期"
      type="date"
      prepend-inner-icon="mdi-calendar"
    />
    
    <!-- 开关 -->
    <v-switch
      v-model="form.isActive"
      label="激活状态"
      color="primary"
    />
    
    <!-- 提交按钮 -->
    <v-btn
      :disabled="!valid || loading"
      :loading="loading"
      type="submit"
      color="primary"
      block
    >
      提交
    </v-btn>
  </v-form>
</template>

<script lang="ts" setup>
/**
 * @fileoverview 用户表单组件
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { ref, reactive } from 'vue'
import type { VForm } from 'vuetify/components'

// 表单引用
const formRef = ref<VForm>()
const valid = ref(false)
const loading = ref(false)
const showPassword = ref(false)

// 表单数据
const form = reactive({
  name: '',
  email: '',
  password: '',
  role: '',
  birthDate: '',
  isActive: true
})

// 角色选项
const roleOptions = [
  { title: '管理员', value: 'admin' },
  { title: '用户', value: 'user' },
  { title: '访客', value: 'guest' }
]

// 验证规则
const nameRules = [
  (v: string) => !!v || '姓名不能为空',
  (v: string) => v.length >= 2 || '姓名至少2个字符',
  (v: string) => v.length <= 50 || '姓名不能超过50个字符'
]

const emailRules = [
  (v: string) => !!v || '邮箱不能为空',
  (v: string) => /.+@.+\..+/.test(v) || '邮箱格式不正确'
]

const passwordRules = [
  (v: string) => !!v || '密码不能为空',
  (v: string) => v.length >= 8 || '密码至少8个字符',
  (v: string) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || '密码必须包含大小写字母和数字'
]

const roleRules = [
  (v: string) => !!v || '请选择角色'
]

const dateRules = [
  (v: string) => !!v || '请选择出生日期',
  (v: string) => new Date(v) <= new Date() || '出生日期不能是未来时间'
]

/**
 * 处理表单提交
 */
const handleSubmit = async (): Promise<void> => {
  if (!formRef.value) return
  
  const { valid } = await formRef.value.validate()
  if (!valid) return
  
  try {
    loading.value = true
    // 提交逻辑
    console.log('提交表单:', form)
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

### 数据展示组件

#### 数据表格
```vue
<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-account-group" class="me-2" />
      用户列表
      
      <v-spacer />
      
      <!-- 搜索框 -->
      <v-text-field
        v-model="search"
        label="搜索用户"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        single-line
        hide-details
        clearable
        class="me-2"
        style="max-width: 300px;"
      />
      
      <!-- 添加按钮 -->
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="handleAdd"
      >
        添加用户
      </v-btn>
    </v-card-title>
    
    <!-- 数据表格 -->
    <v-data-table
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="users"
      :search="search"
      :loading="loading"
      item-key="id"
      show-select
      class="elevation-1"
    >
      <!-- 头像列 -->
      <template #item.avatar="{ item }">
        <v-avatar size="40">
          <v-img 
            v-if="item.avatar"
            :src="item.avatar"
            :alt="item.name"
          />
          <v-icon 
            v-else
            icon="mdi-account"
          />
        </v-avatar>
      </template>
      
      <!-- 状态列 -->
      <template #item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          size="small"
          variant="flat"
        >
          {{ getStatusText(item.status) }}
        </v-chip>
      </template>
      
      <!-- 操作列 -->
      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          size="small"
          variant="text"
          @click="handleEdit(item)"
        />
        <v-btn
          icon="mdi-delete"
          size="small"
          variant="text"
          color="error"
          @click="handleDelete(item)"
        />
      </template>
      
      <!-- 无数据提示 -->
      <template #no-data>
        <v-alert
          type="info"
          variant="tonal"
          class="ma-4"
        >
          暂无用户数据
        </v-alert>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts" setup>
/**
 * @fileoverview 用户列表组件
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { ref, onMounted } from 'vue'
import type { VDataTable } from 'vuetify/components'

// 表格配置
type ReadonlyHeaders = VDataTable['$props']['headers']

const headers: ReadonlyHeaders = [
  { title: '头像', key: 'avatar', sortable: false },
  { title: '姓名', key: 'name' },
  { title: '邮箱', key: 'email' },
  { title: '角色', key: 'role' },
  { title: '状态', key: 'status' },
  { title: '创建时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false }
]

// 响应式数据
const users = ref<User[]>([])
const loading = ref(false)
const search = ref('')
const itemsPerPage = ref(10)

/**
 * 获取状态颜色
 * @param status 状态值
 * @returns string 颜色名称
 */
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    suspended: 'error'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态文本
 * @param status 状态值
 * @returns string 状态文本
 */
const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    suspended: '暂停'
  }
  return textMap[status] || status
}

/**
 * 处理添加用户
 */
const handleAdd = (): void => {
  // 添加逻辑
}

/**
 * 处理编辑用户
 * @param user 用户对象
 */
const handleEdit = (user: User): void => {
  // 编辑逻辑
}

/**
 * 处理删除用户
 * @param user 用户对象
 */
const handleDelete = (user: User): void => {
  // 删除逻辑
}

/**
 * 获取用户列表
 */
const fetchUsers = async (): Promise<void> => {
  try {
    loading.value = true
    // 获取数据逻辑
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUsers()
})
</script>
```

### 反馈组件

#### 对话框和通知
```vue
<template>
  <!-- 确认对话框 -->
  <v-dialog 
    v-model="confirmDialog"
    max-width="400"
    persistent
  >
    <v-card>
      <v-card-title class="text-h6">
        确认删除
      </v-card-title>
      
      <v-card-text>
        确定要删除用户 "{{ selectedUser?.name }}" 吗？此操作不可撤销。
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        
        <v-btn
          variant="text"
          @click="confirmDialog = false"
        >
          取消
        </v-btn>
        
        <v-btn
          color="error"
          variant="flat"
          :loading="deleting"
          @click="confirmDelete"
        >
          删除
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- 加载覆盖层 -->
  <v-overlay 
    v-model="loading"
    class="align-center justify-center"
  >
    <v-progress-circular
      color="primary"
      indeterminate
      size="64"
    />
  </v-overlay>
  
  <!-- 通知栏 -->
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    location="top right"
  >
    {{ snackbar.message }}
    
    <template #actions>
      <v-btn
        variant="text"
        @click="snackbar.show = false"
      >
        关闭
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
/**
 * @fileoverview 反馈组件示例
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { ref, reactive } from 'vue'

// 对话框状态
const confirmDialog = ref(false)
const loading = ref(false)
const deleting = ref(false)
const selectedUser = ref<User | null>(null)

// 通知栏状态
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000
})

/**
 * 显示通知
 * @param message 消息内容
 * @param color 颜色类型
 */
const showNotification = (
  message: string, 
  color: 'success' | 'error' | 'warning' | 'info' = 'success'
): void => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

/**
 * 确认删除
 */
const confirmDelete = async (): Promise<void> => {
  if (!selectedUser.value) return
  
  try {
    deleting.value = true
    // 删除逻辑
    showNotification('用户删除成功')
    confirmDialog.value = false
  } catch (error) {
    showNotification('删除失败，请重试', 'error')
  } finally {
    deleting.value = false
  }
}
</script>
```

## 主题定制规范

### 自定义主题
```typescript
// src/plugins/vuetify.ts
import { ThemeDefinition } from 'vuetify'

/**
 * 自定义浅色主题
 */
const customLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-light': '#EEEEEE',
    'surface-variant': '#424242',
    'on-surface-variant': '#EEEEEE',
    primary: '#1867C0',
    'primary-darken-1': '#1F5592',
    secondary: '#48A9A6',
    'secondary-darken-1': '#018786',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00'
  },
  variables: {
    'border-color': '#000000',
    'border-opacity': 0.12,
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.60,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.04,
    'focus-opacity': 0.12,
    'selected-opacity': 0.08,
    'activated-opacity': 0.12,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.08,
    'theme-kbd': '#212529',
    'theme-on-kbd': '#FFFFFF',
    'theme-code': '#F5F5F5',
    'theme-on-code': '#000000'
  }
}

/**
 * 自定义深色主题
 */
const customDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#212121',
    'surface-bright': '#ccbfd6',
    'surface-light': '#424242',
    'surface-variant': '#a3a3a3',
    'on-surface-variant': '#424242',
    primary: '#2196F3',
    'primary-darken-1': '#277CC1',
    secondary: '#54B6B2',
    'secondary-darken-1': '#48A9A6',
    error: '#CF6679',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00'
  }
}
```

### 响应式设计规范

```vue
<template>
  <!-- ✅ 使用 Vuetify 断点系统 -->
  <v-container>
    <v-row>
      <!-- 移动端全宽，桌面端半宽 -->
      <v-col 
        cols="12" 
        md="6"
      >
        <v-card>
          <!-- 响应式文本大小 -->
          <v-card-title 
            class="text-h6 text-md-h5 text-lg-h4"
          >
            响应式标题
          </v-card-title>
          
          <!-- 响应式按钮 -->
          <v-card-actions>
            <v-btn
              :size="$vuetify.display.mobile ? 'small' : 'default'"
              :block="$vuetify.display.mobile"
              color="primary"
            >
              操作按钮
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
/**
 * @fileoverview 响应式组件示例
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { computed } from 'vue'
import { useDisplay } from 'vuetify'

// 使用 Vuetify 显示工具
const { mobile, tablet, desktop, width, height } = useDisplay()

// 响应式计算属性
const cardCols = computed(() => {
  if (mobile.value) return 12
  if (tablet.value) return 6
  return 4
})

const gridSpacing = computed(() => {
  return mobile.value ? 2 : 4
})
</script>
```

## 无障碍访问规范

### ARIA 属性和语义化
```vue
<template>
  <!-- ✅ 正确的无障碍实现 -->
  <v-card
    role="article"
    :aria-labelledby="titleId"
    :aria-describedby="descId"
  >
    <v-card-title 
      :id="titleId"
      class="text-h6"
    >
      用户信息
    </v-card-title>
    
    <v-card-text 
      :id="descId"
    >
      显示用户的详细信息和操作选项
    </v-card-text>
    
    <!-- 表单无障碍 -->
    <v-form>
      <v-text-field
        v-model="username"
        label="用户名"
        :aria-describedby="usernameHelpId"
        required
      />
      
      <div 
        :id="usernameHelpId"
        class="text-caption text-medium-emphasis"
      >
        用户名必须是唯一的，长度在3-20个字符之间
      </div>
      
      <!-- 按钮组 -->
      <v-btn-group 
        role="group"
        aria-label="用户操作"
      >
        <v-btn
          aria-label="编辑用户信息"
          @click="handleEdit"
        >
          <v-icon icon="mdi-pencil" />
          编辑
        </v-btn>
        
        <v-btn
          aria-label="删除用户"
          color="error"
          @click="handleDelete"
        >
          <v-icon icon="mdi-delete" />
          删除
        </v-btn>
      </v-btn-group>
    </v-form>
  </v-card>
</template>

<script lang="ts" setup>
/**
 * @fileoverview 无障碍访问示例
 * @author 开发者姓名
 * @created 2024-01-20
 */

import { ref } from 'vue'

// 生成唯一ID
const titleId = `title-${Math.random().toString(36).substr(2, 9)}`
const descId = `desc-${Math.random().toString(36).substr(2, 9)}`
const usernameHelpId = `username-help-${Math.random().toString(36).substr(2, 9)}`

const username = ref('')

const handleEdit = (): void => {
  // 编辑逻辑
}

const handleDelete = (): void => {
  // 删除逻辑
}
</script>
```

## 性能优化规范

### 按需导入组件
```typescript
// ✅ 按需导入 Vuetify 组件
import { VBtn, VCard, VCardTitle } from 'vuetify/components'
import { VForm, VTextField } from 'vuetify/components'

// 在 Vuetify 配置中只注册需要的组件
export default createVuetify({
  components: {
    VBtn,
    VCard,
    VCardTitle,
    VForm,
    VTextField
  }
})
```

### 虚拟滚动
```vue
<template>
  <!-- ✅ 大量数据使用虚拟滚动 -->
  <v-virtual-scroll
    :items="largeDataset"
    :item-height="64"
    height="400"
  >
    <template #default="{ item }">
      <v-list-item
        :key="item.id"
        :title="item.title"
        :subtitle="item.subtitle"
      >
        <template #prepend>
          <v-avatar>
            <v-img :src="item.avatar" />
          </v-avatar>
        </template>
      </v-list-item>
    </template>
  </v-virtual-scroll>
</template>
```

## 最佳实践

### 1. 组件选择原则
- 优先使用 Vuetify 提供的组件
- 需要自定义时，基于 Vuetify 组件扩展
- 保持设计系统的一致性

### 2. 主题管理
- 使用 CSS 变量进行主题定制
- 支持明暗主题切换
- 保持品牌色彩一致性

### 3. 响应式设计
- 使用 Vuetify 的断点系统
- 移动优先的设计理念
- 合理使用网格系统

### 4. 性能考虑
- 按需导入组件
- 使用虚拟滚动处理大数据
- 合理使用懒加载

### 5. 无障碍访问
- 提供适当的 ARIA 属性
- 确保键盘导航支持
- 保持足够的颜色对比度

## 相关链接

- [返回主规范文档](./代码编写约定规则.md)
- [Vue 组件编写规范](./vue-component-rules.md)
- [TypeScript 编码规范](./typescript-rules.md)
- [Vuetify 3 官方文档](https://vuetifyjs.com/)
- [Material Design 指南](https://material.io/design)