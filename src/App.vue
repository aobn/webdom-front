<template>
  <v-app class="white-background">
    <router-view />
    
    <!-- 全局对话框 -->
    <GlobalDialog
      v-model="globalDialog.dialogState.visible"
      :type="globalDialog.dialogState.config.type"
      :title="globalDialog.dialogState.config.title"
      :message="globalDialog.dialogState.config.message"
      :icon="globalDialog.dialogState.config.icon"
      :max-width="globalDialog.dialogState.config.maxWidth"
      :persistent="globalDialog.dialogState.config.persistent"
      :scrollable="globalDialog.dialogState.config.scrollable"
      :loading="globalDialog.dialogState.loading"
      :show-actions="globalDialog.dialogState.config.showActions"
      :show-cancel-button="globalDialog.dialogState.config.showCancelButton"
      :show-confirm-button="globalDialog.dialogState.config.showConfirmButton"
      :cancel-button-text="globalDialog.dialogState.config.cancelButtonText"
      :confirm-button-text="globalDialog.dialogState.config.confirmButtonText"
      @confirm="globalDialog.handleConfirm"
      @cancel="globalDialog.handleCancel"
      @close="globalDialog.handleClose"
    />
  </v-app>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import GlobalDialog from '@/components/GlobalDialog.vue'
import { globalDialog } from '@/composables/useGlobalDialog'
import { useGlobalTheme } from '@/composables/useTheme'

// 初始化主题
const { initTheme } = useGlobalTheme()

// 组件挂载时初始化主题
onMounted(() => {
  initTheme()
})
</script>

<style scoped>
.white-background {
  background-color: #FFFFFF !important;
}
</style>
