/// <reference types="vite/client" />

declare module 'element-plus/dist/locale/zh-cn.mjs'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface Window {
  __POWERED_BY_QIANKUN__?: boolean
}
