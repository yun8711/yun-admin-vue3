/// <reference types="vite/client" />

declare module 'element-plus/dist/locale/zh-cn.mjs'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_BASE_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
