<!--
/**
 * @fileoverview 全局对话框测试页面
 * @description 用于测试全局对话框组件的各种功能
 * @author 开发团队
 * @created 2024-01-20
 * @version 1.0.0
 */
-->

<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <!-- 页面标题 -->
        <v-card class="jelly-card mb-6" rounded="xl" elevation="4">
          <v-card-title class="text-h4 pa-6 text-center">
            <v-icon size="48" color="primary" class="me-3">mdi-test-tube</v-icon>
            全局对话框测试
          </v-card-title>
          <v-card-subtitle class="text-center pb-6">
            测试各种类型的全局对话框组件功能
          </v-card-subtitle>
        </v-card>

        <v-row>
          <!-- 基础对话框测试 -->
          <v-col cols="12" md="6">
            <v-card class="jelly-card mb-4" rounded="lg" elevation="2">
              <v-card-title class="text-h6 bg-primary text-white">
                <v-icon class="me-2">mdi-information</v-icon>
                基础对话框
              </v-card-title>
              <v-card-text class="pa-4">
                <div class="d-flex flex-wrap gap-2">
                  <v-btn
                    color="info"
                    variant="flat"
                    size="small"
                    @click="testInfoDialog"
                  >
                    <v-icon start>mdi-information</v-icon>
                    信息
                  </v-btn>
                  
                  <v-btn
                    color="success"
                    variant="flat"
                    size="small"
                    @click="testSuccessDialog"
                  >
                    <v-icon start>mdi-check-circle</v-icon>
                    成功
                  </v-btn>
                  
                  <v-btn
                    color="warning"
                    variant="flat"
                    size="small"
                    @click="testWarningDialog"
                  >
                    <v-icon start>mdi-alert</v-icon>
                    警告
                  </v-btn>
                  
                  <v-btn
                    color="error"
                    variant="flat"
                    size="small"
                    @click="testErrorDialog"
                  >
                    <v-icon start>mdi-alert-circle</v-icon>
                    错误
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 交互对话框测试 -->
          <v-col cols="12" md="6">
            <v-card class="jelly-card mb-4" rounded="lg" elevation="2">
              <v-card-title class="text-h6 bg-secondary text-white">
                <v-icon class="me-2">mdi-gesture-tap</v-icon>
                交互对话框
              </v-card-title>
              <v-card-text class="pa-4">
                <div class="d-flex flex-wrap gap-2">
                  <v-btn
                    color="primary"
                    variant="flat"
                    size="small"
                    @click="testConfirmDialog"
                  >
                    <v-icon start>mdi-help-circle</v-icon>
                    确认
                  </v-btn>
                  
                  <v-btn
                    color="purple"
                    variant="flat"
                    size="small"
                    @click="testLoadingDialog"
                  >
                    <v-icon start>mdi-loading</v-icon>
                    加载
                  </v-btn>
                  
                  <v-btn
                    color="teal"
                    variant="flat"
                    size="small"
                    @click="testCustomDialog"
                  >
                    <v-icon start>mdi-cog</v-icon>
                    自定义
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 高级功能测试 -->
          <v-col cols="12" md="6">
            <v-card class="jelly-card mb-4" rounded="lg" elevation="2">
              <v-card-title class="text-h6 bg-orange text-white">
                <v-icon class="me-2">mdi-star</v-icon>
                高级功能
              </v-card-title>
              <v-card-text class="pa-4">
                <div class="d-flex flex-wrap gap-2">
                  <v-btn
                    color="indigo"
                    variant="flat"
                    size="small"
                    @click="testPersistentDialog"
                  >
                    <v-icon start>mdi-lock</v-icon>
                    持久化
                  </v-btn>
                  
                  <v-btn
                    color="pink"
                    variant="flat"
                    size="small"
                    @click="testScrollableDialog"
                  >
                    <v-icon start>mdi-scroll-vertical</v-icon>
                    可滚动
                  </v-btn>
                  
                  <v-btn
                    color="cyan"
                    variant="flat"
                    size="small"
                    @click="testNoHeaderDialog"
                  >
                    <v-icon start>mdi-minus</v-icon>
                    无头部
                  </v-btn>
                  
                  <v-btn
                    color="lime"
                    variant="flat"
                    size="small"
                    @click="testAsyncDialog"
                  >
                    <v-icon start>mdi-clock</v-icon>
                    异步操作
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 测试结果 -->
          <v-col cols="12" md="6">
            <v-card class="jelly-card mb-4" rounded="lg" elevation="2">
              <v-card-title class="text-h6 bg-green text-white">
                <v-icon class="me-2">mdi-clipboard-text</v-icon>
                测试结果
              </v-card-title>
              <v-card-text class="pa-4">
                <div v-if="testResults.length === 0" class="text-center text-medium-emphasis">
                  <v-icon size="48" class="mb-2">mdi-clipboard-outline</v-icon>
                  <div>暂无测试结果</div>
                  <div class="text-caption">点击上方按钮开始测试</div>
                </div>
                
                <v-timeline v-else density="compact" class="test-timeline">
                  <v-timeline-item
                    v-for="(result, index) in testResults.slice(-5)"
                    :key="index"
                    :dot-color="getResultColor(result.type)"
                    size="small"
                  >
                    <template #icon>
                      <v-icon size="16">{{ getResultIcon(result.type) }}</v-icon>
                    </template>
                    
                    <div class="text-body-2">
                      <strong>{{ result.action }}</strong>
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ result.message }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatTime(result.timestamp) }}
                    </div>
                  </v-timeline-item>
                </v-timeline>
                
                <div v-if="testResults.length > 5" class="text-center mt-2">
                  <v-btn
                    variant="text"
                    size="small"
                    @click="clearResults"
                  >
                    清空结果
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 测试统计 -->
        <v-card class="jelly-card" rounded="lg" elevation="2">
          <v-card-title class="text-h6">
            <v-icon class="me-2">mdi-chart-bar</v-icon>
            测试统计
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" sm="3">
                <v-card variant="tonal" color="primary">
                  <v-card-text class="text-center">
                    <div class="text-h4">{{ testResults.length }}</div>
                    <div class="text-caption">总测试次数</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="tonal" color="success">
                  <v-card-text class="text-center">
                    <div class="text-h4">{{ getResultCount('success') }}</div>
                    <div class="text-caption">成功次数</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="tonal" color="warning">
                  <v-card-text class="text-center">
                    <div class="text-h4">{{ getResultCount('cancel') }}</div>
                    <div class="text-caption">取消次数</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="tonal" color="info">
                  <v-card-text class="text-center">
                    <div class="text-h4">{{ getResultCount('info') }}</div>
                    <div class="text-caption">信息次数</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { globalDialog } from '@/composables/useGlobalDialog'

