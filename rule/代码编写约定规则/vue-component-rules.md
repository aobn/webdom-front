# Vue 组件编写规范

## 概述

本文档定义了 Vue 3 组件的编写规范，包括组件结构、命名约定、Composition API 使用规范等。

## 组件文件结构

### 标准组件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script lang="ts" setup>
/**
 * @fileoverview 组件功能描述
 * @author 开发者姓名
 * @created 2024-01-20
 */

// 1. 导入依赖
import { ref, computed, onMounted } from 'vue'
import type { ComponentProps } from './types'

// 2. 定义 Props
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// 3. 定义 Emits
interface Emits {
  update: [value: string]
  click: [event: MouseEvent]
}

const emit = defineEmits<Emits>()

// 4. 响应式数据
const isLoading = ref(false)
const items = ref<Item[]>([])

// 5. 计算属性
const displayTitle = computed(() => {
  return `${props.title} (${props.count})`
})

// 6. 方法定义
/**
 * 处理点击事件
 * @param event 鼠标事件对象
 */
const handleClick = (event: MouseEvent): void => {
  emit('click', event)
}

// 7. 生命周期钩子
onMounted(() => {
  // 组件挂载后的逻辑
})

// 8. 暴露给父组件的方法和属性
defineExpose({
  refresh: () => {
    // 刷新逻辑
  }
})
</script>

<style lang="scss" scoped>
/* 组件样式 */
.component-wrapper {
  // 样式定义
}
</style>
```

## 组件命名规范

### 文件命名
- 使用 PascalCase 命名组件文件
- 文件名应该清晰描述组件功能
- 避免使用缩写和简写

```
✅ 正确示例
UserProfile.vue
ProductCard.vue
NavigationMenu.vue

❌ 错误示例
user.vue
card.vue
navmenu.vue
```

### 组件名称
- 组件名称使用 PascalCase
- 多单词组件名，避免与 HTML 元素冲突
- 基础组件使用特定前缀

```vue
<!-- ✅ 正确示例 -->
<template>
  <BaseButton />
  <UserProfile />
  <ProductCard />
</template>

<!-- ❌ 错误示例 -->
<template>
  <button />
  <profile />
  <card />
</template>
```

## Props 定义规范

### 类型定义
```typescript
// ✅ 推荐：使用 TypeScript 接口定义 Props
interface Props {
  // 必需属性
  title: string
  userId: number
  
  // 可选属性
  description?: string
  isVisible?: boolean
  
  // 联合类型
  size?: 'small' | 'medium' | 'large'
  
  // 对象类型
  user?: {
    id: number
    name: string
    email: string
  }
  
  // 数组类型
  items?: Array<{ id: number; name: string }>
  
  // 函数类型
  onUpdate?: (value: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  isVisible: true,
  size: 'medium',
  items: () => []
})
```

### Props 验证
```typescript
// 复杂验证逻辑
const props = defineProps({
  status: {
    type: String as PropType<'pending' | 'success' | 'error'>,
    required: true,
    validator: (value: string) => {
      return ['pending', 'success', 'error'].includes(value)
    }
  },
  count: {
    type: Number,
    default: 0,
    validator: (value: number) => value >= 0
  }
})
```

## Emits 定义规范

```typescript
// ✅ 推荐：使用 TypeScript 接口定义 Emits
interface Emits {
  // 简单事件
  close: []
  
  // 带参数事件
  update: [value: string]
  change: [id: number, value: any]
  
  // 带事件对象
  click: [event: MouseEvent]
  input: [event: Event]
}

const emit = defineEmits<Emits>()

// 事件触发
const handleUpdate = (newValue: string) => {
  emit('update', newValue)
}
```

## 响应式数据规范

### ref vs reactive
```typescript
// ✅ 基本类型使用 ref
const count = ref(0)
const message = ref('')
const isLoading = ref(false)

// ✅ 对象类型可以使用 reactive
const state = reactive({
  user: null as User | null,
  settings: {
    theme: 'light',
    language: 'zh-CN'
  }
})

// ✅ 数组使用 ref
const items = ref<Item[]>([])
const selectedIds = ref<number[]>([])
```

### 计算属性
```typescript
// ✅ 简单计算属性
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

// ✅ 带缓存的复杂计算
const expensiveValue = computed(() => {
  // 复杂计算逻辑
  return heavyCalculation(props.data)
})

// ✅ 可写计算属性
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (value: string) => {
    const [first, last] = value.split(' ')
    firstName.value = first
    lastName.value = last
  }
})
```

## 方法定义规范

```typescript
/**
 * 获取用户数据
 * @param userId 用户ID
 * @returns Promise<User> 用户信息
 */
