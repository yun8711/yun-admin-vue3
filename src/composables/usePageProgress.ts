import { nextTick, ref } from 'vue'

/** 绑定到 y-page-progress 的 v-model */
const visible = ref(false)

/** 路由加载是否仍在进行。组件挂载时 v-model 可能已经是 true，需要补一次切换。 */
let active = false

/** 页面顶部进度条开关，供路由守卫与 App 共用。 */
export function usePageProgress() {
  function start(): void {
    active = true
    visible.value = true
  }

  function done(): void {
    active = false
    visible.value = false
  }

  /**
   * 组件挂载后调用。
   * y-page-progress 只在 v-model 变化时开始，首次导航若发生在挂载前则需要重放一次。
   */
  async function sync(): Promise<void> {
    if (!active) return
    visible.value = false
    await nextTick()
    if (active) visible.value = true
  }

  return { visible, start, done, sync }
}
