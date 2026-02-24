import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { YunElpResolver } from 'yun-elp/resolver'

export default defineConfig({
  plugins: [
    vue(),
    codeInspectorPlugin({ bundler: 'vite' }),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      resolvers: [ElementPlusResolver()],
      dirs: ['src/composables', 'src/utils'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: { enabled: true },
    }),
    Components({
      resolvers: [ElementPlusResolver(), YunElpResolver()],
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
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
