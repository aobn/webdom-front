<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-test-tube</v-icon>
            域名接口测试
          </v-card-title>
          
          <v-card-text>
            <v-alert
              v-if="testResult"
              :type="testResult.success ? 'success' : 'error'"
              class="mb-4"
            >
              {{ testResult.message }}
            </v-alert>
            
            <v-btn
              @click="testDomainAPI"
              :loading="testing"
              color="primary"
              class="mb-4"
            >
              测试域名接口
            </v-btn>
            
            <v-divider class="my-4" />
            
            <div v-if="domainData">
              <h3>接口响应数据：</h3>
              <v-code class="mt-2">
                <pre>{{ JSON.stringify(domainData, null, 2) }}</pre>
              </v-code>
            </div>
            
            <div v-if="suffixes.length > 0" class="mt-4">
              <h3>提取的域名后缀：</h3>
              <v-chip-group>
                <v-chip
                  v-for="suffix in suffixes"
                  :key="suffix"
                  color="primary"
                  variant="outlined"
                >
                  {{ suffix }}
                </v-chip>
              </v-chip-group>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { domainService } from '@/services'

const testing = ref(false)
const testResult = ref<{success: boolean, message: string} | null>(null)
const domainData = ref<any>(null)
const suffixes = ref<string[]>([])

const testDomainAPI = async () => {
  testing.value = true
  testResult.value = null
  domainData.value = null
  suffixes.value = []
  
  try {
    // 测试获取域名列表
    const response = await domainService.getDomainList()
    domainData.value = response
    
    if (response.code === 200 && response.data) {
      testResult.value = {
        success: true,
        message: `✅ 接口对接成功！获取到 ${response.data.domainList?.length || 0} 个域名`
      }
      
      // 测试获取域名后缀
      try {
        const availableSuffixes = await domainService.getAvailableSuffixes()
        suffixes.value = availableSuffixes
      } catch (error) {
        console.error('获取后缀失败:', error)
      }
    } else {
      testResult.value = {
        success: false,
        message: '❌ 接口响应格式不正确'
      }
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: `❌ 接口测试失败: ${error.message}`
    }
    
    if (error.message.includes('fetch')) {
      testResult.value.message += '\n提示: 请确保后端服务器正在运行在 http://localhost:8080'
    }
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.v-code {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}
</style>
