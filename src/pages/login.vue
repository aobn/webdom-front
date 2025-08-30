<!--
/**
 * @fileoverview 科幻风格登录页面
 * @description 提供用户登录功能的科幻简约风格界面
 * @author 开发团队 <dev@example.com>
 * @created 2024-01-20
 * @updated 2024-01-20
 * @version 1.0.0
 */
-->

<template>
  <!-- 登录页面容器 -->
  <div class="login-page">
    <!-- 背景动画层 -->
    <div class="background-animation">
      <div class="grid-lines"></div>
      <div class="floating-particles">
        <div 
          v-for="i in 20" 
          :key="i" 
          class="particle"
          :style="getParticleStyle(i)"
        ></div>
      </div>
    </div>

    <!-- 主登录容器 -->
    <v-container class="login-container" fluid>
      <v-row justify="end" align="center" class="fill-height">
        <v-col cols="12" sm="6" md="5" lg="4" xl="3" class="login-col">
          <!-- 登录卡片 -->
          <v-card 
            class="login-card elevation-24"
            :loading="loading"
          >
            <!-- 卡片头部 -->
            <v-card-title class="login-header">
              <div class="header-content">
                <div class="logo-container">
                  <v-icon 
                    icon="mdi-shield-lock-outline" 
                    size="48" 
                    class="login-icon"
                  />
                </div>
                <h2 class="login-title">系统登录</h2>
                <p class="login-subtitle">安全访问控制中心</p>
              </div>
            </v-card-title>

            <!-- 登录表单 -->
            <v-card-text class="login-form">
              <!-- 错误提示 -->
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <!-- 成功提示 -->
              <v-alert
                v-if="successMessage"
                type="success"
                variant="tonal"
                class="mb-4"
              >
                {{ successMessage }}
              </v-alert>

              <v-form 
                ref="loginForm" 
                v-model="formValid" 
                @submit.prevent="handleLogin"
              >
                <!-- 邮箱输入框 -->
                <v-text-field
                  v-model="loginData.email"
                  :rules="emailRules"
                  label="邮箱地址"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  class="login-input"
                  :disabled="loading"
                  @keyup.enter="handleLogin"
                />

                <!-- 密码输入框 -->
                <v-text-field
                  v-model="loginData.password"
                  :rules="passwordRules"
                  :type="showPassword ? 'text' : 'password'"
                  label="密码"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  class="login-input"
                  :disabled="loading"
                  @click:append-inner="showPassword = !showPassword"
                  @keyup.enter="handleLogin"
                />

                <!-- 记住我选项 -->
                <v-checkbox
                  v-model="loginData.rememberMe"
                  label="记住登录状态"
                  class="remember-checkbox"
                  :disabled="loading"
                />

                <!-- 登录按钮 -->
                <v-btn
                  type="submit"
                  :loading="loading"
                  :disabled="!formValid || loading"
                  color="primary"
                  size="large"
                  variant="elevated"
                  class="login-btn"
                  block
                >
                  <v-icon icon="mdi-login" class="mr-2" />
                  登录系统
                </v-btn>
              </v-form>
            </v-card-text>

            <!-- 卡片底部 -->
            <v-card-actions class="login-footer">
              <v-spacer />
              <v-btn
                variant="text"
                size="small"
                class="forgot-btn"
                @click="handleForgotPassword"
              >
                忘记密码？
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 版权信息 -->
    <div class="copyright">
      <p>&copy; 2024 科幻系统 - 安全登录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 登录页面的组合式 API 逻辑
 * 
 * @description 处理用户登录、表单验证和界面交互
 */

// 导入认证服务和类型
import { ref, watch, onMounted } from 'vue';
import { authService } from '@/services';
import type { LoginFormData } from '@/types/auth';
import { useRouter, useRoute } from 'vue-router';

// 获取路由实例
const router = useRouter();
const route = useRoute();

/**
 * 登录表单引用
 */
const loginForm = ref();

/**
 * 表单验证状态
 */
const formValid = ref(false);

/**
 * 加载状态
 */
const loading = ref(false);

/**
 * 密码显示状态
 */
const showPassword = ref(false);

/**
 * 登录数据
 */
const loginData = ref<LoginFormData>({
  email: '',
  password: '',
  rememberMe: false
});

/**
 * 邮箱验证规则
 */
const emailRules = [
  (v: string) => !!v || '请输入邮箱地址',
  (v: string) => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址'
];

/**
 * 密码验证规则
 */
const passwordRules = [
  (v: string) => !!v || '请输入密码',
  (v: string) => v.length >= 6 || '密码至少6个字符',
  (v: string) => v.length <= 50 || '密码不能超过50个字符'
];

