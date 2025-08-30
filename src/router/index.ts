/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { authService } from '@/services/authService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

// 路由守卫：保护需要认证的页面
router.beforeEach((to, from, next) => {
  // 公开路由列表（不需要认证的页面）
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/api-test', '/domain-test']
  
  // 检查是否为公开路由
  const isPublicRoute = publicRoutes.some(route => to.path.startsWith(route))
  
  if (isPublicRoute) {
    // 如果是公开路由，直接放行
    next()
    return
  }
  
  // 对于受保护的路由，检查认证状态
  if (authService.isAuthenticated()) {
    // 用户已认证，允许访问
    next()
  } else {
    // 尝试自动登录
    if (authService.autoLogin()) {
      console.log('自动登录成功，允许访问:', to.path)
      next()
    } else {
      // 自动登录失败，重定向到登录页面
      console.log('用户未认证，重定向到登录页面')
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存原始路径，登录后可以重定向回来
      })
    }
  }
})

// 路由后置守卫：登录后的重定向处理
router.afterEach((to, from) => {
  // 如果从登录页面跳转到其他页面，清除重定向参数
  if (from.path === '/login' && to.path !== '/login') {
    console.log('登录成功，已跳转到:', to.path)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
  
  // 应用启动时尝试自动登录
  if (authService.autoLogin()) {
    console.log('应用启动时自动登录成功')
  }
})

export default router
