<template>
  <div class="domain-management">
    <div class="page-header">
      <h1>域名DNS解析管理</h1>
      <p class="page-description">管理您的三级域名DNS解析记录</p>
    </div>

    <!-- 域名选择区域 -->
    <el-card class="domain-selector-card" shadow="never">
      <div class="domain-selector">
        <el-input
          v-model="selectedDomain"
          placeholder="请输入域名"
          class="domain-input"
          @keyup.enter="loadDnsRecords"
        >
          <template #prepend>域名</template>
          <template #append>
            <el-button 
              type="primary" 
              @click="loadDnsRecords"
              :loading="domainStore.loading"
            >
              查询
            </el-button>
          </template>
        </el-input>
      </div>
    </el-card>

    <!-- DNS记录列表 -->
    <el-card v-if="domainStore.currentDomain" class="dns-records-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>DNS解析记录 - {{ domainStore.currentDomain }}</span>
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            添加记录
          </el-button>
        </div>
      </template>

      <el-table
        :data="domainStore.dnsRecords"
        v-loading="domainStore.loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="subdomain" label="子域名" width="150">
          <template #default="{ row }">
            <span class="subdomain-text">{{ row.subdomain || '@' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="recordType" label="记录类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getRecordTypeColor(row.recordType)">
              {{ row.recordType }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="recordValue" label="记录值" min-width="200">
          <template #default="{ row }">
            <span class="record-value">{{ row.recordValue }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="ttl" label="TTL" width="100">
          <template #default="{ row }">
            <span>{{ row.ttl }}s</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'warning'">
              {{ row.status === 'active' ? '正常' : '暂停' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="editRecord(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteRecord(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑DNS记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑DNS记录' : '添加DNS记录'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="recordForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="子域名" prop="subdomain">
          <el-input
            v-model="recordForm.subdomain"
            placeholder="留空表示根域名(@)"
          />
          <div class="form-tip">
            完整域名将是: {{ getFullDomain() }}
          </div>
        </el-form-item>

        <el-form-item label="记录类型" prop="recordType">
          <el-select v-model="recordForm.recordType" style="width: 100%">
            <el-option label="A记录" value="A" />
            <el-option label="CNAME记录" value="CNAME" />
            <el-option label="MX记录" value="MX" />
            <el-option label="TXT记录" value="TXT" />
            <el-option label="AAAA记录" value="AAAA" />
          </el-select>
        </el-form-item>

        <el-form-item label="记录值" prop="recordValue">
          <el-input
            v-model="recordForm.recordValue"
            :placeholder="getRecordValuePlaceholder()"
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <el-form-item label="TTL" prop="ttl">
          <el-select v-model="recordForm.ttl" style="width: 100%">
            <el-option label="1分钟 (60秒)" :value="60" />
            <el-option label="5分钟 (300秒)" :value="300" />
            <el-option label="10分钟 (600秒)" :value="600" />
            <el-option label="1小时 (3600秒)" :value="3600" />
            <el-option label="1天 (86400秒)" :value="86400" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitForm"
          :loading="submitting"
        >
          {{ isEdit ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useDomainStore } from '@/stores/domain'

const domainStore = useDomainStore()

// 响应式数据
const selectedDomain = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

// 表单数据
const recordForm = reactive({
  subdomain: '',
  recordType: 'A',
  recordValue: '',
  ttl: 3600
})

// 表单验证规则
const formRules = {
  recordType: [
    { required: true, message: '请选择记录类型', trigger: 'change' }
  ],
  recordValue: [
    { required: true, message: '请输入记录值', trigger: 'blur' }
  ],
  ttl: [
    { required: true, message: '请选择TTL值', trigger: 'change' }
  ]
}

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
    ElMessage.warning('请输入域名')
    return
  }

  try {
    await domainStore.fetchDnsRecords(selectedDomain.value.trim())
    ElMessage.success('DNS记录加载成功')
  } catch (error) {
    ElMessage.error('加载DNS记录失败')
  }
}

const showAddDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const editRecord = (record) => {
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

const deleteRecord = async (record) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条DNS记录吗？\n子域名: ${record.subdomain || '@'}\n类型: ${record.recordType}\n值: ${record.recordValue}`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await domainStore.deleteDnsRecord(record.id)
    ElMessage.success('DNS记录删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除DNS记录失败')
    }
  }
}

const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const params = {
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
    
    ElMessage.success(isEdit.value ? 'DNS记录更新成功' : 'DNS记录添加成功')
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新DNS记录失败' : '添加DNS记录失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(recordForm, {
    subdomain: '',
    recordType: 'A',
    recordValue: '',
    ttl: 3600
  })
}

const getRecordTypeColor = (type) => {
  const colors = {
    'A': 'primary',
    'CNAME': 'success',
    'MX': 'warning',
    'TXT': 'info',
    'AAAA': 'danger'
  }
  return colors[type] || 'default'
}

const getRecordValuePlaceholder = () => {
  const placeholders = {
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
.domain-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.domain-selector-card {
  margin-bottom: 20px;
}

.domain-selector {
  display: flex;
  align-items: center;
}

.domain-input {
  max-width: 500px;
}

.dns-records-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subdomain-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.record-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  word-break: break-all;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #fafafa;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>