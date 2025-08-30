/**
 * @fileoverview 全局对话框组合式函数
 * @description 提供全局对话框的状态管理和便捷调用方法
 * @author 开发团队
 * @created 2024-01-20
 * @version 1.0.0
 */

import { ref, reactive } from 'vue'
import type { DialogType } from '@/components/GlobalDialog.vue'

/**
 * 对话框配置接口
 */
export interface DialogConfig {
  type?: DialogType
  title?: string
  message?: string
  icon?: string
  maxWidth?: string | number
  persistent?: boolean
  scrollable?: boolean
  showActions?: boolean
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelButtonText?: string
  confirmButtonText?: string
  confirmButtonColor?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  onClose?: () => void
}

/**
 * 对话框状态
 */
const dialogState = reactive({
  visible: false,
  loading: false,
  config: {} as DialogConfig
})

/**
 * 全局对话框组合式函数
 */
export function useGlobalDialog() {
  /**
   * 显示对话框
   */
  const showDialog = (config: DialogConfig) => {
    dialogState.config = { ...config }
    dialogState.visible = true
    dialogState.loading = false
  }

  /**
   * 隐藏对话框
   */
  const hideDialog = () => {
    dialogState.visible = false
    dialogState.loading = false
  }

  /**
   * 显示信息对话框
   */
  const showInfo = (title: string, message?: string, config?: Partial<DialogConfig>) => {
    showDialog({
      type: 'info',
      title,
      message,
      showCancelButton: false,
      ...config
    })
  }

  /**
   * 显示成功对话框
   */
  const showSuccess = (title: string, message?: string, config?: Partial<DialogConfig>) => {
    showDialog({
      type: 'success',
      title,
      message,
      showCancelButton: false,
      confirmButtonText: '好的',
      ...config
    })
  }

  /**
   * 显示警告对话框
   */
  const showWarning = (title: string, message?: string, config?: Partial<DialogConfig>) => {
    showDialog({
      type: 'warning',
      title,
      message,
      showCancelButton: false,
      confirmButtonText: '我知道了',
      ...config
    })
  }

  /**
   * 显示错误对话框
   */
  const showError = (title: string, message?: string, config?: Partial<DialogConfig>) => {
    showDialog({
      type: 'error',
      title,
      message,
      showCancelButton: false,
      confirmButtonText: '确定',
      confirmButtonColor: 'error',
      ...config
    })
  }

  /**
   * 显示确认对话框
   */
  const showConfirm = (
    title: string, 
    message?: string, 
    config?: Partial<DialogConfig>
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      showDialog({
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          hideDialog()
          resolve(true)
        },
        onCancel: () => {
          hideDialog()
          resolve(false)
        },
        ...config
      })
    })
  }

  /**
   * 显示加载对话框
   */
  const showLoading = (title: string = '处理中...', message?: string) => {
    showDialog({
      type: 'info',
      title,
      message,
      persistent: true,
      showActions: false,
      icon: 'mdi-loading'
    })
    dialogState.loading = true
  }

  /**
   * 处理确认操作
   */
  const handleConfirm = async () => {
    if (dialogState.config.onConfirm) {
      dialogState.loading = true
      try {
        await dialogState.config.onConfirm()
        hideDialog()
      } catch (error) {
        console.error('对话框确认操作失败:', error)
        dialogState.loading = false
      }
    } else {
      hideDialog()
    }
  }

  /**
   * 处理取消操作
   */
  const handleCancel = () => {
    if (dialogState.config.onCancel) {
      dialogState.config.onCancel()
    }
    hideDialog()
  }

  /**
   * 处理关闭操作
   */
  const handleClose = () => {
    if (dialogState.config.onClose) {
      dialogState.config.onClose()
    }
    hideDialog()
  }

  return {
    // 状态
    dialogState,
    
    // 基础方法
    showDialog,
    hideDialog,
    
    // 便捷方法
    showInfo,
    showSuccess,
    showWarning,
    showError,
    showConfirm,
    showLoading,
    
    // 事件处理
    handleConfirm,
    handleCancel,
    handleClose
  }
}

/**
 * 全局对话框实例
 */
export const globalDialog = useGlobalDialog()