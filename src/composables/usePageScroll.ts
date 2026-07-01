import type { ScrollbarInstance } from 'element-plus'
import { inject, ref, type InjectionKey, type Ref } from 'vue'

// ========== 类型 ==========

export interface ScrollPayload {
  scrollTop: number
  scrollLeft: number
}

export interface PageScrollContext {
  scrollbarRef: Ref<ScrollbarInstance | undefined>
  scrollTop: Ref<number>
  scrollToTop: () => void
  scrollTo: (options: { top?: number; left?: number; behavior?: ScrollBehavior }) => void
}

// ========== provide/inject key ==========

export const PAGE_SCROLL_KEY: InjectionKey<PageScrollContext> = Symbol('pageScroll')

// ========== 布局层使用 ==========

export interface UsePageScrollReturn extends PageScrollContext {
  /** 绑到 el-scrollbar @scroll="onScroll" */
  onScroll: (payload: ScrollPayload) => void
}

/**
 * 页面滚动行为管理（在 BasicLayout 中调用）。
 *
 * --- 布局模板 ---
 *   <el-scrollbar ref="scrollbarRef" @scroll="onScroll"> ... </el-scrollbar>
 *
 * --- 两种监听滚动的方式 ---
 * 1. el-scrollbar 的 @scroll 事件 → 组件封装好的，回调参数 { scrollTop, scrollLeft }
 * 2. scrollbarRef.value?.wrapRef → 原生滚动 div，
 *    可自行 addEventListener('scroll', ...) 绑高频监听，或用 IntersectionObserver
 */
export function usePageScroll(): UsePageScrollReturn {
  const scrollbarRef = ref<ScrollbarInstance>()
  const scrollTop = ref(0)

  function onScroll(payload: ScrollPayload) {
    scrollTop.value = payload.scrollTop
  }

  function scrollToTop() {
    scrollbarRef.value?.setScrollTop(0)
  }

  function scrollTo(options: { top?: number; left?: number; behavior?: ScrollBehavior }) {
    scrollbarRef.value?.wrapRef?.scrollTo({
      top: options.top ?? 0,
      left: options.left ?? 0,
      behavior: options.behavior,
    })
  }

  return { scrollbarRef, scrollTop, onScroll, scrollToTop, scrollTo }
}

// ========== 子页面使用 ==========

/** 子页面通过 inject 获取页面滚动实例 */
export function injectPageScroll(): PageScrollContext {
  const ctx = inject(PAGE_SCROLL_KEY)
  if (!ctx) {
    throw new Error('injectPageScroll() 必须在 BasicLayout 的子组件中调用')
  }
  return ctx
}
