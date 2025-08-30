<!--
/**
 * @fileoverview 域名DNS解析管理页面
 * @description 管理用户的三级域名DNS解析记录
 * @author 开发团队
 * @created 2024-01-20
 * @version 1.0.0
 */
-->

<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <!-- 页面标题 -->
        <v-card class="jelly-card mb-6" rounded="xl" elevation="4">
          <v-card-title class="text-h4 pa-6 text-center">
            <v-icon size="48" color="primary" class="me-3">mdi-dns</v-icon>
            域名DNS解析管理
          </v-card-title>
          <v-card-subtitle class="text-center pb-6">
            管理您的三级域名DNS解析记录
          </v-card-subtitle>
        </v-card>

        <!-- 域名选择区域 -->
        <v-card class="jelly-card mb-6" rounded="lg" elevation="2">
          <v-card-title class="text-h6 bg-primary text-white">
            <v-icon class="me-2">mdi-web</v-icon>
            域名查询
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row align="center">
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="selectedDomain"
                  label="请输入域名"
                  prepend-inner-icon="mdi-web"
                  variant="outlined"
                  density="comfortable"
                  @keyup.enter="loadDnsRecords"
                  :loading="domainStore.loading"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  color="primary"
                  size="large"
                  block
                  @click="loadDnsRecords"
                  :loading="domainStore.loading"
                >
                  <v-icon start>mdi-magnify</v-icon>
                  查询DNS记录
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- DNS记录列表 -->
        <v-card v-if="domainStore.currentDomain" class="jelly-card" rounded="lg" elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <v-icon class="me-2">mdi-dns</v-icon>
              DNS解析记录 - {{ domainStore.currentDomain }}
            </div>
            <v-btn
              color="success"
              @click="showAddDialog"
            >
              <v-icon start>mdi-plus</v-icon>
              添加记录
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="tableHeaders"
              :items="domainStore.dnsRecords"
              :loading="domainStore.loading"
              class="elevation-1"
              item-key="id"
            >
              <template #item.subdomain="{ item }">
                <code class="subdomain-text">{{ item.subdomain || '@' }}</code>
              </template>

              <template #item.recordType="{ item }">
                <v-chip
                  :color="getRecordTypeColor(item.recordType)"
                  size="small"
                  variant="flat"
                >
                  {{ item.recordType }}
                </v-chip>
              </template>

              <template #item.recordValue="{ item }">
                <code class="record-value">{{ item.recordValue }}</code>
              </template>

              <template #item.ttl="{ item }">
                <span>{{ item.ttl }}s</span>
              </template>

              <template #item.status="{ item }">
                <v-chip
                  :color="item.status === 'active' ? 'success' : 'warning'"
                  size="small"
                  variant="flat"
                >
                  {{ item.status === 'active' ? '正常' : '暂停' }}
                </v-chip>
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  color="primary"
                  size="small"
                  variant="text"
                  @click="editRecord(item)"
                  class="me-2"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  color="error"
                  size="small"
                  variant="text"
                  @click="deleteRecord(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>

              <template #no-data>
                <div class="text-center pa-4">
                  <v-icon size="64" color="grey-lighten-1" class="mb-2">mdi-dns-outline</v-icon>
                  <div class="text-h6 text-medium-emphasis">暂无DNS记录</div>
                  <div class="text-body-2 text-medium-emphasis">点击"添加记录"按钮创建第一条DNS记录</div>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>

        <!-- 添加/编辑DNS记录对话框 -->
        <v-dialog
          v-model="dialogVisible"
          max-width="600"
          persistent
        >
          <v-card>
            <v-card-title class="text-h5">
              <v-icon class="me-2">{{ isEdit ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
              {{ isEdit ? '编辑DNS记录' : '添加DNS记录' }}
            </v-card-title>

            <v-card-text>
              <v-form ref="formRef" v-model="formValid">
                <v-text-field
                  v-model="recordForm.subdomain"
                  label="子域名"
                  hint="留空表示根域名(@)"
                  persistent-hint
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                />
                
                <div class="form-tip mb-4">
                  <v-icon size="16" class="me-1">mdi-information</v-icon>
                  完整域名将是: <strong>{{ getFullDomain() }}</strong>
                </div>

                <v-select
                  v-model="recordForm.recordType"
                  :items="recordTypes"
                  label="记录类型"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || '请选择记录类型']"
                  class="mb-4"
                />

                <v-textarea
                  v-model="recordForm.recordValue"
                  :label="getRecordValueLabel()"
                  :placeholder="getRecordValuePlaceholder()"
                  variant="outlined"
                  density="comfortable"
                  rows="2"
                  :rules="[v => !!v || '请输入记录值']"
                  class="mb-4"
                />

                <v-select
                  v-model="recordForm.ttl"
                  :items="ttlOptions"
                  label="TTL (生存时间)"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || '请选择TTL值']"
                />
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn
                @click="dialogVisible = false"
                :disabled="submitting"
              >
                取消
              </v-btn>
              <v-btn
                color="primary"
                @click="submitForm"
                :loading="submitting"
                :disabled="!formValid"
              >
                {{ isEdit ? '更新' : '添加' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { globalDialog } from '@/composables/useGlobalDialog'
import { useDomainStore, type DnsRecord, type UpdateDnsRecordParams } from '@/stores/domain'

const domainStore = useDomainStore()

// 响应式数据
const selectedDomain = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formValid = ref(false)
const formRef = ref()

// 表单数据
const recordForm = reactive({
  id: '',
  subdomain: '',
  recordType: 'A' as 'A' | 'CNAME' | 'MX' | 'TXT' | 'AAAA',
  recordValue: '',
  ttl: 3600
})

// 表格头部定义
const tableHeaders = [
  { title: '子域名', key: 'subdomain', width: '150px' },
  { title: '记录类型', key: 'recordType', width: '120px' },
  { title: '记录值', key: 'recordValue', minWidth: '200px' },
  { title: 'TTL', key: 'ttl', width: '100px' },
  { title: '状态', key: 'status', width: '100px' },
  { title: '操作', key: 'actions', width: '120px', sortable: false }
]

// 记录类型选项
const recordTypes = [
  { title: 'A记录', value: 'A' },
  { title: 'CNAME记录', value: 'CNAME' },
  { title: 'MX记录', value: 'MX' },
  { title: 'TXT记录', value: 'TXT' },
  { title: 'AAAA记录', value: 'AAAA' }
]

// TTL选项
const ttlOptions = [
  { title: '1分钟 (60秒)', value: 60 },
  { title: '5分钟 (300秒)', value: 300 },
  { title: '10分钟 (600秒)', value: 600 },
  { title: '1小时 (3600秒)', value: 3600 },
  { title: '1天 (86400秒)', value: 86400 }
]

// 计算属性
const getFullDomain = computed(() => {
  return () => {
    const subdomain = recordForm.subdomain || '@'
    return subdomain === '@' 
      ? domainStore.currentDomain 
      : `${subdomain}.${domainStore.currentDomain}`
  }
})

// 方法
const loadDnsRecords = async () => {
  if (!selectedDomain.value.trim()) {
    globalDialog.showWarning('输入提示', '请输入域名')
    return
  }

  try {
    await domainStore.fetchDnsRecords(selectedDomain.value.trim())
    globalDialog.showSuccess('加载成功', 'DNS记录加载成功')
  } catch (error) {
    globalDialog.showError('加载失败', '加载DNS记录失败')
  }
}

const showAddDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const editRecord = (record: DnsRecord) => {
  isEdit.value = true
  dialogVisible.value = true
  
  // 填充表单数据
  Object.assign(recordForm, {
    id: record.id,
    subdomain: record.subdomain,
    recordType: record.recordType,
    recordValue: record.recordValue,
    ttl: record.ttl
  })
}

const deleteRecord = async (record: DnsRecord) => {
  const confirmed = await globalDialog.showConfirm(
    '确认删除',
    `确定要删除这条DNS记录吗？\n子域名: ${record.subdomain || '@'}\n类型: ${record.recordType}\n值: ${record.recordValue}`
  )

  if (!confirmed) return

  try {
    await domainStore.deleteDnsRecord(record.id)
    globalDialog.showSuccess('删除成功', 'DNS记录删除成功')
  } catch (error) {
    globalDialog.showError('删除失败', '删除DNS记录失败')
  }
}

const submitForm = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    submitting.value = true

    const params: UpdateDnsRecordParams = {
      domain: domainStore.currentDomain,
      subdomain: recordForm.subdomain || '@',
      recordType: recordForm.recordType,
      recordValue: recordForm.recordValue,
      ttl: recordForm.ttl
    }

    if (isEdit.value) {
      params.id = recordForm.id
    }

    await domainStore.updateDnsRecord(params)
    
    globalDialog.showSuccess(
      isEdit.value ? '更新成功' : '添加成功',
      isEdit.value ? 'DNS记录更新成功' : 'DNS记录添加成功'
    )
    dialogVisible.value = false
  } catch (error) {
    globalDialog.showError(
      isEdit.value ? '更新失败' : '添加失败',
      isEdit.value ? '更新DNS记录失败' : '添加DNS记录失败'
    )
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetValidation()
  }
  Object.assign(recordForm, {
    id: '',
    subdomain: '',
    recordType: 'A',
    recordValue: '',
    ttl: 3600
  })
}

const getRecordTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'A': 'primary',
    'CNAME': 'success',
    'MX': 'warning',
    'TXT': 'info',
    'AAAA': 'error'
  }
  return colors[type] || 'default'
}

const getRecordValueLabel = () => {
  const labels: Record<string, string> = {
    'A': 'IPv4地址',
    'CNAME': '目标域名',
    'MX': '邮件服务器',
    'TXT': '文本记录',
    'AAAA': 'IPv6地址'
  }
  return labels[recordForm.recordType] || '记录值'
}

const getRecordValuePlaceholder = () => {
  const placeholders: Record<string, string> = {
    'A': '请输入IPv4地址，如: 192.168.1.1',
    'CNAME': '请输入域名，如: example.com',
    'MX': '请输入邮件服务器，如: 10 mail.example.com',
    'TXT': '请输入文本记录',
    'AAAA': '请输入IPv6地址'
  }
  return placeholders[recordForm.recordType] || '请输入记录值'
}
</script>

<style scoped>
/**
 * 域名管理页面样式
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

/* 代码样式 */
.subdomain-text,
.record-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
}

/* 表单提示 */
.form-tip {
  font-size: 14px;
  color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.1);
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 4px solid rgb(var(--v-theme-primary));
}

/* 响应式设计 */
@media (max-width: 960px) {
  .v-container {
    padding: 16px;
  }
}
</style>