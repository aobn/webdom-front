<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :icon="themeIcon"
        variant="text"
        size="default"
        class="theme-toggle-btn"
        :title="themeName"
      />
    </template>
    
    <v-list density="compact" min-width="160">
      <v-list-item
        v-for="option in themeOptions"
        :key="option.value"
        :active="themeMode === option.value"
        @click="setTheme(option.value as ThemeMode)"
      >
        <template #prepend>
          <v-icon :icon="option.icon" size="small" />
        </template>
        
        <v-list-item-title>{{ option.title }}</v-list-item-title>
        
        <template #append>
          <v-icon
            v-if="themeMode === option.value"
            icon="mdi-check"
            size="small"
            color="primary"
          />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useGlobalTheme } from '@/composables/useTheme'
import type { ThemeMode } from '@/composables/useTheme'

// 使用全局主题
const {
  themeMode,
  themeIcon,
  themeName,
  setTheme,
  getThemeOptions
} = useGlobalTheme()

// 主题选项
const themeOptions = getThemeOptions()
</script>

<style scoped>
.theme-toggle-btn {
  transition: all 0.2s ease;
}

.theme-toggle-btn:hover {
  transform: scale(1.05);
}
</style>