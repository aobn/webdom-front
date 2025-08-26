<!--
/**
 * @fileoverview 主页面组件
 * @description 应用的主页面，包含导航抽屉、应用栏和主内容区域
 * @author 开发团队 <dev@example.com>
 * @created 2024-01-20
 * @updated 2024-01-20
 * @version 1.0.0
 */
-->

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" class="jelly-drawer">
      <div class="pa-3">
        <v-card 
          v-for="item in items" 
          :key="item.title"
          class="jelly-card nav-card mb-2" 
          :class="{ 'nav-card-active': isCurrentPage(item.value) }"
          :variant="isCurrentPage(item.value) ? 'elevated' : 'tonal'"
          :color="isCurrentPage(item.value) ? 'primary' : undefined"
          @click="handleNavClick(item.title)"
        >
          <v-card-text class="pa-3">
            <div class="d-flex align-center">
              <v-icon 
                :icon="item.prependIcon" 
                class="me-3" 
                size="20" 
                :color="isCurrentPage(item.value) ? 'white' : undefined"
              />
              <span 
                class="text-body-2 font-weight-medium"
                :class="{ 'text-white': isCurrentPage(item.value) }"
              >
                {{ item.title }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <template #append>
        <div class="pa-3">
          <v-card 
            class="jelly-card settings-card" 
            :class="{ 'nav-card-active': isCurrentPage('settings') }"
            :variant="isCurrentPage('settings') ? 'elevated' : 'tonal'"
            :color="isCurrentPage('settings') ? 'primary' : undefined"
            @click="handleNavClick('Settings')"
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-center">
                <v-icon 
                  icon="mdi-cog-outline" 
                  class="me-3" 
                  size="20" 
                  :color="isCurrentPage('settings') ? 'white' : undefined"
                />
                <span 
                  class="text-body-2 font-weight-medium"
                  :class="{ 'text-white': isCurrentPage('settings') }"
                >
                  Settings
                </span>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar border="b" class="ps-4 jelly-app-bar" flat>
      <!-- 汉堡菜单按钮 -->
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      
      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-icon icon="mdi-view-dashboard" class="me-2" />
          <span>控制面板</span>
        </div>
      </v-app-bar-title>

      <template #append>
        <!-- 主题切换按钮 -->
        <ThemeToggle />
        
        <!-- 用户菜单 -->
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text" class="text-none" style="height: 48px;">
              <v-avatar size="32" :color="isLoggedIn ? 'primary' : 'surface-light'">
                <v-img 
                  v-if="isLoggedIn"
                  src="https://cdn.vuetifyjs.com/images/john.png" 
                  alt="用户头像" 
                />
                <v-icon 
                  v-else
                  icon="mdi-account-outline"
                  color="grey"
                />
              </v-avatar>
            </v-btn>
          </template>
          
          <v-list>
            <!-- 已登录状态 -->
            <template v-if="isLoggedIn">
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-account-circle" density="compact" />
                </template>
                <v-list-item-title>用户信息</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="handleLogout">
                <template #prepend>
                  <v-icon icon="mdi-logout" density="compact" />
                </template>
                <v-list-item-title>退出登录</v-list-item-title>
              </v-list-item>
            </template>
            
            <!-- 未登录状态 -->
            <template v-else>
              <v-list-item @click="handleLogin">
                <template #prepend>
                  <v-icon icon="mdi-login" density="compact" />
                </template>
                <v-list-item-title>登录</v-list-item-title>
              </v-list-item>
            </template>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main>
      <div class="pa-4">
        <!-- 动态内容区域 -->
        
        <!-- 域名注册页面 -->
        <div v-if="currentPageName === 'domain-register'">
          <DomainRegister />
        </div>
        
        <!-- 域名管理页面 -->
        <div v-else-if="currentPageName === 'domain-manage'">
          <DomainManage @manage-dns="handleManageDns" />
        </div>
        
        <!-- DNS记录管理页面 -->
        <div v-else-if="currentPageName === 'dns-manage'">
          <DnsManage />
        </div>
        
        <!-- API测试页面 -->
        <div v-else-if="currentPageName === 'api-test'">
          <ApiTest />
        </div>
        
        <!-- 域名测试页面 -->
        <div v-else-if="currentPageName === 'domain-test'">
          <DomainTest />
        </div>
        
        <!-- 设置页面 -->
        <div v-else-if="currentPageName === 'settings'">
          <v-card class="jelly-card" rounded="lg">
            <v-card-title class="text-h5 pa-6">
              <v-icon class="me-2">mdi-cog-outline</v-icon>
              系统设置
            </v-card-title>
            <v-card-text class="pa-6">
              <div class="text-center py-12">
                <v-icon size="64" color="warning" class="mb-4">mdi-construction</v-icon>
                <div class="text-h6 mb-2">功能开发中</div>
                <div class="text-body-1 text-medium-emphasis">
                  系统设置功能正在开发中，敬请期待...
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
        
        <!-- 主页内容 -->
        <div v-else>
          <v-card 
            class="jelly-card main-content-card" 
            border="dashed md" 
            color="surface-light" 
            height="500" 
            rounded="lg" 
            width="100%" 
            @click="handleMainContentClick"
          >
            <v-card-text class="d-flex align-center justify-center h-100">
              <div class="text-center">
                <v-icon size="64" color="primary" class="mb-4">mdi-view-dashboard</v-icon>
                <div class="text-h5 mb-2">主内容区域</div>
                <div class="text-body-1 text-medium-emphasis mb-4">点击左侧菜单开始您的工作</div>
                
                <!-- 登录状态检查按钮 -->
                <v-btn 
                  class="jelly-card login-status-btn"
                  color="primary"
                  variant="elevated"
                  size="large"
                  prepend-icon="mdi-shield-check"
                  :loading="isCheckingStatus"
                  @click="checkLoginStatus"
                >
                  检查登录状态
                </v-btn>
                
                <!-- 状态显示 -->
                <div v-if="loginStatusMessage" class="mt-4">
                  <v-alert 
                    :type="loginStatusType"
                    :text="loginStatusMessage"
                    variant="tonal"
                    class="jelly-card"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-main>
    
    <!-- 全局对话框 -->
    <GlobalDialog 
      v-model="dialogState.visible"
      :type="dialogState.config.type"
      :title="dialogState.config.title"
      :message="dialogState.config.message"
      :icon="dialogState.config.icon"
      :max-width="dialogState.config.maxWidth"
      :persistent="dialogState.config.persistent"
      :scrollable="dialogState.config.scrollable"
      :loading="dialogState.loading"
      :show-actions="dialogState.config.showActions"
      :show-cancel-button="dialogState.config.showCancelButton"
      :show-confirm-button="dialogState.config.showConfirmButton"
      :cancel-button-text="dialogState.config.cancelButtonText"
      :confirm-button-text="dialogState.config.confirmButtonText"
      @confirm="dialogState.config.onConfirm?.()"
      @cancel="dialogState.config.onCancel?.()"
      @close="dialogState.config.onClose?.()"
    />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import DomainRegister from './domain-register.vue'
import DomainManage from './domain-manage.vue'
import DnsManage from './dns-manage.vue'
import ApiTest from './api-test.vue'
import DomainTest from './domain-test.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import GlobalDialog from '@/components/GlobalDialog.vue'
import { useTheme } from '@/composables/useTheme'
import { authService } from '@/services/authService'
import { useGlobalDialog } from '@/composables/useGlobalDialog'

// 路由
const router = useRouter()

// 主题
const { initTheme } = useTheme()

// 全局对话框
const { showConfirm, dialogState } = useGlobalDialog()

// 响应式数据
const drawer = ref(true)
const isCheckingStatus = ref(false)
const loginStatusMessage = ref('')
const loginStatusType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const isLoggedIn = ref(false) // 登录状态

// 导航项目
const items = ref([
  {
    title: '域名注册',
    prependIcon: 'mdi-magnify',
    value: 'domain-register'
  },
  {
    title: '域名管理',
    prependIcon: 'mdi-web-check',
    value: 'domain-manage'
  },
  {
    title: 'API测试',
    prependIcon: 'mdi-api',
    value: 'api-test'
  },
  {
    title: '域名测试',
    prependIcon: 'mdi-test-tube',
    value: 'domain-test'
  }
])

/**
 * 当前页面名称（根据路由参数确定）
 */
const currentPageName = computed(() => {
  const route = router.currentRoute.value
  // 从路由参数或路径中获取页面名称
  if (route.query.page) {
    return route.query.page as string
  }
  // 如果没有页面参数，默认显示域名注册页面
  return 'domain-register'
})

/**
 * 检查是否为当前页面
 */
const isCurrentPage = (page: string) => {
  const current = currentPageName.value
  // 如果当前是DNS管理页面，域名管理项也应该高亮
  if (current === 'dns-manage' && page === 'domain-manage') {
    return true
  }
  return current === page
}

/**
 * 处理导航点击事件
 */
const handleNavClick = (title: string) => {
  const item = items.value.find(i => i.title === title)
  if (item) {
    // 使用查询参数来切换页面
    router.push({ path: '/', query: { page: item.value } })
  } else if (title === 'Settings') {
    router.push({ path: '/', query: { page: 'settings' } })
  }
}

/**
 * 处理DNS管理事件
 */
const handleManageDns = (domain: string) => {
  console.log('切换到DNS管理页面，域名:', domain)
  // 切换到DNS管理页面，并传递域名参数
  router.push({ 
    path: '/', 
    query: { 
      page: 'dns-manage',
      domain: domain
    }
  })
}

/**
 * 处理主内容区域点击事件
 */
const handleMainContentClick = () => {
  // 可以添加主内容区域的点击逻辑
}

/**
 * 处理登录按钮点击事件
 */
const handleLogin = () => {
  router.push('/login')
}

/**
 * 处理退出登录按钮点击事件
 */
const handleLogout = async () => {
  try {
    // 显示确认对话框
    const confirmed = await showConfirm(
      '确认退出登录',
      '您确定要退出登录吗？退出后需要重新登录才能使用相关功能。',
      {
        confirmButtonText: '退出登录',
        cancelButtonText: '取消'
      }
    )
    
    if (confirmed) {
      // 调用认证服务退出登录
      authService.logout()
      
      // 更新登录状态
      isLoggedIn.value = false
      loginStatusMessage.value = '已成功退出登录'
      loginStatusType.value = 'info'
      
      console.log('用户已退出登录')
      
      // 重新加载页面
      window.location.reload()
    }
  } catch (error) {
    console.error('退出登录失败:', error)
    loginStatusMessage.value = '退出登录失败'
    loginStatusType.value = 'error'
  }
}

/**
 * 检查登录状态
 */
const checkLoginStatus = async () => {
  isCheckingStatus.value = true
  loginStatusMessage.value = ''
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 使用 authService 检查登录状态
    const authenticated = authService.isAuthenticated()
    isLoggedIn.value = authenticated
    
    if (authenticated) {
      const user = authService.getCurrentUser()
      const remainingTime = authService.getTokenRemainingTime()
      
      loginStatusMessage.value = `您已登录 (${user?.username || '未知用户'})`
      loginStatusType.value = 'success'
      
      if (remainingTime > 0) {
        console.log(`Token剩余有效时间: ${Math.floor(remainingTime / 60)}分钟`)
      }
    } else {
      loginStatusMessage.value = '您尚未登录，请先登录'
      loginStatusType.value = 'warning'
    }
  } catch (error) {
    console.error('检查登录状态失败:', error)
    loginStatusMessage.value = '检查登录状态失败'
    loginStatusType.value = 'error'
  } finally {
    isCheckingStatus.value = false
  }
}

