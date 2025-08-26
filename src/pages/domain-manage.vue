<!--
/**
 * @fileoverview 域名管理页面
 * @description 用户域名管理界面，显示用户的三级域名列表
 * @author 开发团队
 * @created 2024-01-20
 * @version 1.0.0
 */
-->

<template>
  <div class="domain-manage-container">
    <!-- 标题区域 -->
    <div class="domain-title-section d-flex align-center mb-6">
      <v-icon color="primary" size="36" class="me-3">mdi-earth</v-icon>
      <h1 class="text-h4 font-weight-bold">域名管理</h1>
    </div>
    
    <!-- 域名列表卡片 -->
    <v-card class="domain-list-card rounded-lg" elevation="1">
      <v-card-title class="pa-4 d-flex align-center justify-space-between">
        <span class="text-h6 font-weight-bold">我的域名</span>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-refresh"
          @click="loadDomainList"
          :loading="loading"
        >
          刷新
        </v-btn>
      </v-card-title>
      
      <!-- 加载状态 -->
      <div v-if="loading && domainList.length === 0" class="text-center pa-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <div class="mt-4 text-body-1">正在加载域名列表...</div>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="!loading && domainList.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-domain-off</v-icon>
        <div class="text-h6 mb-2">暂无域名</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          您还没有注册任何三级域名
        </div>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="goToRegister"
        >
          注册域名
        </v-btn>
      </div>
      
      <!-- 域名列表 -->
      <v-card-text v-else class="pa-0">
        <div class="domain-table">
          <!-- 表格头部 -->
          <div class="domain-table-header d-flex px-4 py-2">
            <div class="domain-column" style="flex: 2">域名</div>
            <div class="domain-column" style="flex: 1.5">创建时间</div>
            <div class="domain-column" style="flex: 1">状态</div>
            <div class="domain-column text-center" style="flex: 1.5">操作</div>
          </div>
          
          <v-divider></v-divider>
          
          <!-- 域名项 -->
          <div
            v-for="(domain, index) in domainList"
            :key="domain.id"
            class="domain-item d-flex align-center px-4 py-3"
            :class="{ 'domain-item-hover': true }"
          >
<div class="domain-column" style="flex: 2">
  <div class="d-flex align-center">
    <v-icon 
      :color="getStatusColor(domain.status)" 
      size="16" 
      class="me-2"
    >
      mdi-circle
    </v-icon>
    <span class="font-weight-medium domain-name">
      {{ domain.subdomain }}.{{ domain.domain }}
    </span>
  </div>
</div>
            <div class="domain-column text-medium-emphasis" style="flex: 1.5">
              {{ formatDate(domain.createTime) }}
            </div>
            <div class="domain-column" style="flex: 1">
              <v-chip
                :color="getStatusColor(domain.status)"
                variant="tonal"
                size="small"
              >
                {{ getStatusText(domain.status) }}
              </v-chip>
            </div>
            <div class="domain-column text-center" style="flex: 1.5">
              <div class="d-flex justify-center">
                <v-btn
                  class="me-2"
                  density="comfortable"
                  variant="tonal"
                  color="primary"
                  size="small"
                  @click="manageDomain(domain)"
                >
                  管理
                </v-btn>
                <v-btn
                  density="comfortable"
                  variant="flat"
                  color="error"
                  size="small"
                  :loading="deletingIds.includes(domain.id)"
                  @click="confirmDeleteDomain(domain)"
                >
                  删除
                </v-btn>
              </div>
            </div>
            
          </div>
        </div>
      </v-card-text>
    </v-card>
    
    <!-- 错误提示 -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      {{ errorMessage }}
      <template #actions>
        <v-btn
          color="white"
          variant="text"
          @click="showError = false"
        >
          关闭
        </v-btn>
      </template>
    </v-snackbar>
    
  <!-- 成功提示 -->
  <v-snackbar
    v-model="showSuccess"
    color="success"
    timeout="3000"
    location="top"
  >
    {{ successMessage }}
  </v-snackbar>
  
  <!-- 登录对话框 -->
  <LoginDialog
    :visible="showLoginDialog"
    @update:visible="showLoginDialog = $event"
    title="需要登录"
    @login-success="handleLoginSuccess"
    @login-cancel="handleLoginCancel"
  />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { http } from '@/utils/http'
