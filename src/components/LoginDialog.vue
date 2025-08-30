<!--
/**
 * @fileoverview 登录对话框组件
 * @description 提供弹窗式登录功能，用于未登录状态下的操作引导
 * @author 开发团队
 * @created 2024-08-23
 * @version 1.0.0
 */
-->

<template>
  <v-dialog
    v-model="isVisible"
    max-width="400"
    persistent
  >
    <v-card class="login-dialog-card">
      <v-card-title class="login-dialog-header">
        <div class="header-content">
          <div class="logo-container">
            <v-icon 
              icon="mdi-shield-lock-outline" 
              size="36" 
              class="login-icon"
            />
          </div>
          <h3 class="login-title">{{ title }}</h3>
        </div>
      </v-card-title>

      <v-card-text class="login-dialog-form">
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
        </v-form>
      </v-card-text>

      <v-card-actions class="login-dialog-actions">
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          取消
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          @click="handleLogin"
          :loading="loading"
          :disabled="!formValid || loading"
        >
          登录
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, computed } from 'vue';
import { authService } from '@/services';
import type { LoginFormData } from '@/types/auth';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '请先登录'
  },
  message: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:visible', 'login-success', 'login-cancel']);

// 对话框可见状态
const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 表单引用
const loginForm = ref();

// 表单验证状态
const formValid = ref(false);

// 加载状态
const loading = ref(false);

// 密码显示状态
const showPassword = ref(false);

// 错误消息
const errorMessage = ref('');

// 登录数据
const loginData = ref<LoginFormData>({
  email: '',
  password: '',
  rememberMe: false
});

// 邮箱验证规则
const emailRules = [
  (v: string) => !!v || '请输入邮箱地址',
  (v: string) => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址'
];

// 密码验证规则
const passwordRules = [
  (v: string) => !!v || '请输入密码',
  (v: string) => v.length >= 6 || '密码至少6个字符',
  (v: string) => v.length <= 50 || '密码不能超过50个字符'
];

// 处理登录
const handleLogin = async () => {
  if (!loginForm.value) return;
  
  const { valid } = await loginForm.value.validate();
  if (!valid) return;

  loading.value = true;
  errorMessage.value = '';
  
  try {
    // 调用登录API
    await authService.login({
      email: loginData.value.email,
      password: loginData.value.password
    });
    
    // 处理记住我功能
    if (loginData.value.rememberMe) {
      localStorage.setItem('rememberedEmail', loginData.value.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    // 通知父组件登录成功
    emit('login-success');
    
    // 关闭对话框
    closeDialog();
    
    // 重新加载页面以确保所有组件都能正确反映用户已登录的状态
    setTimeout(() => {
      window.location.reload();
    }, 500); // 短暂延迟以确保对话框关闭动画完成
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
    
    errorMessage.value = errorMsg;
  } finally {
    loading.value = false;
  }
};

// 处理取消
const handleCancel = () => {
  emit('login-cancel');
  closeDialog();
};

// 关闭对话框
const closeDialog = () => {
  isVisible.value = false;
  emit('update:visible', false);
};

// 监听visible属性变化
watch(() => props.visible, (newValue) => {
  isVisible.value = newValue;
  
  // 当对话框打开时，尝试从本地存储恢复记住的邮箱
  if (newValue) {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      loginData.value.email = rememberedEmail;
      loginData.value.rememberMe = true;
    }
  }
});
</script>

<style scoped>
.login-dialog-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.05),
    0 2px 8px rgba(0, 0, 0, 0.02);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.login-dialog-header {
  padding: 24px 24px 16px;
  text-align: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-container {
  position: relative;
  padding: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.15));
  border: 2px solid rgba(59, 130, 246, 0.2);
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
}

.login-icon {
  color: #3b82f6;
}

.login-title {
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.login-dialog-form {
  padding: 20px 24px;
}

.login-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  border-width: 1px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.login-input :deep(.v-field--focused) {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.1),
    inset 0 1px 3px rgba(255, 255, 255, 0.9);
}

.remember-checkbox {
  margin: 8px 0;
}

.login-dialog-actions {
  padding: 16px 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
}
</style>