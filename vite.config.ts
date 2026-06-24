import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { YunElpResolver } from 'yun-elp/resolver'

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    // codeInspectorPlugin只在开发环境
    command === 'serve' ? codeInspectorPlugin({ bundler: 'vite' }) : null,
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      resolvers: [ElementPlusResolver()],
      dirs: ['src/composables'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: { enabled: true },
    }),
    Components({
      resolvers: [
        ElementPlusResolver({ importStyle: 'sass' }),
        YunElpResolver({ importStyle: 'scss' }),
      ],
      dirs: ['src/components'],
      dts: 'src/components.d.ts',
    }),
    UnoCSS(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 添加kd主题样式
        additionalData: `@use "yun-elp/themes/kd.scss" as *;`,
      },
    },
  },
  build: {
    rolldownOptions: {
      checks: {
        invalidAnnotation: false,
        pluginTimings: false,
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('/vue/') ||
            id.includes('/vue-router/') ||
            id.includes('/pinia/') ||
            id.includes('/@vueuse/')
          )
            return 'framework'

          if (
            id.includes('/element-plus/') ||
            id.includes('/@element-plus/') ||
            id.includes('/yun-elp/')
          )
            return 'ui'

          if (id.includes('/axios/') || id.includes('/lodash-es/')) return 'utils'

          return 'vendor'
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}))
