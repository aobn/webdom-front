<!--
/**
 * @fileoverview 应用底部组件
 * @description 展示应用的底部信息，包括版权和链接
 * @author 开发团队 <dev@example.com>
 * @created 2024-01-20
 * @updated 2024-01-20
 * @version 1.0.0
 */
-->

<template>
  <!-- 应用底部容器 -->
  <v-footer class="app-footer">
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="12" class="text-center">
          <!-- 版权信息 -->
          <div class="footer-content">
           备案号：阿森松岛反覆
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
/**
 * 应用底部组件的组合式 API 逻辑
 * 
 * @description 处理底部信息的展示和数据管理
 */

/**
 * 当前年份
 * 
 * @description 获取当前年份用于版权信息
 */
import { computed } from 'vue';
const currentYear = computed(() => new Date().getFullYear());

/**
 * 组件挂载时的初始化
 */
import { onMounted } from 'vue';
onMounted(() => {
  console.log('AppFooter 组件已挂载');
});
</script>

<style scoped>
/**
 * 应用底部样式
 * 
 * @description 定义底部组件的样式
 */

/**
 * 底部容器样式
 * 包含渐变背景、边框和固定高度设置
 */
  .app-footer {
    /* 设置渐变背   景色,从浅灰色过渡到深灰色 */
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    /* 顶部添加分隔线 */
    border-top: 0px solid rgba(0, 0, 0, 0.12);
    /* 自动设置顶部外边距,使footer保持在底部 */
    margin-top: auto;
    /* 固定高度为30px,使用!important确保样式优先级 */
    height: 30px !important;
    min-height: 30px !important;
    max-height: 30px !important;
}

/* 底部内容 */
.footer-content {
  padding: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 底部文字 */
.footer-text {
  color: rgba(0, 0, 0, 0.6);
  font-size: 13px;
  margin: 0 0 6px 0;
  line-height: 1.4;
}

/* 分隔符 */
.separator {
  margin: 0 8px;
  color: rgba(0, 0, 0, 0.3);
}



/* 响应式设计 */
@media (max-width: 600px) {
  .footer-text {
    font-size: 12px;
  }
  
  .separator {
    display: block;
    margin: 4px 0;
  }
}

/* 深色主题适配 */
.v-theme--dark .app-footer {
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  border-top-color: rgba(255, 255, 255, 0.12);
}

.v-theme--dark .footer-text {
  color: rgba(255, 255, 255, 0.7);
}

.v-theme--dark .separator {
  color: rgba(255, 255, 255, 0.3);
}
</style>