import { authService } from '@/services/authService'
import { useGlobalDialog } from '@/composables/useGlobalDialog'
import LoginDialog from '@/components/LoginDialog.vue'

// 定义事件
const emit = defineEmits<{
  manageDns: [domain: string]
}>()

// 路由
const router = useRouter()

// 全局对话框
const { showConfirm } = useGlobalDialog()

// 响应式数据
const loading = ref(false)
const domainList = ref<DomainRecord[]>([])
const deletingIds = ref<number[]>([])
const showError = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const successMessage = ref('')
const isAuthenticated = ref(false)
const showLoginDialog = ref(false)

// 域名记录接口
interface DomainRecord {
  id: number
  userId: number
  subdomain: string
  domain: string
  recordId: number
  ipAddress: string
  ttl: number
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  createTime: string
  updateTime: string
}

/**
 * 加载域名列表
 * 
 * @description 调用后端API获取当前用户的三级域名列表
 */
const loadDomainList = async () => {
  if (!authService.isAuthenticated()) {
    showErrorMessage('请先登录')
    showLoginDialog.value = true
    return
  }

  loading.value = true
  try {
    console.log('开始加载用户三级域名列表...')
    
    // 调用API获取用户三级域名列表
    const response = await http.get('/api/user/subdomain/list/mine')
    
    // 检查响应格式
    if (response && response.code === 200 && Array.isArray(response.data)) {
      // 直接使用响应中的data数组
      domainList.value = response.data || []
      console.log('域名列表加载成功:', domainList.value)
      
      if (domainList.value.length === 0) {
        console.log('用户暂无三级域名记录')
      }
    } else {
      console.error('响应格式不符合预期:', response)
      domainList.value = []
      showErrorMessage('数据格式错误，请联系管理员')
    }
  } catch (error: any) {
    console.error('加载域名列表失败:', error)
    domainList.value = []
    
    if (error.name === 'HttpError' && error.message.includes('登录已过期')) {
      showErrorMessage('登录已过期，请重新登录')
      authService.logout()
      router.push('/login')
    } else if (error.name === 'BusinessError') {
      showErrorMessage(error.message || '业务处理错误')
    } else {
      showErrorMessage(error.message || '网络错误，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

/**
 * 删除域名确认
 */
const confirmDeleteDomain = async (domain: DomainRecord) => {
  const confirmed = await showConfirm(
    '确认删除域名',
    `您确定要删除域名 "${domain.subdomain}.${domain.domain}" 吗？此操作不可撤销。`,
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    }
  )
  
  if (confirmed) {
    await deleteDomain(domain)
  }
}

/**
 * 删除域名
 */
const deleteDomain = async (domain: DomainRecord) => {
  deletingIds.value.push(domain.id)
  
  try {
    // HTTP工具类已经处理了响应，成功时直接返回data
    await http.delete(`/api/user/domains/subdomains/${domain.id}`)
    
    showSuccessMessage('域名删除成功')
    // 从列表中移除已删除的域名
    domainList.value = domainList.value.filter(d => d.id !== domain.id)
  } catch (error: any) {
    console.error('删除域名失败:', error)
    
    if (error.name === 'HttpError' && error.message.includes('登录已过期')) {
      showErrorMessage('登录已过期，请重新登录')
      authService.logout()
      router.push('/login')
    } else if (error.message.includes('权限不足')) {
      showErrorMessage('无权删除此域名')
    } else if (error.message.includes('不存在')) {
      showErrorMessage('域名不存在')
    } else {
      showErrorMessage(error.message || '删除失败，请稍后重试')
    }
  } finally {
    deletingIds.value = deletingIds.value.filter(id => id !== domain.id)
  }
}

/**
 * 管理域名
 */
const manageDomain = (domain: DomainRecord) => {
  const fullDomain = `${domain.subdomain}.${domain.domain}`
  console.log('管理域名:', fullDomain)
  // 触发DNS管理事件，让父组件处理页面切换
  emit('manageDns', fullDomain)
}

/**
 * 跳转到域名注册页面
 */
const goToRegister = () => {
  router.push({ path: '/', query: { page: 'domain-register' } })
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'INACTIVE':
      return 'warning'
    case 'DELETED':
      return 'error'
    default:
      return 'grey'
  }
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return '活跃'
    case 'INACTIVE':
      return '不活跃'
    case 'DELETED':
      return '已删除'
    default:
      return '未知'
  }
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

/**
 * 显示错误消息
 */
const showErrorMessage = (message: string) => {
  errorMessage.value = message
  showError.value = true
}

/**
 * 显示成功消息
 */
const showSuccessMessage = (message: string) => {
  successMessage.value = message
  showSuccess.value = true
}

/**
 * 处理登录成功
 */
const handleLoginSuccess = () => {
  console.log('登录成功，加载域名列表')
  showSuccessMessage('登录成功')
  isAuthenticated.value = true
  loadDomainList()
}

/**
 * 处理登录取消
 */
const handleLoginCancel = () => {
  console.log('用户取消登录')
  router.push('/')
}

/**
 * 检查登录状态
 */
const checkAuthStatus = async () => {
  try {
    if (!authService.isAuthenticated()) {
      console.log('未登录状态，显示登录对话框')
      showLoginDialog.value = true
      return false
    }
    
    // 验证令牌有效性
    try {
      const isValid = await authService.validateToken()
      if (!isValid) {
        console.log('登录令牌无效或已过期，显示登录对话框')
        showLoginDialog.value = true
        return false
      }
    } catch (error) {
      console.error('验证令牌失败:', error)
      showLoginDialog.value = true
      return false
    }
    
    isAuthenticated.value = true
    return true
  } catch (error) {
    console.error('检查登录状态失败:', error)
    showLoginDialog.value = true
    return false
  }
}

/**
 * 组件挂载前检查登录状态
 */
onBeforeMount(async () => {
  const authStatus = await checkAuthStatus()
  if (authStatus) {
    console.log('用户已登录，准备加载域名列表')
  }
})

/**
 * 组件挂载时加载数据
 */
onMounted(async () => {
  // 如果用户已认证，直接加载域名列表
  if (isAuthenticated.value) {
    loadDomainList()
  }
  
  // 监听登录对话框的可见性变化
  watch(showLoginDialog, (newValue, oldValue) => {
    // 当登录对话框关闭且用户已认证时，加载域名列表
    if (oldValue === true && newValue === false && isAuthenticated.value) {
      console.log('登录对话框关闭，用户已认证，加载域名列表')
      loadDomainList()
    }
  })
  
  // 监听认证状态变化
  watch(isAuthenticated, (newValue) => {
    if (newValue === true) {
      console.log('用户认证状态变为已登录，加载域名列表')
      loadDomainList()
    }
  })
})
</script>

<style scoped>
.domain-manage-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.domain-title-section {
  margin-bottom: 24px;
}

.domain-list-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.domain-table-header {
  background: rgba(var(--v-theme-surface), 0.5);
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.domain-column {
  display: flex;
  align-items: center;
  padding: 8px 4px;
  font-size: 14px;
}

.domain-item {
  transition: background-color 0.2s ease;
  min-height: 60px;
}

.domain-item-hover:hover {
  background: rgba(var(--v-theme-primary), 0.04);
}

.domain-item:not(:last-child) {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* 响应式设计 */
@media (max-width: 768px) {
  .domain-manage-container {
    padding: 16px;
  }
  
  .domain-column {
    font-size: 12px;
    padding: 4px 2px;
  }
  
  .domain-table-header .domain-column:nth-child(2),
  .domain-item .domain-column:nth-child(2) {
    flex: 1;
  }
  
  .domain-table-header .domain-column:nth-child(3),
  .domain-item .domain-column:nth-child(3) {
    flex: 0.8;
  }
}

@media (max-width: 480px) {
  .domain-table-header .domain-column:nth-child(2),
  .domain-item .domain-column:nth-child(2) {
    display: none;
  }
  
  .domain-column {
    font-size: 11px;
  }
}
</style>