import { i18nPlugin } from '@voerkai18n/vue'
import { createPinia } from 'pinia'
// @see https://www.npmjs.com/package/vite-plugin-qiankun
import {
  renderWithQiankun,
  qiankunWindow,
  type QiankunProps,
} from 'vite-plugin-qiankun/dist/helper'
import { createApp } from 'vue'

import 'uno.css'
import '@/assets/iconfont/iconfont.css'
import '@/styles/index.scss'
import 'yun-elp/themes/kd.scss'
import App from './App.vue'
import { setQiankunActions } from './composables/useQiankunActions'
import router from './router'

/** Vue 应用实例引用，unmount 时需要 */
let app: ReturnType<typeof createApp> | null = null

/**
 * 渲染 Vue 应用
 * @param props - qiankun 生命周期传入的 props（含 container）或独立运行时传空对象
 */
function render(props: QiankunProps = {}) {
  const { container } = props
  // qiankun 环境挂载到 container 内 #app；独立运行挂载到 document 上 #app
  const mountNode = container ? container.querySelector('#app') : document.getElementById('app')

  app = createApp(App)
  app.use(createPinia())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use(i18nPlugin as any)
  app.use(router)
  app.mount(mountNode || '#app')
}

// 运行时判断：qiankun 主应用加载时 __POWERED_BY_QIANKUN__ 为 true，
// 通过 renderWithQiankun 注入生命周期；独立运行时直接渲染。
if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  renderWithQiankun({
    bootstrap() {
      // eslint-disable-next-line no-console
      console.log('子应用【rhea】加载')
    },
    mount(props: QiankunProps) {
      // 注入主应用下发的 actions（onGlobalStateChange / setGlobalState）
      setQiankunActions(props)
      render(props)
    },
    unmount(_props: QiankunProps) {
      app?.unmount()
      app = null
    },
    update(_props: QiankunProps) {
      // 主应用更新时调用，子应用可按需处理
    },
  })
} else {
  render()
}