/**
 * 测试结果接口
 */
interface TestResult {
  action: string
  type: 'success' | 'cancel' | 'info' | 'error'
  message: string
  timestamp: Date
}

/**
 * 测试结果列表
 */
const testResults = ref<TestResult[]>([])

/**
 * 添加测试结果
 */
const addResult = (action: string, type: TestResult['type'], message: string) => {
  testResults.value.push({
    action,
    type,
    message,
    timestamp: new Date()
  })
}

/**
 * 清空测试结果
 */
const clearResults = () => {
  testResults.value = []
}

/**
 * 获取结果数量
 */
const getResultCount = (type: string) => {
  return testResults.value.filter(result => result.type === type).length
}

/**
 * 获取结果颜色
 */
const getResultColor = (type: string) => {
  const colorMap: Record<string, string> = {
    success: 'success',
    cancel: 'warning',
    info: 'info',
    error: 'error'
  }
  return colorMap[type] || 'grey'
}

/**
 * 获取结果图标
 */
const getResultIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    success: 'mdi-check',
    cancel: 'mdi-close',
    info: 'mdi-information',
    error: 'mdi-alert'
  }
  return iconMap[type] || 'mdi-circle'
}

/**
 * 格式化时间
 */
const formatTime = (date: Date) => {
  return date.toLocaleTimeString()
}

// 测试方法
const testInfoDialog = () => {
  globalDialog.showInfo(
    '信息对话框测试',
    '这是一个信息对话框，用于显示一般性信息给用户。',
    {
      onConfirm: () => {
        addResult('信息对话框', 'success', '用户点击了确定按钮')
      }
    }
  )
}

const testSuccessDialog = () => {
  globalDialog.showSuccess(
    '成功对话框测试',
    '恭喜！操作已成功完成。这是一个成功对话框的示例。',
    {
      onConfirm: () => {
        addResult('成功对话框', 'success', '用户确认了成功消息')
      }
    }
  )
}

