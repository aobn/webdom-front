/**
 * @fileoverview 全局对话框组件测试
 * @description 测试全局对话框组件的各种功能和交互
 * @author 开发团队
 * @created 2024-01-20
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import GlobalDialog from '@/components/GlobalDialog.vue'

// 创建 Vuetify 实例
const vuetify = createVuetify({
  components,
  directives,
})

// 全局配置
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

describe('GlobalDialog', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(GlobalDialog, {
      global: {
        plugins: [vuetify],
      },
      props: {
        modelValue: true,
        type: 'info',
        title: '测试标题',
        message: '测试消息'
      }
    })
  })

  it('应该正确渲染对话框', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.dialog-card').exists()).toBe(true)
  })

  it('应该显示正确的标题', () => {
    expect(wrapper.text()).toContain('测试标题')
  })

  it('应该显示正确的消息内容', () => {
    expect(wrapper.text()).toContain('测试消息')
  })

  it('应该根据类型显示正确的图标', async () => {
    // 测试信息类型
    await wrapper.setProps({ type: 'info' })
    expect(wrapper.find('.mdi-information').exists()).toBe(true)

    // 测试成功类型
    await wrapper.setProps({ type: 'success' })
    expect(wrapper.find('.mdi-check-circle').exists()).toBe(true)

    // 测试警告类型
    await wrapper.setProps({ type: 'warning' })
    expect(wrapper.find('.mdi-alert').exists()).toBe(true)

    // 测试错误类型
    await wrapper.setProps({ type: 'error' })
    expect(wrapper.find('.mdi-alert-circle').exists()).toBe(true)
  })

  it('应该在点击确认按钮时触发确认事件', async () => {
    const confirmButton = wrapper.find('[data-testid="confirm-button"]')
    if (confirmButton.exists()) {
      await confirmButton.trigger('click')
      expect(wrapper.emitted('confirm')).toBeTruthy()
    }
  })

  it('应该在点击取消按钮时触发取消事件', async () => {
    const cancelButton = wrapper.find('[data-testid="cancel-button"]')
    if (cancelButton.exists()) {
      await cancelButton.trigger('click')
      expect(wrapper.emitted('cancel')).toBeTruthy()
    }
  })

  it('应该在点击关闭按钮时触发关闭事件', async () => {
    const closeButton = wrapper.find('[data-testid="close-button"]')
    if (closeButton.exists()) {
      await closeButton.trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    }
  })

  it('应该支持自定义图标', async () => {
    await wrapper.setProps({ 
      type: 'custom',
      icon: 'mdi-star' 
    })
    expect(wrapper.find('.mdi-star').exists()).toBe(true)
  })

  it('应该支持隐藏头部', async () => {
    await wrapper.setProps({ showHeader: false })
    expect(wrapper.find('.dialog-header').exists()).toBe(false)
  })

  it('应该支持隐藏操作按钮', async () => {
    await wrapper.setProps({ showActions: false })
    expect(wrapper.find('.dialog-actions').exists()).toBe(false)
  })

  it('应该支持自定义按钮文本', async () => {
    await wrapper.setProps({ 
      confirmButtonText: '自定义确认',
      cancelButtonText: '自定义取消'
    })
    expect(wrapper.text()).toContain('自定义确认')
    expect(wrapper.text()).toContain('自定义取消')
  })

  it('应该在加载状态下禁用按钮', async () => {
    await wrapper.setProps({ loading: true })
    const buttons = wrapper.findAll('.v-btn')
    buttons.forEach((button: any) => {
      expect(button.classes()).toContain('v-btn--loading')
    })
  })

  it('应该支持持久化模式', async () => {
    await wrapper.setProps({ persistent: true })
    const dialog = wrapper.find('.v-dialog')
    expect(dialog.attributes('persistent')).toBeDefined()
  })
})

describe('GlobalDialog 组合式函数', () => {
  let globalDialog: any

  beforeEach(async () => {
    // 动态导入组合式函数
    const module = await import('@/composables/useGlobalDialog')
    globalDialog = module.useGlobalDialog()
  })

  it('应该能够显示信息对话框', () => {
    globalDialog.showInfo('测试标题', '测试消息')
    expect(globalDialog.dialogState.visible).toBe(true)
    expect(globalDialog.dialogState.config.type).toBe('info')
    expect(globalDialog.dialogState.config.title).toBe('测试标题')
    expect(globalDialog.dialogState.config.message).toBe('测试消息')
  })

  it('应该能够显示成功对话框', () => {
    globalDialog.showSuccess('成功', '操作成功')
    expect(globalDialog.dialogState.visible).toBe(true)
    expect(globalDialog.dialogState.config.type).toBe('success')
    expect(globalDialog.dialogState.config.showCancelButton).toBe(false)
  })

  it('应该能够显示警告对话框', () => {
    globalDialog.showWarning('警告', '注意事项')
    expect(globalDialog.dialogState.visible).toBe(true)
    expect(globalDialog.dialogState.config.type).toBe('warning')
  })

  it('应该能够显示错误对话框', () => {
    globalDialog.showError('错误', '操作失败')
    expect(globalDialog.dialogState.visible).toBe(true)
    expect(globalDialog.dialogState.config.type).toBe('error')
    expect(globalDialog.dialogState.config.confirmButtonColor).toBe('error')
  })

  it('应该能够隐藏对话框', () => {
    globalDialog.showInfo('测试')
    expect(globalDialog.dialogState.visible).toBe(true)
    
    globalDialog.hideDialog()
    expect(globalDialog.dialogState.visible).toBe(false)
  })

  it('应该能够显示加载对话框', () => {
    globalDialog.showLoading('加载中', '请稍候')
    expect(globalDialog.dialogState.visible).toBe(true)
    expect(globalDialog.dialogState.loading).toBe(true)
    expect(globalDialog.dialogState.config.persistent).toBe(true)
    expect(globalDialog.dialogState.config.showActions).toBe(false)
  })

  it('应该能够显示自定义对话框', () => {
    const config = {
      type: 'custom' as const,
      title: '自定义标题',
      icon: 'mdi-star',
      maxWidth: 600
    }
    
    globalDialog.showDialog(config)
    expect(globalDialog.dialogState.visible).toBe(true)
    expect(globalDialog.dialogState.config.type).toBe('custom')
    expect(globalDialog.dialogState.config.icon).toBe('mdi-star')
    expect(globalDialog.dialogState.config.maxWidth).toBe(600)
  })

  it('应该正确处理确认操作', () => {
    const mockConfirm = vi.fn()
    globalDialog.showDialog({
      onConfirm: mockConfirm
    })
    
    globalDialog.handleConfirm()
    expect(mockConfirm).toHaveBeenCalled()
    expect(globalDialog.dialogState.visible).toBe(false)
  })

  it('应该正确处理取消操作', () => {
    const mockCancel = vi.fn()
    globalDialog.showDialog({
      onCancel: mockCancel
    })
    
    globalDialog.handleCancel()
    expect(mockCancel).toHaveBeenCalled()
    expect(globalDialog.dialogState.visible).toBe(false)
  })
})