/**
 * 组件挂载时的初始化操作
 */
onMounted(() => {
  // 初始化主题
  initTheme()
  
  // 检查用户登录状态
  checkUserLoginStatus()
})

/**
 * 检查用户登录状态
 */
const checkUserLoginStatus = () => {
  try {
    // 使用 authService 检查登录状态
    isLoggedIn.value = authService.isAuthenticated()
    
    if (isLoggedIn.value) {
      const user = authService.getCurrentUser()
      console.log('用户已登录:', user)
    } else {
      console.log('用户未登录')
    }
  } catch (error) {
    console.error('检查登录状态失败:', error)
    isLoggedIn.value = false
  }
}
</script>

<style scoped>
/* 果冻效果样式 */
.jelly-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.jelly-card:hover {
  transform: scale(1.05) translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.jelly-card:active {
  transform: scale(0.98);
}

.jelly-drawer {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.jelly-app-bar {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.8) !important;
}

.nav-card:hover {
  background: rgba(var(--v-theme-primary), 0.1);
}

.nav-card-active {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.5);
}

.nav-card-active:hover {
  transform: scale(1.02) translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4) !important;
}

.settings-card:hover {
  background: rgba(var(--v-theme-secondary), 0.1);
}

.main-content-card {
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  background: rgba(var(--v-theme-surface-light), 0.5);
}

.login-status-btn {
  transition: all 0.3s ease;
}

.login-status-btn:hover {
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 960px) {
  .jelly-card:hover {
    transform: scale(1.02) translateY(-2px);
  }
  
  .main-content-card {
    height: 400px !important;
  }
}
</style>