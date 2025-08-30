/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          'surface-variant': '#F5F5F5',
          'surface-bright': '#FFFFFF',
          'surface-light': '#EEEEEE',
          'surface-container': '#F8F8F8',
          'surface-container-high': '#F0F0F0',
          'surface-container-highest': '#E8E8E8',
        },
      },
    },
  },
})
