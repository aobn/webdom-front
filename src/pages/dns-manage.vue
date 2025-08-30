<!--
/**
 * @fileoverview DNS记录管理页面
 * @description 三级域名DNS解析记录管理界面
 * @author 开发团队
 * @created 2024-01-20
 * @version 1.0.0
 */
-->

<template>
  <div class="dns-manage-container">
    <!-- 顶部导航栏 -->
    <div class="dns-header d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold">{{ domainName }}</h1>
      <div class="d-flex gap-3">
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-arrow-left"
          @click="goBack"
        >
          返回列表
        </v-btn>
        <v-btn
          variant="outlined"
          prepend-icon="mdi-refresh"
          @click="loadDnsRecords"
          :loading="loading"
        >
          刷新
        </v-btn>
      </div>
    </div>

    <!-- DNS记录卡片 -->
    <v-card class="dns-records-card rounded-lg" elevation="1">
      <v-card-title class="pa-4 d-flex align-center justify-space-between">
        <span class="text-h6 font-weight-bold">DNS记录</span>
        <div class="d-flex gap-3 align-center">
          <!-- 过滤器 -->
          <v-select
            v-model="filterType"
            :items="filterTypeOptions"
            label="记录类型"
            variant="outlined"
            density="compact"
            style="min-width: 120px"
            @update:model-value="applyFilters"
          ></v-select>
          <v-select
            v-model="filterStatus"
            :items="filterStatusOptions"
            label="状态"
            variant="outlined"
            density="compact"
            style="min-width: 100px"
            @update:model-value="applyFilters"
          ></v-select>
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-plus"
            @click="showAddDialog = true"
          >
            添加记录
          </v-btn>
        </div>
      </v-card-title>

      <!-- 加载状态 -->
      <div v-if="loading && dnsRecords.length === 0" class="text-center pa-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <div class="mt-4 text-body-1">正在加载DNS记录...</div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading && filteredDnsRecords.length === 0" class="text-center pa-8">
        <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-dns</v-icon>
        <div class="text-h6 mb-2 text-medium-emphasis">
          {{ dnsRecords.length === 0 ? '暂无DNS记录' : '没有符合条件的记录' }}
        </div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          {{ dnsRecords.length === 0 ? '点击"添加记录"按钮创建' : '请调整过滤条件' }}
        </div>
      </div>

      <!-- DNS记录表格 -->
      <v-card-text v-else class="pa-0">
        <div class="dns-table">
          <!-- 表格头部 -->
          <div class="dns-table-header d-flex px-4 py-3">
            <div class="dns-column" style="flex: 1">类型</div>
            <div class="dns-column" style="flex: 2">名称</div>
            <div class="dns-column" style="flex: 2.5">内容</div>
            <div class="dns-column" style="flex: 1">TTL</div>
            <div class="dns-column" style="flex: 1.2">状态</div>
            <div class="dns-column text-center" style="flex: 1.5">操作</div>
          </div>

          <v-divider></v-divider>

          <!-- DNS记录项 -->
          <div
            v-for="(record, index) in filteredDnsRecords"
            :key="record.id"
            class="dns-item d-flex align-center px-4 py-3"
            :class="{ 'dns-item-hover': true }"
          >
            <div class="dns-column" style="flex: 1">
              <v-chip
                :color="getRecordTypeColor(record.type)"
                variant="tonal"
                size="small"
              >
                {{ record.type }}
              </v-chip>
            </div>
            <div class="dns-column" style="flex: 2">
              <span class="font-weight-medium">{{ record.name }}</span>
            </div>
            <div class="dns-column" style="flex: 2.5">
              <span class="text-truncate" :title="record.content">
                {{ record.content }}
              </span>
              <!-- 显示MX优先级 -->
              <div v-if="record.type === 'MX' && record.mx" class="text-caption text-medium-emphasis">
                优先级: {{ record.mx }}
              </div>
              <!-- 显示权重 -->
              <div v-if="record.weight && record.weight > 0" class="text-caption text-medium-emphasis">
                权重: {{ record.weight }}
              </div>
            </div>
            <div class="dns-column" style="flex: 1">
              <span class="text-medium-emphasis">{{ record.ttl }}</span>
            </div>
            <div class="dns-column" style="flex: 1.2">
              <v-chip
                :color="getStatusColor(record.status)"
                variant="tonal"
                size="small"
              >
                {{ getStatusText(record.status) }}
              </v-chip>
              <div v-if="record.syncStatus" class="mt-1">
                <v-chip
                  :color="getSyncStatusColor(record.syncStatus)"
                  variant="outlined"
                  size="x-small"
                >
                  {{ getSyncStatusText(record.syncStatus) }}
                </v-chip>
              </div>
            </div>
            <div class="dns-column text-center" style="flex: 1.5">
              <div class="d-flex justify-center gap-2">
                <v-btn
                  density="comfortable"
                  variant="tonal"
                  color="primary"
                  size="small"
                  @click="editRecord(record)"
                >
                  编辑
                </v-btn>
                <v-btn
                  density="comfortable"
                  variant="flat"
                  color="error"
                  size="small"
                  :loading="deletingIds.includes(record.id)"
                  @click="confirmDeleteRecord(record)"
                >
                  删除
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 添加/编辑DNS记录对话框 -->
    <v-dialog v-model="showAddDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          {{ editingRecord ? '编辑DNS记录' : '添加DNS记录' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="dnsForm" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="recordForm.type"
                  :items="recordTypes"
                  label="记录类型"
                  variant="outlined"
                  :rules="[v => !!v || '请选择记录类型']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="recordForm.name"
                  label="名称"
                  variant="outlined"
                  :rules="[v => !!v || '请输入名称']"
                  placeholder="例如: www, mail, @"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="recordForm.content"
                  label="内容"
                  variant="outlined"
                  :rules="[v => !!v || '请输入内容']"
                  :placeholder="getContentPlaceholder(recordForm.type)"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="recordForm.ttl"
                  :items="ttlOptions"
                  label="TTL"
                  variant="outlined"
                  :rules="[v => !!v || '请选择TTL']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6" v-if="recordForm.type === 'MX'">
                <v-text-field
                  v-model="recordForm.mx"
                  label="MX优先级"
                  variant="outlined"
                  type="number"
                  :rules="[v => recordForm.type !== 'MX' || (v && v >= 1 && v <= 20) || 'MX优先级必须在1-20之间']"
                  placeholder="1-20"
                ></v-text-field>
              </v-col>
              
              <!-- 权重字段 - 用于负载均衡 -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="recordForm.weight"
                  label="权重 (可选)"
                  variant="outlined"
                  type="number"
                  :rules="[v => !v || (v >= 0 && v <= 100) || '权重必须在0-100之间']"
                  placeholder="0-100"
                  hint="用于负载均衡，0表示不使用权重"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-row v-if="recordForm.type !== 'MX'">
              <v-col cols="12">
                <v-text-field
                  v-model="recordForm.remark"
                  label="备注"
                  variant="outlined"
                  placeholder="可选的备注信息"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeAddDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="saving"
            :disabled="!formValid"
            @click="saveRecord"
          >
            {{ editingRecord ? '更新' : '添加' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 消息提示 -->
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

    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      {{ successMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGlobalDialog } from '@/composables/useGlobalDialog'
import { dnsService, type DnsRecord as ApiDnsRecord } from '@/services/dnsService'

// 路由
const router = useRouter()
const route = useRoute()

// 全局对话框
const { showConfirm } = useGlobalDialog()

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const dnsRecords = ref<DnsRecord[]>([])
const filteredDnsRecords = ref<DnsRecord[]>([])
const deletingIds = ref<number[]>([])
const showError = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const successMessage = ref('')
const showAddDialog = ref(false)
const formValid = ref(false)
const editingRecord = ref<DnsRecord | null>(null)

// 过滤器
const filterType = ref('')
const filterStatus = ref('')

// 表单数据
const recordForm = ref({
  type: 'A',
  name: '',
  content: '',
  ttl: 3600,
  mx: null as number | null,
  weight: null as number | null,  // 添加权重字段
  remark: ''
})

// 域名信息
const domainName = computed(() => {
  // 从路由参数或查询参数中获取域名
  return (route.params as any).domain || (route.query as any).domain || 'baixi.zabc.net'
})

// 子域名ID
const subdomainId = computed(() => {
  return (route.params as any).subdomainId || (route.query as any).subdomainId
})

// DNS记录接口
interface DnsRecord {
  id: number
  userId: number
  subdomainId: number
  recordId: number
  type: string
  name: string
  content: string
  ttl: number
  mx?: number
  weight?: number  // 添加权重字段
  status: string
  remark?: string
  monitorStatus?: string
  syncStatus?: string
  syncError?: string
  createTime: string
  updateTime: string
}

// 记录类型选项
const recordTypes = [
  { title: 'A', value: 'A' },
  { title: 'AAAA', value: 'AAAA' },
  { title: 'CNAME', value: 'CNAME' },
  { title: 'MX', value: 'MX' },
  { title: 'TXT', value: 'TXT' },
  { title: 'NS', value: 'NS' },
  { title: 'SRV', value: 'SRV' }
]

// TTL选项
const ttlOptions = [
  { title: '自动', value: 1 },
  { title: '1分钟', value: 60 },
  { title: '5分钟', value: 300 },
  { title: '15分钟', value: 900 },
  { title: '30分钟', value: 1800 },
  { title: '1小时', value: 3600 },
  { title: '2小时', value: 7200 },
  { title: '5小时', value: 18000 },
  { title: '12小时', value: 43200 },
  { title: '1天', value: 86400 }
]

// 过滤器选项
const filterTypeOptions = [
  { title: '全部类型', value: '' },
  { title: 'A', value: 'A' },
  { title: 'AAAA', value: 'AAAA' },
  { title: 'CNAME', value: 'CNAME' },
  { title: 'MX', value: 'MX' },
  { title: 'TXT', value: 'TXT' },
  { title: 'NS', value: 'NS' },
  { title: 'SRV', value: 'SRV' }
]

const filterStatusOptions = [
  { title: '全部状态', value: '' },
  { title: '启用', value: 'ENABLE' },
  { title: '禁用', value: 'DISABLE' }
]

/**
 * 加载DNS记录列表
 */
const loadDnsRecords = async () => {
  loading.value = true
  try {
    console.log('开始加载DNS记录列表...')
    
    // 从路由参数获取subdomainId
    const currentSubdomainId = subdomainId.value
    
    if (!currentSubdomainId) {
      showErrorMessage('缺少子域名ID参数')
      return
    }
    
    // 调用DNS服务查询接口
    const response = await dnsService.getDnsRecordsBySubdomain(parseInt(currentSubdomainId as string))
    
    console.log('DNS查询响应完整结构:', JSON.stringify(response, null, 2))
    console.log('响应类型:', typeof response)
    console.log('响应code:', response?.code)
    console.log('响应data:', response?.data)
    
    // 检查响应结构 - 兼容多种可能的响应格式
    const responseData = response?.data?.data || response?.data || response
    const responseCode = response?.data?.code || response?.code || (response ? 200 : 500)
    
    if (responseCode === 200 && responseData && Array.isArray(responseData)) {
      dnsRecords.value = responseData.map((record: any) => ({
        id: record.id,
        userId: record.userId,
        subdomainId: record.subdomainId,
        recordId: record.recordId,
        type: record.type || 'A',
        name: record.name || '@',
        content: record.value || record.ipAddress,
        ttl: record.ttl || 600,
        mx: record.mx,
        weight: record.weight,  // 添加权重字段映射
        status: record.status,
        remark: record.remark,
        monitorStatus: record.monitorStatus,
        syncStatus: record.syncStatus,
        syncError: record.syncError,
        createTime: record.createTime,
        updateTime: record.updateTime
      }))
      
      // 应用过滤器
      applyFilters()
    } else {
      dnsRecords.value = []
      filteredDnsRecords.value = []
      console.log('查询失败，响应码:', responseCode, '数据:', responseData)
      if (responseCode !== 200) {
        const errorMsg = response?.data?.message || response?.message || '查询失败'
        showErrorMessage(errorMsg)
      } else if (!responseData || !Array.isArray(responseData)) {
        showErrorMessage('返回的数据格式不正确')
      }
    }
    
    console.log('DNS记录列表加载成功:', dnsRecords.value)
  } catch (error: any) {
    console.error('加载DNS记录列表失败:', error)
    if (error.response?.status === 403) {
      showErrorMessage('无权限访问该子域名的解析记录')
    } else if (error.response?.status === 401) {
      showErrorMessage('未授权访问，请重新登录')
    } else {
      showErrorMessage(error.message || '加载失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

/**
 * 获取记录类型颜色
 */
const getRecordTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'A': 'primary',
    'AAAA': 'secondary',
    'CNAME': 'success',
    'MX': 'warning',
    'TXT': 'info',
    'NS': 'purple',
    'SRV': 'orange'
  }
  return colors[type] || 'grey'
}

/**
 * 获取内容占位符
 */
const getContentPlaceholder = (type: string) => {
  const placeholders: Record<string, string> = {
    'A': '192.168.1.1',
    'AAAA': '2001:db8::1',
    'CNAME': 'example.com',
    'MX': 'mail.example.com',
    'TXT': 'v=spf1 include:_spf.example.com ~all',
    'NS': 'ns1.example.com',
    'SRV': '10 5 443 target.example.com'
  }
  return placeholders[type] || '请输入记录内容'
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'ENABLE': 'success',
    'DISABLE': 'error',
    'PENDING': 'warning'
  }
  return colors[status] || 'grey'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'ENABLE': '启用',
    'DISABLE': '禁用',
    'PENDING': '待处理'
  }
  return texts[status] || status
}

/**
 * 获取同步状态颜色
 */
const getSyncStatusColor = (syncStatus: string) => {
  const colors: Record<string, string> = {
    'SUCCESS': 'success',
    'PENDING': 'warning',
    'FAILED': 'error'
  }
  return colors[syncStatus] || 'grey'
}

/**
 * 获取同步状态文本
 */
const getSyncStatusText = (syncStatus: string) => {
  const texts: Record<string, string> = {
    'SUCCESS': '同步成功',
    'PENDING': '同步中',
    'FAILED': '同步失败'
  }
  return texts[syncStatus] || syncStatus
}

/**
 * 应用过滤器
 */
const applyFilters = () => {
  let filtered = [...dnsRecords.value]
  
  // 按类型过滤
  if (filterType.value) {
    filtered = filtered.filter(record => record.type === filterType.value)
  }
  
  // 按状态过滤
  if (filterStatus.value) {
    filtered = filtered.filter(record => record.status === filterStatus.value)
  }
  
  filteredDnsRecords.value = filtered
}

/**
 * 编辑记录
 */
const editRecord = (record: DnsRecord) => {
  editingRecord.value = record
  recordForm.value = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: record.ttl,
    mx: record.mx || null,
    weight: record.weight || null,  // 添加权重字段
    remark: record.remark || ''
  }
  showAddDialog.value = true
}

/**
 * 保存记录
 */
const saveRecord = async () => {
  saving.value = true
  try {
    if (editingRecord.value) {
      // 更新记录
      console.log('更新DNS记录:', recordForm.value)
      const updateParams = {
        type: recordForm.value.type,
        value: recordForm.value.content,  // 使用value字段，符合接口文档
        ttl: recordForm.value.ttl,
        mx: recordForm.value.type === 'MX' ? recordForm.value.mx : null,
        weight: recordForm.value.weight || null,
        status: 'ENABLE',  // 默认启用状态
        remark: recordForm.value.remark || '通过界面更新'
      }
      
      await dnsService.updateDnsRecord(editingRecord.value.id, updateParams)
      showSuccessMessage('DNS记录更新成功')
    } else {
      // 添加记录
      console.log('添加DNS记录:', recordForm.value)
      
      const currentSubdomainId = subdomainId.value
      if (!currentSubdomainId) {
        showErrorMessage('缺少子域名ID参数')
        return
      }
      
      const createParams = {
        subdomainId: parseInt(currentSubdomainId as string),
        name: recordForm.value.name,
        type: recordForm.value.type,
        value: recordForm.value.content,
        ttl: recordForm.value.ttl,
        line: '默认',
        mx: recordForm.value.type === 'MX' ? recordForm.value.mx : null,
        remark: recordForm.value.remark || '通过界面添加'
      }
      
      console.log('创建DNS记录参数:', createParams)
      const response = await dnsService.createDnsRecord(createParams)
      
      if (response && response.code === 200) {
        showSuccessMessage('DNS记录添加成功')
      } else {
        showErrorMessage(response?.message || 'DNS记录添加失败')
      }
    }
    
    closeAddDialog()
    loadDnsRecords()
  } catch (error: any) {
    console.error('保存DNS记录失败:', error)
    
    // 处理具体的错误情况
    if (error.response?.status === 400) {
      showErrorMessage('请求参数错误，请检查输入内容')
    } else if (error.response?.status === 403) {
      showErrorMessage('无权限操作该子域名的DNS记录')
    } else if (error.response?.status === 409) {
      showErrorMessage('DNS记录已存在，请检查记录名称和类型')
    } else if (error.message?.includes('子域名不存在')) {
      showErrorMessage('子域名不存在或已被删除')
    } else if (error.message?.includes('DNS记录已存在')) {
      showErrorMessage('相同的DNS记录已存在')
    } else {
      showErrorMessage(error.message || '保存失败，请稍后重试')
    }
  } finally {
    saving.value = false
  }
}

/**
 * 确认删除记录
 */
const confirmDeleteRecord = async (record: DnsRecord) => {
  const confirmed = await showConfirm(
    '确认删除DNS记录',
    `您确定要删除 ${record.type} 记录 "${record.name}" 吗？此操作不可撤销。`,
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    }
  )
  
  if (confirmed) {
    await deleteRecord(record)
  }
}

/**
 * 删除记录
 */
const deleteRecord = async (record: DnsRecord) => {
  deletingIds.value.push(record.id)
  
  try {
    console.log('删除DNS记录:', record)
    await dnsService.deleteDnsRecord(record.id)
    
    showSuccessMessage('DNS记录删除成功')
    dnsRecords.value = dnsRecords.value.filter(r => r.id !== record.id)
    applyFilters()
  } catch (error: any) {
    console.error('删除DNS记录失败:', error)
    showErrorMessage(error.message || '删除失败，请稍后重试')
  } finally {
    deletingIds.value = deletingIds.value.filter(id => id !== record.id)
  }
}

/**
 * 关闭添加对话框
 */
const closeAddDialog = () => {
  showAddDialog.value = false
  editingRecord.value = null
  recordForm.value = {
    type: 'A',
    name: '',
    content: '',
    ttl: 3600,
    mx: null,
    weight: null,  // 重置权重字段
    remark: ''
  }
}

/**
 * 返回域名列表
 */
const goBack = () => {
  // 返回到域名管理页面
  router.push({ path: '/', query: { page: 'domain-manage' } })
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
 * 组件挂载时加载数据
 */
onMounted(() => {
  loadDnsRecords()
})
</script>

<style scoped>
.dns-manage-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.dns-header {
  margin-bottom: 24px;
}

.dns-records-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.dns-table-header {
  background: rgba(var(--v-theme-surface), 0.5);
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.dns-column {
  display: flex;
  align-items: center;
  padding: 8px 4px;
  font-size: 14px;
}

.dns-item {
  transition: background-color 0.2s ease;
  min-height: 60px;
}

.dns-item-hover:hover {
  background: rgba(var(--v-theme-primary), 0.04);
}

.dns-item:not(:last-child) {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dns-manage-container {
    padding: 16px;
  }
  
  .dns-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .dns-column {
    font-size: 12px;
    padding: 4px 2px;
  }
  
  .dns-table-header .dns-column:nth-child(4),
  .dns-item .dns-column:nth-child(4),
  .dns-table-header .dns-column:nth-child(5),
  .dns-item .dns-column:nth-child(5) {
    display: none;
  }
}

@media (max-width: 480px) {
  .dns-table-header .dns-column:nth-child(3),
  .dns-item .dns-column:nth-child(3) {
    flex: 1.5;
  }
  
  .dns-column {
    font-size: 11px;
  }
}
</style>