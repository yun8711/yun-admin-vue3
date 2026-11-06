import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
// @see https://www.npmjs.com/package/vite-plugin-qiankun
import qiankun from 'vite-plugin-qiankun'
import { YunElpResolver } from 'yun-elp/resolver'

import { appConfig, requestConfig } from './vite.custom.ts'

export default defineConfig(() => {
  const { host, port } = appConfig
  const prefixEntries = requestConfig.apiPrefixes.flatMap(item => {
    const prefix = item.prefix.trim().replace(/^\//, '')
    if (!prefix) return []
    return [{ prefix, port: item.port?.trim() || '' }]
  })

  return {
    // 基础配置（共享配置）
    base: appConfig.base,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      dedupe: ['vue', 'element-plus', 'vue-router'],
    },
    // CSS 预处理器配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @use "element-plus/theme-chalk/src/mixins/config.scss" as element-config with ($namespace: "ep");
          @use "yun-elp/theme-chalk/src/mixins/config.scss" as yun-config with ($namespace: "yp");
        `,
        },
      },
    },

    // 插件配置
    plugins: [
      {
        name: 'app-title',
        transformIndexHtml(html: string) {
          return html.replaceAll('%APP_TITLE%', appConfig.title)
        },
      },
      vue(),

      // 子应用名必须与主应用注册时的 name 一致
      qiankun(appConfig.name, { useDevMode: appConfig.isDev }),
      // codeInspectorPlugin只在开发环境（不含 preview）
      // command === 'serve' && isPreview !== true ? codeInspectorPlugin({ bundler: 'vite' }) : null,
      codeInspectorPlugin({
        bundler: 'vite',
      }),
      // 与 importStyle: 'sass' 对齐
      ElementPlus({ useSource: true }),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        dirs: ['src/composables'],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: { enabled: true },
      }),
      Components({
        resolvers: [
          ElementPlusResolver({ importStyle: 'sass' }),
          YunElpResolver({ importStyle: 'scss', importElementStyle: 'sass' }),
        ],
        dirs: ['src/components'],
        dts: 'src/types/components.d.ts',
      }),
      UnoCSS(),
      visualizer(),
    ],

    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      port,
      proxy: {
        // 默认后端代理（/api 开头的请求）
        '/api': {
          target: host,
          changeOrigin: true,
        },
        // 多后端前缀代理：/rhea_dev → host/rhea, /daas_dev → host/daas, ...
        ...buildPrefixProxy(prefixEntries, host, requestConfig.devProxySuffix),
      },
    },

    // 构建配置
    build: {
      rolldownOptions: {
        checks: {
          invalidAnnotation: false,
          pluginTimings: false,
        },
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            if (id.includes('/echarts/') || id.includes('/zrender/')) return 'echarts'

            // pnpm 路径为 @vue+runtime-core/.../@vue/...，不能用 '/vue/'
            if (id.includes('/@vue/') || id.includes('/vue-router/') || id.includes('/pinia/'))
              return 'framework'

            if (id.includes('/@vueuse/')) return 'vueuse'

            if (id.includes('/element-plus/') || id.includes('/@element-plus/'))
              return 'element-plus'

            if (id.includes('/yun-elp/')) {
              return 'yun-elp'
            }

            if (id.includes('/axios/') || id.includes('/lodash-es/')) return 'utils'

            return 'vendor'
          },
        },
      },
    },

    // 预构建配置
    optimizeDeps: {
      include: ['yun-elp', 'yun-elp/echarts', 'element-plus/es', ...elementPlusStyleDeps()],
    },
  }
})

/**
 * 根据多前缀条目生成 Vite 代理配置，对应 rhea-fe 的 getProxy()。
 * dev 模式下请求 /{prefix}_dev/xxx → rewrite 回 /{prefix}/xxx → 转发到 host[:port]/{prefix}
 */
function buildPrefixProxy(
  entries: { prefix: string; port: string }[],
  host: string,
  suffix: string
): Record<string, object> {
  return entries.reduce(
    (acc, { prefix, port }) => {
      // 独立端口场景：port 不为空时 target 使用 host:port，否则使用默认 host
      const target = port ? replacePort(host, port) : host
      const proxyKey = `/${prefix}${suffix}`
      acc[proxyKey] = {
        target,
        changeOrigin: true,
        // /rhea_dev/user/list → /rhea/user/list → host/rhea/user/list
        rewrite: (path: string) => path.replace(proxyKey, `/${prefix}`),
      }
      return acc
    },
    {} as Record<string, object>
  )
}

/** host 已带端口时，换成前缀自己的端口。 */
function replacePort(host: string, port: string): string {
  const url = new URL(host)
  url.port = port
  return url.origin
}

/** 按需样式在编译 SFC 时才插入，启动扫描看不到；提前列入，避免异步路由首次进入时补预构建并整页刷新。 */
function elementPlusStyleDeps(): string[] {
  const root = fileURLToPath(new URL('./node_modules/element-plus/es/components', import.meta.url))
  if (!fs.existsSync(root)) return []
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .filter(entry => fs.existsSync(path.join(root, entry.name, 'style/index.mjs')))
    .map(entry => `element-plus/es/components/${entry.name}/style/index`)
}
