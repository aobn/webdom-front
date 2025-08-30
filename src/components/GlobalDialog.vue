<!--
/**
 * @fileoverview 全局统一对话框组件
 * @description 提供统一的对话框样式和交互，支持多种类型和自定义配置
 * @author 开发团队
 * @created 2024-01-20
 * @version 1.0.0
 */
-->

<template>
  <v-dialog
    v-model="isVisible"
    :max-width="maxWidth"
    :persistent="persistent"
    :scrollable="scrollable"
  >
    <v-card
      :prepend-icon="icon"
      :title="title"
      :text="message"
    >
      <!-- 自定义内容插槽 -->
      <template v-if="$slots.content" #text>
        <slot name="content" />
      </template>
      
      <!-- 操作按钮 -->
      <template v-if="showActions" #actions>
        <v-spacer />
        
        <!-- 自定义操作按钮插槽 -->
        <slot name="actions">
          <!-- 取消按钮 -->
          <v-btn
            v-if="showCancelButton"
            :loading="loading"
            @click="handleCancel"
          >
            {{ cancelButtonText }}
          </v-btn>
          
          <!-- 确认按钮 -->
          <v-btn
            v-if="showConfirmButton"
            :loading="loading"
            @click="handleConfirm"
          >
            {{ confirmButtonText }}
          </v-btn>
        </slot>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

/**
 * 对话框类型定义
 */
export type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'custom'

/**
 * 组件属性接口
 */
export interface GlobalDialogProps {
  modelValue: boolean
  type?: DialogType
  title?: string
  message?: string
  icon?: string
  maxWidth?: string | number
  persistent?: boolean
  scrollable?: boolean
  loading?: boolean
  showActions?: boolean
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelButtonText?: string
  confirmButtonText?: string
}

/**
 * 组件属性定义
 */
const props = withDefaults(defineProps<GlobalDialogProps>(), {
  type: 'info',
  title: '',
  message: '',
  icon: '',
  maxWidth: 400,
  persistent: false,
  scrollable: false,
  loading: false,
  showActions: true,
  showCancelButton: true,
  showConfirmButton: true,
  cancelButtonText: '取消',
  confirmButtonText: '确定'
})

/**
 * 组件事件定义
 */
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
  'close': []
}>()

/**
 * 对话框显示状态
 */
const isVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

/**
 * 根据类型获取默认图标
 */
const defaultIcon = computed(() => {
  const iconMap: Record<DialogType, string> = {
    info: 'mdi-information',
    success: 'mdi-check-circle',
    warning: 'mdi-alert',
    error: 'mdi-alert-circle',
    confirm: 'mdi-help-circle',
    custom: ''
  }
  return iconMap[props.type]
})

/**
 * 实际显示的图标
 */
const icon = computed(() => props.icon || defaultIcon.value)

/**
 * 根据类型获取图标颜色
 */
const iconColor = computed(() => {
  const colorMap: Record<DialogType, string> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
    confirm: 'primary',
    custom: 'primary'
  }
  return colorMap[props.type]
})

/**
 * 图标大小
 */
const iconSize = computed(() => {
  return props.type === 'custom' ? 'default' : 48
})

/**
 * 处理确认操作
 */
const handleConfirm = () => {
  emit('confirm')
}

/**
 * 处理取消操作
 */
const handleCancel = () => {
  emit('cancel')
  isVisible.value = false
}

/**
 * 处理关闭操作
 */
const handleClose = () => {
  emit('close')
  isVisible.value = false
}

/**
 * 监听对话框关闭
 */
watch(isVisible, (newValue) => {
  if (!newValue) {
    emit('close')
  }
})
</script>

<style scoped>
/**
 * 全局对话框样式
 * 采用Vuetify标准样式，保持简洁
 */

/* 响应式设计 */
@media (max-width: 600px) {
  .v-card {
    margin: 16px;
    max-width: calc(100vw - 32px) !important;
  }
}
</style>
