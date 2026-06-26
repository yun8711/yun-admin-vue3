import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import { YunElpResolver } from 'yun-elp/resolver'

export default defineConfig(({ command, mode }) => {
  // 配置文件运行在 Node 环境，import.meta.env 不可用，需用 loadEnv 读取 .env.*
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      // codeInspectorPlugin只在开发环境
      command === 'serve' ? codeInspectorPlugin({ bundler: 'vite' }) : null,
      // 与 importStyle: 'sass' 对齐
      ElementPlus({ useSource: true }),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        dirs: ['src/composables'],
        dts: 'src/auto-imports.d.ts',
        eslintrc: { enabled: true },
      }),
      Components({
        resolvers: [
          ElementPlusResolver({ importStyle: 'sass' }),
          YunElpResolver({ importStyle: 'scss', importElementStyle: 'sass' }),
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
          // additionalData: `@use "yun-elp/themes/kd.scss" as *;`,
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
      port: Number(env.VITE_APP_FE_PORT) || 5173,
      proxy: {
        '/api': {
          // target: 'http://localhost:3000',
          target: env.VITE_APP_PROXY_TARGET,
          changeOrigin: true,
        },
      },
    },
  }
})
