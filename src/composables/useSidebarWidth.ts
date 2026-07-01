import { inject, ref, type InjectionKey, type Ref } from 'vue'

// ========== provide/inject key ==========

export const SIDEBAR_WIDTH_KEY: InjectionKey<Ref<number>> = Symbol('sidebarWidth')

// ========== 子页面使用 ==========

/** 子页面通过 inject 获取当前侧边栏宽度（px），0 表示隐藏 */
export function injectSidebarWidth(): Ref<number> {
  const width = inject(SIDEBAR_WIDTH_KEY)
  if (!width) {
    // 非 BasicLayout 子组件时回退到默认值 184
    return ref(184)
  }
  return width
}
