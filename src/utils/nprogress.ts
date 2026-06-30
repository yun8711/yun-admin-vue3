/**
 * 轻量路由进度条，对标 NProgress 的 start / done API，
 * 通过顶部伪元素实现，无需额外依赖。
 */

let timer: ReturnType<typeof setTimeout> | null = null

/**
 * 显示进度条。
 * - 若已有进度条则重置到初始位置再启动；
 * - 连续调用 start 不叠加，保持单一条。
 */
export function start(): void {
  // 清除上一次的 done 定时器（如有）
  if (timer) {
    clearTimeout(timer)
    timer = null
  }

  const el = document.getElementById('__route_progress__')
  if (el) {
    el.style.opacity = '1'
    el.style.transition = 'none'
    el.style.width = '0'

    void el.offsetHeight // 强制重绘
    el.style.transition = 'width 0.4s ease'
    // 下一帧再设宽度，确保 transition 生效
    requestAnimationFrame(() => {
      el.style.width = '30%'
    })
  } else {
    const bar = document.createElement('div')
    bar.id = '__route_progress__'
    bar.style.cssText =
      'position:fixed;top:0;left:0;z-index:9999;height:2px;' +
      'background:var(--el-color-primary);width:0;opacity:1'
    document.body.appendChild(bar)

    void bar.offsetHeight
    bar.style.transition = 'width 0.4s ease'
    requestAnimationFrame(() => {
      bar.style.width = '30%'
    })
  }
}

/** 完成进度条：渐隐移除 */
export function done(): void {
  const el = document.getElementById('__route_progress__')
  if (!el) return

  el.style.transition = 'width 0.2s ease'
  el.style.width = '100%'

  timer = setTimeout(() => {
    el.style.transition = 'opacity 0.3s ease'
    el.style.opacity = '0'
    timer = setTimeout(() => {
      el.remove()
      timer = null
    }, 300)
  }, 200)
}

/** 立即移除（出错等场景） */
export function remove(): void {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  const el = document.getElementById('__route_progress__')
  if (el) el.remove()
}
