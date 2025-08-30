import { ref, computed } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'

// 主题类型
export type ThemeMode = 'light' | 'dark' | 'auto'

// 主题状态
const themeMode = ref<ThemeMode>('light')
const systemPrefersDark = ref(false)

// 检测系统主题偏好
const detectSystemTheme = () => {
  if (typeof window !== 'undefined') {
    systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches
    })
  }
}

// 从本地存储加载主题设置
const loadThemeFromStorage = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      themeMode.value = savedTheme
    }
  }
}

// 保存主题设置到本地存储
const saveThemeToStorage = (mode: ThemeMode) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme-mode', mode)
  }
}

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme()
  
  // 计算当前应该使用的主题
  const currentTheme = computed(() => {
    if (themeMode.value === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return themeMode.value
  })
  
  // 主题图标
  const themeIcon = computed(() => {
    switch (themeMode.value) {
      case 'light':
        return 'mdi-weather-sunny'
      case 'dark':
        return 'mdi-weather-night'
      case 'auto':
        return 'mdi-theme-light-dark'
      default:
        return 'mdi-weather-sunny'
    }
  })
  
  // 主题名称
  const themeName = computed(() => {
    switch (themeMode.value) {
      case 'light':
        return '浅色模式'
      case 'dark':
        return '深色模式'
      case 'auto':
        return '跟随系统'
      default:
        return '浅色模式'
    }
  })
  
  // 切换到下一个主题
  const toggleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'auto']
    const currentIndex = modes.indexOf(themeMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setTheme(modes[nextIndex])
  }
  
  // 设置主题
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode
    saveThemeToStorage(mode)
    applyTheme()
  }
  
  // 应用主题到Vuetify
  const applyTheme = () => {
    vuetifyTheme.global.name.value = currentTheme.value
  }
  
  // 初始化主题
  const initTheme = () => {
    detectSystemTheme()
    loadThemeFromStorage()
    applyTheme()
  }
  
  // 获取所有可用主题选项
  const getThemeOptions = () => [
    { value: 'light', title: '浅色模式', icon: 'mdi-weather-sunny' },
    { value: 'dark', title: '深色模式', icon: 'mdi-weather-night' },
    { value: 'auto', title: '跟随系统', icon: 'mdi-theme-light-dark' }
  ]
  
  return {
    // 状态
    themeMode: readonly(themeMode),
    currentTheme,
    systemPrefersDark: readonly(systemPrefersDark),
    
    // 计算属性
    themeIcon,
    themeName,
    
    // 方法
    toggleTheme,
    setTheme,
    initTheme,
    getThemeOptions
  }
}

// 全局主题实例
let globalThemeInstance: ReturnType<typeof useTheme> | null = null

export function useGlobalTheme() {
  if (!globalThemeInstance) {
    globalThemeInstance = useTheme()
  }
  return globalThemeInstance
}