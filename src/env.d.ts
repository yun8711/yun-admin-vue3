/// <reference types="vite/client" />

declare module 'element-plus/dist/locale/zh-cn.mjs'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_RES_PATH?: string
  readonly VITE_APP_ERROR_PATH?: string
  readonly VITE_APP_API_PREFIX?: string
  readonly VITE_APP_API_PREFIXES?: string
  readonly VITE_APP_DEV_PROXY_SUFFIX?: string
  readonly VITE_APP_SKIP_MENU_AUTH?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_FE_PORT?: string
  readonly VITE_APP_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __POWERED_BY_QIANKUN__?: boolean
}