/**
 * 获取粒子样式
 * 
 * @description 为背景动画粒子生成随机样式
 * @param index - 粒子索引
 * @returns 粒子的CSS样式对象
 */
const getParticleStyle = (index: number) => {
  const delay = Math.random() * 10;
  const duration = 15 + Math.random() * 10;
  const size = 2 + Math.random() * 4;
  
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
};

/**
 * 错误消息状态
 */
const errorMessage = ref('');

/**
 * 成功消息状态
 */
const successMessage = ref('');

/**
 * 显示错误提示
 * 
 * @param message - 错误消息
 */
const showError = (message: string) => {
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = '';
  }, 5000);
};

/**
 * 显示成功提示
 * 
 * @param message - 成功消息
 */
const showSuccess = (message: string) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

/**
 * 处理登录提交
 * 
 * @description 验证表单并执行登录逻辑
 */
const handleLogin = async (): Promise<void> => {
  if (!loginForm.value) return;
  
  const { valid } = await loginForm.value.validate();
  if (!valid) return;

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    // 调用真实的登录API
    const response = await authService.login({
      email: loginData.value.email,
      password: loginData.value.password
    });
    
    // 登录成功处理
    console.log('登录成功:', response);
    showSuccess('登录成功！正在跳转...');
    
    // 处理记住我功能
    if (loginData.value.rememberMe) {
      localStorage.setItem('rememberedEmail', loginData.value.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    // 延迟跳转，让用户看到成功提示
    setTimeout(async () => {
      handleRedirectAfterLogin();
    }, 1500);
    
  } catch (error: any) {
    console.error('登录失败:', error);
    
    // 根据错误类型显示不同的错误消息
    let errorMsg = '登录失败，请稍后重试';
    
    if (error.message) {
      if (error.message.includes('401') || error.message.includes('认证失败')) {
        errorMsg = '邮箱或密码错误，请检查后重试';
      } else if (error.message.includes('网络')) {
        errorMsg = '网络连接失败，请检查网络设置';
      } else if (error.message.includes('超时')) {
        errorMsg = '请求超时，请稍后重试';
      } else {
        errorMsg = error.message;
      }
    }
    
    showError(errorMsg);
  } finally {
    loading.value = false;
  }
};



/**
 * 处理忘记密码
 * 
 * @description 处理忘记密码功能
 */
const handleForgotPassword = (): void => {
  console.log('忘记密码功能');
  // 这里应该跳转到密码重置页面或显示重置对话框
};

/**
 * 处理登录成功后的重定向
 * 
 * @description 根据路由参数重定向到目标页面或默认首页
 */
const handleRedirectAfterLogin = async (): Promise<void> => {
  const redirectPath = route.query.redirect as string;
  if (redirectPath && redirectPath !== '/login') {
    console.log('重定向到原始页面:', redirectPath);
    await router.push(redirectPath);
  } else {
    console.log('重定向到首页');
    await router.push('/');
  }
};

/**
 * 监听记住我状态变化
 */
watch(() => loginData.value.rememberMe, (newValue) => {
  if (newValue && loginData.value.email) {
    localStorage.setItem('rememberedEmail', loginData.value.email);
  } else {
    localStorage.removeItem('rememberedEmail');
  }
});

/**
 * 检查登录状态并自动跳转
 */
const checkLoginStatusAndRedirect = () => {
  try {
    // 使用 authService 检查登录状态
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      console.log('用户已登录，自动跳转到主页:', user);
      
      // 显示提示信息
      showSuccess('您已登录，正在跳转到主页...');
      
      // 延迟跳转，让用户看到提示
      setTimeout(() => {
        handleRedirectAfterLogin();
      }, 1000);
    }
  } catch (error) {
    console.error('检查登录状态失败:', error);
  }
};

/**
 * 组件挂载时的初始化操作
 */
onMounted(() => {
  // 检查用户是否已登录，如果已登录则自动跳转
  checkLoginStatusAndRedirect();
  
  // 从本地存储恢复记住的邮箱
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    loginData.value.email = rememberedEmail;
    loginData.value.rememberMe = true;
  }
});
</script>

<style scoped>
/**
 * 登录页面样式
 * 
 * @description 科幻风格的登录界面样式定义
 */

/* 页面容器 */
.login-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #f8fafc 0%, 
    #f1f5f9 25%, 
    #e2e8f0 50%, 
    #f8fafc 75%, 
    #ffffff 100%);
  overflow: hidden;
}

/* 背景动画层 */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.3;
}

/* 网格线条 */
.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px);
  background-size: 80px 80px;
  border-radius: 20px;
}