const fetchUser = async (userId: number): Promise<User> => {
  try {
    isLoading.value = true
    const response = await userApi.getUser(userId)
    return response.data
  } catch (error) {
    console.error('获取用户失败:', error)
    throw error
  } finally {
    isLoading.value = false
  }
}

/**
 * 处理表单提交
 * @param event 表单事件
 */
const handleSubmit = (event: Event): void => {
  event.preventDefault()
  // 处理逻辑
}
```

## 生命周期使用规范

```typescript
// ✅ 组件挂载
onMounted(async () => {
  // 初始化数据
  await fetchInitialData()
  
  // 设置事件监听
  window.addEventListener('resize', handleResize)
})

// ✅ 组件卸载
onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('resize', handleResize)
  
  // 清理定时器
  if (timer.value) {
    clearInterval(timer.value)
  }
})

// ✅ 监听器
watch(
  () => props.userId,
  async (newId, oldId) => {
    if (newId !== oldId) {
      await fetchUser(newId)
    }
  },
  { immediate: true }
)

// ✅ 深度监听
watchEffect(() => {
  // 自动追踪依赖
  if (user.value && settings.value.autoSave) {
    saveUserSettings()
  }
})
```

## 模板编写规范

### 指令使用
```vue
<template>
  <!-- ✅ 条件渲染 -->
  <div v-if="isLoading">
    加载中...
  </div>
  <div v-else-if="error">
    {{ error.message }}
  </div>
  <div v-else>
    <!-- 内容 -->
  </div>
  
  <!-- ✅ 列表渲染 -->
  <ul>
    <li 
      v-for="item in items" 
      :key="item.id"
      :class="{ active: item.id === selectedId }"
    >
      {{ item.name }}
    </li>
  </ul>
  
  <!-- ✅ 事件处理 -->
  <button 
    @click="handleClick"
    @keyup.enter="handleEnter"
    :disabled="isLoading"
  >
    提交
  </button>
</template>
```

### 属性绑定
```vue
<template>
  <!-- ✅ 动态属性 -->
  <img 
    :src="imageUrl" 
    :alt="imageAlt"
    :class="imageClasses"
    :style="imageStyles"
  >
  
  <!-- ✅ 布尔属性 -->
  <input 
    v-model="inputValue"
    :required="isRequired"
    :readonly="isReadonly"
    :disabled="isDisabled"
  >
</template>
```

## 组件通信规范

### 父子组件通信
```vue
<!-- 父组件 -->
<template>
  <ChildComponent 
    :title="parentTitle"
    :data="parentData"
    @update="handleChildUpdate"
    @close="handleChildClose"
  />
</template>

<script lang="ts" setup>
/**
 * 处理子组件更新事件
 * @param value 更新的值
 */
const handleChildUpdate = (value: string): void => {
  // 处理更新逻辑
}
</script>
```

### 组件暴露
```typescript
// 子组件暴露方法给父组件
defineExpose({
  /**
   * 刷新组件数据
   */
  refresh: async (): Promise<void> => {
    await fetchData()
  },
  
  /**
   * 重置组件状态
   */
  reset: (): void => {
    // 重置逻辑
  }
})
```

## 性能优化规范

### 组件懒加载
```typescript
// ✅ 路由级别懒加载
const UserProfile = defineAsyncComponent(() => import('./UserProfile.vue'))

// ✅ 条件懒加载
const HeavyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 避免不必要的重新渲染
```vue
<template>
  <!-- ✅ 使用 v-memo 优化列表渲染 -->
  <div 
    v-for="item in list" 
    :key="item.id"
    v-memo="[item.id, item.selected]"
  >
    {{ item.name }}
  </div>
</template>
```

## 错误处理规范

```typescript
// ✅ 统一错误处理
const handleAsyncOperation = async (): Promise<void> => {
  try {
    isLoading.value = true
    error.value = null
    
    const result = await someAsyncOperation()
    // 处理成功结果
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败'
    console.error('操作失败:', err)
    
  } finally {
    isLoading.value = false
  }
}

// ✅ 错误边界处理
onErrorCaptured((error, instance, info) => {
  console.error('组件错误:', error, info)
  // 错误上报逻辑
  return false // 阻止错误继续传播
})
```

## 最佳实践

1. **保持组件单一职责**：每个组件只负责一个功能
2. **合理使用组合式函数**：提取可复用的逻辑
3. **避免深层嵌套**：保持组件层级扁平
4. **使用 TypeScript**：充分利用类型系统
5. **编写测试**：为组件编写单元测试
6. **性能监控**：关注组件的渲染性能
7. **无障碍访问**：确保组件的可访问性

## 相关链接

- [返回主规范文档](./代码编写约定规则.md)
- [TypeScript 编码规范](./typescript-rules.md)
- [Vuetify 组件使用规范](./vuetify-rules.md)