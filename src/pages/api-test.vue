<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <h2>API接口测试页面</h2>
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <h3>测试结果</h3>
                <v-alert
                  v-if="testResult"
                  :type="testResult.success ? 'success' : 'error'"
                  class="mb-4"
                >
                  {{ testResult.message }}
                </v-alert>
                
                <v-textarea
                  v-if="testResult && testResult.data"
                  label="响应数据"
                  :value="JSON.stringify(testResult.data, null, 2)"
                  readonly
                  rows="10"
                  class="mb-4"
                ></v-textarea>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-btn
                  @click="testValidateToken"
                  :loading="loading"
                  color="primary"
                  block
                  class="mb-2"
                >
                  测试 validate-token 接口
                </v-btn>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-btn
                  @click="testLogin"
                  :loading="loading"
                  color="secondary"
                  block
                  class="mb-2"
                >
                  测试 login 接口
                </v-btn>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="customUrl"
                  label="自定义API URL"
                  placeholder="/api/auth/validate-token"
                  class="mb-2"
                ></v-text-field>
                
                <v-btn
                  @click="testCustomUrl"
                  :loading="loading"
                  color="info"
                  block
                >
                  测试自定义URL
                </v-btn>
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
import http from '@/utils/http'

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

const loading = ref(false)
const testResult = ref<TestResult | null>(null)
const customUrl = ref('/api/auth/validate-token')

/**
 * 测试 validate-token 接口
 */
const testValidateToken = async () => {
  loading.value = true
  testResult.value = null
  
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      testResult.value = {
        success: false,
        message: '未找到token，请先登录',
        error: 'No token found'
      }
      return
    }
    
    const response = await http.get('/api/auth/validate-token', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    testResult.value = {
      success: true,
      message: 'validate-token 接口调用成功',
      data: response.data
    }
  } catch (error: any) {
    console.error('validate-token 接口测试失败:', error)
    testResult.value = {
      success: false,
      message: `validate-token 接口调用失败: ${error.message}`,
      error: error.toString(),
      data: error.response?.data
    }
  } finally {
    loading.value = false
  }
}

/**
 * 测试 login 接口
 */
const testLogin = async () => {
  loading.value = true
  testResult.value = null
  
  try {
    const response = await http.post('/api/auth/login', {
      username: 'test',
      password: 'test123'
    })
    
    testResult.value = {
      success: true,
      message: 'login 接口调用成功',
      data: response.data
    }
  } catch (error: any) {
    console.error('login 接口测试失败:', error)
    testResult.value = {
      success: false,
      message: `login 接口调用失败: ${error.message}`,
      error: error.toString(),
      data: error.response?.data
    }
  } finally {
    loading.value = false
  }
}

/**
 * 测试自定义URL
 */
const testCustomUrl = async () => {
  if (!customUrl.value) {
    testResult.value = {
      success: false,
      message: '请输入要测试的URL'
    }
    return
  }
  
  loading.value = true
  testResult.value = null
  
  try {
    const response = await http.get(customUrl.value)
    
    testResult.value = {
      success: true,
      message: `${customUrl.value} 接口调用成功`,
      data: response.data
    }
  } catch (error: any) {
    console.error('自定义URL测试失败:', error)
    testResult.value = {
      success: false,
      message: `${customUrl.value} 接口调用失败: ${error.message}`,
      error: error.toString(),
      data: error.response?.data
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card {
  margin: 20px 0;
}

.v-btn {
  text-transform: none;
}
</style>