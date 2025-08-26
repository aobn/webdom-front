<template>
  <v-container fluid class="domain-search-container">
    <!-- 背景装饰 -->
    <div class="search-background">
      <div class="search-overlay"></div>
    </div>
    
    <v-row justify="center" align="center" class="min-height-screen">
      <v-col cols="12" sm="10" md="8" lg="6" xl="5">
        <!-- 页面标题 -->
        <div class="text-center mb-8">
          <div class="d-flex align-center justify-center mb-4">
            <v-icon size="64" color="primary" class="me-3">mdi-magnify</v-icon>
            <h1 class="text-h3 font-weight-bold text-primary">搜索子域名</h1>
          </div>
          <p class="text-h6 text-medium-emphasis">
            发现您的完美域名
          </p>
        </div>

        <!-- 域名搜索卡片 -->
        <v-card 
          elevation="8" 
          rounded="xl" 
          class="search-card pa-8"
        >
          <v-form ref="formRef" @submit.prevent="handleSearch">
            <!-- 域名搜索输入框 -->
            <div class="search-input-container mb-6">
              <v-text-field
                v-model="searchQuery"
                placeholder="输入子域名"
                variant="solo"
                density="comfortable"
                class="search-input"
                :loading="searching"
                hide-details
                single-line
                clearable
                @keyup.enter="handleSearch"
                @input="filterInput"
                :rules="[v => /^[a-z0-9]*$/.test(v) || '只能输入小写字母和数字']"
              >
                <template #prepend-inner>
                  <v-icon color="primary">mdi-magnify</v-icon>
                </template>
                <template #append>
                  <!-- 域名后缀选择 -->
                  <v-select
                    v-model="selectedSuffix"
                    :items="domainSuffixes"
                    :loading="loadingSuffixes"
                    variant="plain"
                    density="comfortable"
                    class="suffix-select"
                    hide-details
                    single-line
                  >
                    <template #selection="{ item }">
                      <v-chip
                        color="primary"
                        variant="flat"
                        size="small"
                        class="suffix-chip"
                      >
                        {{ item.title }}
                      </v-chip>
                    </template>
                  </v-select>
                </template>
              </v-text-field>
            </div>
            
            <!-- 搜索按钮 -->
            <div class="text-center">
              <v-btn
                color="primary"
                size="x-large"
                rounded="xl"
                elevation="2"
                :loading="searching"
                @click="handleSearch"
                class="search-btn px-12"
              >
                <v-icon start>mdi-magnify</v-icon>
                搜索
              </v-btn>
            </div>
          </v-form>
        </v-card>
        
        <!-- 搜索结果 -->
        <v-card 
          v-if="searchResults.length > 0" 
          elevation="4" 
          rounded="xl" 
          class="mt-6 pa-6"
        >
          <v-card-title class="text-h6 mb-4">
            <v-icon class="me-2">mdi-dns</v-icon>
            搜索结果
          </v-card-title>
          
          <v-list>
            <v-list-item
              v-for="(result, index) in searchResults"
              :key="index"
              class="mb-2"
            >
              <template #prepend>
                <v-icon 
                  :color="result.available ? 'success' : 'error'"
                  class="me-3"
                >
                  {{ result.available ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </template>
              
              <v-list-item-title class="text-h6">
                {{ result.domain }}
              </v-list-item-title>
              
              <v-list-item-subtitle>
                {{ result.available ? '可注册' : '不可用' }}
              </v-list-item-subtitle>
              
              <template #append>
                <v-btn
                  v-if="result.available"
                  color="primary"
                  variant="outlined"
                  size="small"
                  :loading="registering"
                  @click="registerDomain(result)"
                >
                  注册
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- 使用全局对话框组件 -->
    <!-- 注册成功对话框 -->
    <GlobalDialog
      v-model="successDialog"
      type="success"
      title="注册成功！"
      icon="mdi-check-circle"
      :max-width="500"
      :show-cancel-button="false"
      confirm-button-text="确定"
      @confirm="successDialog = false"
    >
      <template #content>
        <div class="text-center">
          <p class="text-body-1 mb-4">
            恭喜您成功注册域名：
            <strong>{{ selectedDomain?.domain }}</strong>
          </p>
          <p class="text-body-2 text-medium-emphasis">
            相关信息已发送至您的邮箱。
          </p>
        </div>
      </template>
    </GlobalDialog>
    
    <!-- 注册失败对话框 -->
    <GlobalDialog
      v-model="errorDialog"
      type="error"
      title="注册失败"
      icon="mdi-alert-circle"
      :max-width="500"
      :show-cancel-button="false"
      confirm-button-text="确定"
      @confirm="errorDialog = false"
    >
      <template #content>
        <div class="text-center">
          <p class="text-body-1 mb-4">
            域名注册失败：
          </p>
          <p class="text-body-2 text-medium-emphasis">
            {{ errorMessage }}
          </p>
        </div>
      </template>
    </GlobalDialog>
   </v-container>
 </template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import GlobalDialog from '@/components/GlobalDialog.vue'

// 表单引用
const formRef = ref()

// 搜索相关
const searchQuery = ref('')
const selectedSuffix = ref('cblog.eu')
const searching = ref(false)
const searchResults = ref<Array<{domain: string, suffix: string, price: number, available: boolean}>>([])

// 表单数据
const domainForm = ref({
  domain: '',
  suffix: 'cblog.eu',
  years: 1,
  contact: {
    name: '',
    email: '',
    phone: '',
    organization: ''
  },
  agreeTerms: false
})

// 域名状态
const domainStatus = ref<'available' | 'unavailable' | 'checking' | null>(null)
const domainErrorMessage = ref('')
const checkingAvailability = ref(false)
const registering = ref(false)
const successDialog = ref(false)
const formValid = ref(false)

// 注册相关
const selectedDomain = ref<{domain: string} | null>(null)
const errorDialog = ref(false)
const errorMessage = ref('')

// 域名后缀选项
const domainSuffixes = ref<Array<{title: string, value: string, price: number}>>([])
const loadingSuffixes = ref(false)

// 获取可用域名后缀
const loadAvailableSuffixes = async () => {
  loadingSuffixes.value = true
  try {
    const response = await fetch('/api/domains/suffixes')
    const result = await response.json()
    
    if (result.code === 200 && result.data) {
      domainSuffixes.value = result.data.map((suffix: string) => ({
        title: suffix,
        value: suffix
      }))
    } else {
      throw new Error(result.message || '获取域名后缀失败')
    }
  } catch (error) {
    console.error('加载域名后缀失败:', error)
    // 使用默认后缀作为备选
    domainSuffixes.value = [
      { title: 'cblog.eu', value: 'cblog.eu', price: 0 },
      { title: 'vvvv.host', value: 'vvvv.host', price: 0 }
    ]
  } finally {
    loadingSuffixes.value = false
  }
}



// 表单验证规则
const domainRules = [
  (v: string) => !!v || '请输入域名',
  (v: string) => /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/.test(v) || '域名格式不正确'
]

const suffixRules = [
  (v: string) => !!v || '请选择域名后缀'
]

const yearsRules = [
  (v: number) => !!v || '请选择注册年限'
]


// 搜索处理
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  searching.value = true
  searchResults.value = []
  
  try {
    // 获取JWT令牌
    const token = localStorage.getItem('token')
    if (!token) {
      // 显示未登录提示
      searchResults.value = [{
        domain: '请先登录',
        suffix: '',
        price: 0,
        available: false
      }]
      return
    }
    
    // 使用已加载的域名后缀进行查询
    const suffixes = domainSuffixes.value.map(item => item.value)
    const results = []
    
    // 并发查询所有域名后缀的可用性
    const promises = suffixes.map(async (suffix) => {
      try {
        const response = await fetch(`/api/user/subdomain/check-registration`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subdomain: searchQuery.value,
            domain: suffix
          })
        })
        
        const result = await response.json()
        
        return {
          domain: `${searchQuery.value}.${suffix}`,
          suffix,
          available: !result.data.includes('已注册') // 根据返回消息判断是否已注册
        }
      } catch (error) {
        console.error(`查询域名 ${searchQuery.value}.${suffix} 失败:`, error)
        return {
          domain: `${searchQuery.value}.${suffix}`,
          suffix,
          available: false // 查询失败时标记为不可用
        }
      }
    })
    
    // 等待所有查询完成
    const queryResults = await Promise.all(promises)
    searchResults.value = queryResults.map(result => ({
      ...result,
      price: 0 // 添加默认价格，实际价格需要从后端获取
    }))
    
  } catch (error) {
    console.error('搜索域名时发生错误:', error)
  } finally {
    searching.value = false
  }
}