/* 浮动粒子容器 */
.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 粒子样式 */
.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(148, 163, 184, 0.2) 0%, rgba(203, 213, 225, 0.1) 70%, transparent 100%);
  border-radius: 50%;
  animation: float 25s ease-in-out infinite;
  box-shadow: 
    0 0 10px rgba(148, 163, 184, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

/* 粒子浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10%, 90% {
    opacity: 0.6;
  }
  50% {
    transform: translateY(-60px) rotate(90deg);
  }
}

/* 登录容器 */
.login-container {
  position: relative;
  z-index: 2;
  height: 100vh;
}

/* 登录列容器 */
.login-col {
  padding-right: 60px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .login-col {
    padding-right: 16px;
    padding-left: 16px;
    justify-content: center;
  }
  
  .login-card {
    max-width: 320px;
  }
  
  .login-header {
    padding: 24px 20px 12px;
  }
  
  .login-form {
    padding: 20px;
  }
  
  .login-footer {
    padding: 12px 20px 20px;
  }
}

/* 登录卡片 */
.login-card {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px !important;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.05),
    0 2px 8px rgba(0, 0, 0, 0.02) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  max-width: 380px;
  width: 100%;
  margin: 0;
  transform: translateY(0);
}

.login-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.04);
}

/* 登录头部 */
.login-header {
  padding: 28px 24px 16px;
  text-align: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* Logo容器 */
.logo-container {
  position: relative;
  padding: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.15));
  border: 2px solid rgba(59, 130, 246, 0.2);
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.logo-container:hover {
  transform: scale(1.05);
  box-shadow: 
    0 6px 20px rgba(59, 130, 246, 0.15),
    inset 0 1px 3px rgba(255, 255, 255, 0.6);
}

.login-icon {
  color: #3b82f6 !important;
  transition: all 0.3s ease;
}

/* 登录标题 */
.login-title {
  color: #1e293b;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.login-subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

/* 登录表单 */
.login-form {
  padding: 24px;
}

/* 输入框样式 */
.login-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.8) !important;
  border-color: rgba(148, 163, 184, 0.3) !important;
  border-radius: 12px !important;
  border-width: 1px !important;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.login-input :deep(.v-field--focused) {
  border-color: #3b82f6 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.1),
    inset 0 1px 3px rgba(255, 255, 255, 0.9) !important;
}

.login-input :deep(.v-field__input) {
  color: #1e293b !important;
  padding: 16px 20px !important;
}

.login-input :deep(.v-label) {
  color: #64748b !important;
  font-weight: 500;
}

.login-input :deep(.v-field__prepend-inner .v-icon) {
  color: #3b82f6 !important;
}

.login-input :deep(.v-field__append-inner .v-icon) {
  color: #64748b !important;
}

/* 记住我复选框 */
.remember-checkbox {
  margin: 16px 0;
}

.remember-checkbox :deep(.v-label) {
  color: #475569 !important;
  font-size: 14px;
  font-weight: 500;
}

.remember-checkbox :deep(.v-selection-control__input) {
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.remember-checkbox :deep(.v-selection-control__input:hover) {
  transform: scale(1.1);
}

.remember-checkbox :deep(.v-selection-control__input .v-icon) {
  color: #3b82f6 !important;
}

/* 登录按钮 */
.login-btn {
  margin-top: 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: #ffffff !important;
  font-weight: 600;
  text-transform: none;
  border-radius: 12px !important;
  padding: 12px 24px !important;
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.2) !important;
  transition: all 0.3s ease;
  border: none !important;
}

.login-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  transform: translateY(-1px);
  box-shadow: 
    0 6px 20px rgba(59, 130, 246, 0.3),
    inset 0 1px 3px rgba(255, 255, 255, 0.25) !important;
}

.login-btn:active {
  transform: translateY(0);
  transition: all 0.1s ease;
}

.login-btn:disabled {
  background: rgba(148, 163, 184, 0.3) !important;
  color: rgba(255, 255, 255, 0.6) !important;
  transform: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

/* 登录底部 */
.login-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
}

/* 忘记密码按钮 */
.forgot-btn {
  color: #3b82f6 !important;
  text-transform: none;
  font-size: 12px;
}

.forgot-btn:hover {
  background: rgba(59, 130, 246, 0.1) !important;
}

/* 版权信息 */
.copyright {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  text-align: center;
}

.copyright p {
  color: rgba(100, 116, 139, 0.6);
  font-size: 12px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .login-card {
    margin: 20px;
    max-width: none;
  }
  
  .login-header {
    padding: 24px 16px 12px;
  }
  
  .login-form {
    padding: 16px;
  }
  
  .login-title {
    font-size: 20px;
  }
}

/* 加载状态样式 */
.v-card--loading {
  pointer-events: none;
}

.v-card--loading::before {
  background: rgba(59, 130, 246, 0.1);
}
</style>