const testWarningDialog = () => {
  globalDialog.showWarning(
    '警告对话框测试',
    '请注意：这是一个警告对话框，用于提醒用户注意相关事项。',
    {
      onConfirm: () => {
        addResult('警告对话框', 'success', '用户已阅读警告信息')
      }
    }
  )
}

const testErrorDialog = () => {
  globalDialog.showError(
    '错误对话框测试',
    '抱歉，发生了一个错误。这是一个错误对话框的示例。',
    {
      onConfirm: () => {
        addResult('错误对话框', 'success', '用户确认了错误信息')
      }
    }
  )
}

const testConfirmDialog = async () => {
  const confirmed = await globalDialog.showConfirm(
    '确认对话框测试',
    '您确定要执行此操作吗？此操作不可撤销。'
  )
  
  if (confirmed) {
    addResult('确认对话框', 'success', '用户确认了操作')
  } else {
    addResult('确认对话框', 'cancel', '用户取消了操作')
  }
}

const testLoadingDialog = () => {
  globalDialog.showLoading('加载测试', '正在处理您的请求，请稍候...')
  addResult('加载对话框', 'info', '显示加载对话框')
  
  // 模拟异步操作
  setTimeout(() => {
    globalDialog.hideDialog()
    addResult('加载对话框', 'success', '加载完成，对话框已关闭')
  }, 3000)
}

const testCustomDialog = () => {
  globalDialog.showDialog({
    type: 'custom',
    title: '自定义对话框测试',
    message: '这是一个完全自定义的对话框。您可以自定义对话框的各种属性，包括按钮文本、颜色、图标等。这个对话框展示了自定义功能的强大之处。',
    icon: 'mdi-star',
    maxWidth: 600,
    confirmButtonText: '太棒了！',
    confirmButtonColor: 'purple',
    cancelButtonText: '返回',
    onConfirm: () => {
      addResult('自定义对话框', 'success', '用户喜欢自定义对话框')
    },
    onCancel: () => {
      addResult('自定义对话框', 'cancel', '用户返回了')
    }
  })
}

const testPersistentDialog = () => {
  globalDialog.showDialog({
    type: 'info',
    title: '持久化对话框测试',
    message: '这是一个持久化对话框，点击外部区域不会关闭。只能通过按钮关闭。',
    persistent: true,
    confirmButtonText: '我知道了',
    showCancelButton: false,
    onConfirm: () => {
      addResult('持久化对话框', 'success', '用户通过按钮关闭了持久化对话框')
    }
  })
}

const testScrollableDialog = () => {
  const longContent = `这是一个可滚动的对话框测试。当内容很长时，对话框会变成可滚动的。Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`
  
  globalDialog.showDialog({
    type: 'info',
    title: '可滚动对话框测试',
    message: longContent,
    scrollable: true,
    maxWidth: 500,
    showCancelButton: false,
    onConfirm: () => {
      addResult('可滚动对话框', 'success', '用户关闭了可滚动对话框')
    }
  })
}

const testNoHeaderDialog = () => {
  globalDialog.showDialog({
    type: 'info',
    title: '',
    message: '这是一个简化的对话框，采用Vuetify标准样式。',
    showCancelButton: false,
    confirmButtonText: '关闭',
    onConfirm: () => {
      addResult('简化对话框', 'success', '用户关闭了简化对话框')
    }
  })
}

const testAsyncDialog = () => {
  globalDialog.showDialog({
    type: 'confirm',
    title: '异步操作测试',
    message: '点击确定将执行一个异步操作（模拟网络请求）',
    onConfirm: async () => {
      addResult('异步操作', 'info', '开始执行异步操作')
      
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      addResult('异步操作', 'success', '异步操作完成')
    },
    onCancel: () => {
      addResult('异步操作', 'cancel', '用户取消了异步操作')
    }
  })
}
</script>

<style scoped>
/**
 * 测试页面样式
 */

/* 果冻效果 */
.jelly-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.jelly-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 按钮样式 */
.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: scale(1.05);
}

.v-btn:active {
  transform: scale(0.95);
}

/* 时间线样式 */
.test-timeline {
  max-height: 300px;
  overflow-y: auto;
}

/* 间距工具类 */
.gap-2 {
  gap: 8px;
}
</style>