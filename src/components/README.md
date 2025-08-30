# 组件说明文档

## GlobalDialog - 全局统一对话框组件

### 概述
`GlobalDialog` 是一个全局统一的对话框组件，提供一致的用户交互体验。支持多种类型的对话框，包括信息提示、成功消息、警告、错误、确认对话框等。

### 特性
- 🎨 统一的视觉设计和交互体验
- 🔧 高度可配置，支持自定义样式和行为
- 📱 响应式设计，适配移动端
- ⚡ 基于 Composition API 的现代化实现
- 🎯 TypeScript 完整类型支持
- 🚀 简单易用的 API 设计

### 基础用法

#### 1. 导入组合式函数
```typescript
import { globalDialog } from '@/composables/useGlobalDialog'
```

#### 2. 基础对话框类型

**信息对话框**
```typescript
globalDialog.showInfo('提示', '这是一条信息')
```

**成功对话框**
```typescript
globalDialog.showSuccess('成功', '操作已成功完成')
```

**警告对话框**
```typescript
globalDialog.showWarning('警告', '请注意相关风险')
```

**错误对话框**
```typescript
globalDialog.showError('错误', '操作执行失败')
```

#### 3. 确认对话框
```typescript
const confirmed = await globalDialog.showConfirm(
  '确认删除', 
  '此操作不可撤销，确定要删除吗？'
)

if (confirmed) {
  // 用户确认了操作
  console.log('用户确认删除')
} else {
  // 用户取消了操作
  console.log('用户取消删除')
}
```

#### 4. 加载对话框
```typescript
// 显示加载对话框
globalDialog.showLoading('处理中...', '请稍候')

// 执行异步操作
setTimeout(() => {
  // 隐藏对话框
  globalDialog.hideDialog()
}, 3000)
```

#### 5. 自定义对话框
```typescript
globalDialog.showDialog({
  type: 'custom',
  title: '自定义标题',
  subtitle: '自定义副标题',
  message: '自定义消息内容',
  icon: 'mdi-star',
  maxWidth: 600,
  confirmButtonText: '确认',
  confirmButtonColor: 'primary',
  cancelButtonText: '取消',
  onConfirm: async () => {
    // 确认操作的回调
    console.log('用户确认了操作')
  },
  onCancel: () => {
    // 取消操作的回调
    console.log('用户取消了操作')
  }
})
```

### 配置选项

#### DialogConfig 接口
```typescript
interface DialogConfig {
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'custom'
  title?: string                    // 对话框标题
  subtitle?: string                 // 对话框副标题
  message?: string                  // 对话框消息内容
  icon?: string                     // 自定义图标
  maxWidth?: string | number        // 最大宽度
  persistent?: boolean              // 是否持久化（点击外部不关闭）
  scrollable?: boolean              // 内容是否可滚动
  showHeader?: boolean              // 是否显示头部
  showActions?: boolean             // 是否显示操作按钮
  showDivider?: boolean             // 是否显示分割线
  showCloseButton?: boolean         // 是否显示关闭按钮
  showCancelButton?: boolean        // 是否显示取消按钮
  showConfirmButton?: boolean       // 是否显示确认按钮
  cancelButtonText?: string         // 取消按钮文本
  confirmButtonText?: string        // 确认按钮文本
  cancelButtonColor?: string        // 取消按钮颜色
  confirmButtonColor?: string       // 确认按钮颜色
  confirmButtonVariant?: string     // 确认按钮变体
  contentClass?: string             // 内容区域样式类
  onConfirm?: () => void | Promise<void>  // 确认回调
  onCancel?: () => void             // 取消回调
  onClose?: () => void              // 关闭回调
}
```

### 样式定制

组件使用了 Vuetify 的主题系统，会自动适配当前主题的颜色。同时提供了以下 CSS 类用于自定义样式：

- `.dialog-card` - 对话框卡片
- `.dialog-header` - 对话框头部
- `.dialog-content` - 对话框内容
- `.dialog-actions` - 对话框操作区域

### 示例页面

查看 `src/examples/GlobalDialogExample.vue` 文件，了解完整的使用示例。

### 注意事项

1. **全局注册**: 组件已在 `App.vue` 中全局注册，无需在每个页面单独导入
2. **异步操作**: 确认对话框返回 Promise，可以使用 `await` 等待用户操作
3. **加载状态**: 使用加载对话框时，记得在操作完成后调用 `hideDialog()` 关闭
4. **类型安全**: 所有配置选项都有完整的 TypeScript 类型定义

### 最佳实践

1. **统一使用**: 在整个应用中统一使用全局对话框，避免混用其他对话框组件
2. **合理分类**: 根据消息类型选择合适的对话框类型（info/success/warning/error）
3. **清晰文案**: 提供清晰、简洁的标题和消息内容
4. **适当配置**: 根据具体场景配置合适的按钮文本和颜色
5. **错误处理**: 在异步操作中正确处理错误和加载状态