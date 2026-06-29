import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
// @see https://www.npmjs.com/package/vite-plugin-qiankun
import qiankun from 'vite-plugin-qiankun'
import { YunElpResolver } from 'yun-elp/resolver'

/**
 * 根据多前缀条目生成 Vite 代理配置，对应 rhea-fe 的 getProxy()。
 * dev 模式下请求 /{prefix}_dev/xxx → rewrite 回 /{prefix}/xxx → 转发到 host[:port]/{prefix}
 */
function buildPrefixProxy(
  entries: { prefix: string; port: string }[],
  host: string
): Record<string, object> {
  return entries.reduce(
    (acc, { prefix, port }) => {
      // 独立端口场景：port 不为空时 target 使用 host:port，否则使用默认 host
      const target = port ? `${host}:${port}` : host
      const proxyKey = `/${prefix}_dev`
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

export default defineConfig(({ command, mode }) => {
  // 配置文件运行在 Node 环境，import.meta.env 不可用，需用 loadEnv 读取 .env.*
  const env = loadEnv(mode, process.cwd())

  const host = env.VITE_APP_PROXY_TARGET || 'http://192.168.122.130'

  // 解析多后端前缀条目（含可选端口）
  const prefixEntries: { prefix: string; port: string }[] = []
  if (env.VITE_APP_API_PREFIXES) {
    for (const item of env.VITE_APP_API_PREFIXES.split(',')) {
      const trimmed = item.trim()
      if (!trimmed) continue
      const [prefix, port = ''] = trimmed.split(':')
      const normalized = prefix.startsWith('/') ? prefix.slice(1) : prefix
      if (normalized) {
        prefixEntries.push({ prefix: normalized, port: port.trim() })
      }
    }
  }

  return {
    base: env.VITE_QIANKUN_ENABLED === 'true' && command === 'serve' ? '/' : '/subapp/rhea/',
    plugins: [
      vue(),
      // qiankun 子应用模式：仅 VITE_QIANKUN_ENABLED=true 时启用
      // 参数是子应用名，必须与主应用注册时 AppName 保持一致
      ...(env.VITE_QIANKUN_ENABLED === 'true' ? [qiankun('rhea', { useDevMode: true })] : []),
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
          additionalData: `
          @use "element-plus/theme-chalk/src/mixins/config.scss" as element-config with ($namespace: "ep");
          @use "yun-elp/theme-chalk/src/mixins/config.scss" as yun-config with ($namespace: "yp");
        `,
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
        // 默认后端代理（/api 开头的请求）
        '/api': {
          target: host,
          changeOrigin: true,
        },
        // 多后端前缀代理：/rhea_dev → host/rhea, /daas_dev → host/daas, ...
        ...buildPrefixProxy(prefixEntries, host),
        // qiankun dev 模式：将 /subapp/ 前缀的请求回源到自身根路径，
        // 解决 vite-plugin-qiankun useDevMode 下 __INJECTED_PUBLIC_PATH_BY_QIANKUN__ + '..' 导致路径丢失问题
        ...(env.VITE_QIANKUN_ENABLED === 'true' && command === 'serve'
          ? {
              '/subapp': {
                target: `http://localhost:${Number(env.VITE_APP_FE_PORT) || 5173}`,
                changeOrigin: true,
                rewrite: (path: string) => {
                  // /subapp/rhea 或 /subapp/rhea/ -> /（HTML entry，由 Vite 返回 index.html）
                  if (path === '/subapp/rhea' || path === '/subapp/rhea/') return '/'
                  // /subapp/@vite/client -> /@vite/client 等模块资源
                  return path.replace(/^\/subapp/, '')
                },
              },
            }
          : {}),
      },
    },
  }
})