// 注册域名
const registerDomain = async (result: {domain: string}) => {
  registering.value = true
  
  try {
    // 获取JWT令牌
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('未找到JWT令牌，请先登录')
      return
    }
    
    // 解析域名信息
    const domainParts = result.domain.split('.')
    if (!domainParts || domainParts.length < 2) {
      console.error('域名格式错误')
      return
    }
    
    const subDomain = domainParts[0]
    const domain = domainParts.slice(1).join('.')
    
    // 调用注册接口
    const response = await fetch('/api/user/subdomain/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subdomain: subDomain,
        domain: domain
      })
    })
    
    const apiResult = await response.json()
    
    if (apiResult.code === 200) {
      console.log('域名注册成功:', apiResult)
      selectedDomain.value = result
      successDialog.value = true
      // 重新搜索以更新状态
      await handleSearch()
    } else {
      console.error('域名注册失败:', apiResult.message)
      errorMessage.value = apiResult.message || '域名注册失败，请稍后重试'
      errorDialog.value = true
    }
    
  } catch (error: any) {
    console.error('域名注册失败:', error)
    errorMessage.value = error.message || '网络错误，请稍后重试'
    errorDialog.value = true
  } finally {
    registering.value = false
  }
}

// 域名输入处理
const onDomainInput = () => {
  domainStatus.value = null
  domainErrorMessage.value = ''
  
  if (domainForm.value.domain && domainForm.value.domain.length > 2) {
    checkDomainAvailability()
  }
}

// 过滤输入，只允许小写字母和数字
const filterInput = () => {
  // 使用正则表达式过滤非小写字母数字字符，并将大写字母转换为小写
  searchQuery.value = searchQuery.value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// 检查域名可用性
const checkDomainAvailability = async () => {
  checkingAvailability.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 简单的模拟逻辑：包含'test'的域名不可用
    const isAvailable = !domainForm.value.domain.toLowerCase().includes('test')
    
    domainStatus.value = isAvailable ? 'available' : 'unavailable'
    if (!isAvailable) {
      domainErrorMessage.value = '该域名已被注册'
    }
  } catch (error) {
    console.error('检查域名可用性失败:', error)
    domainErrorMessage.value = '检查域名可用性失败，请稍后重试'
  } finally {
    checkingAvailability.value = false
  }
}


// 重置表单
const resetForm = () => {
  searchQuery.value = ''
  searchResults.value = []
  selectedDomain.value = null
  domainStatus.value = null
  domainErrorMessage.value = ''
  formRef.value?.resetValidation()
}
 
 // 组件挂载时加载可用后缀
 onMounted(() => {
   loadAvailableSuffixes()
 })
 </script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}

.text-primary {
  text-decoration: none !important;
}

.text-primary:hover {
  text-decoration: underline !important;
}
</style>