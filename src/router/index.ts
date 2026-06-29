import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw, Router } from 'vue-router'

import { CATCH_ALL_NAME, constantRoutes, finalRoute } from './constant-routes'
import { setupRouterGuard } from './guard'

const router = createRouter({
  history: createWebHashHistory('/'),
  routes: constantRoutes,
})

// 初始兜底路由对象（用于 resetDynamicRoutes 时恢复）
const catchAllRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: CATCH_ALL_NAME,
  redirect: '/',
  meta: { noAuth: true },
}

// 已注入动态路由的清理函数集合，用于精确移除（vue-router 4 的 addRoute 返回移除函数）。
let dynamicRouteRemovers: (() => void)[] = []

/** 注入动态路由：作为 Root 的子路由，移除初始兜底后追加最终兜底路由。 */
export function addDynamicRoutes(target: Router, routes: RouteRecordRaw[]): void {
  resetDynamicRoutes()
  // 初始兜底（redirect: '/'）→ 最终兜底（redirect: '/404'）
  // 初始兜底（redirect: '/'）→ 最终兜底（redirect: '/404'）
  try {
    target.removeRoute(CATCH_ALL_NAME)
  } catch {
    // 兜底可能已被移除（首次 generateRoutes 时 removeRoute 后 resetDynamicRoutes 已恢复），忽略
  }
  for (const route of routes) {
    dynamicRouteRemovers.push(target.addRoute('Root', route))
  }
  dynamicRouteRemovers.push(target.addRoute(finalRoute))
}

/** 移除全部动态路由，恢复到仅含常量路由的状态（含初始兜底）。 */
export function resetDynamicRoutes(): void {
  while (dynamicRouteRemovers.length) {
    dynamicRouteRemovers.pop()?.()
  }
  dynamicRouteRemovers = []
  // 恢复初始兜底路由（动态路由卸载后，未知路径静默跳转到 /）
  try {
    router.removeRoute(CATCH_ALL_NAME)
  } catch {
    // 可能已被移除，忽略
  }
  router.addRoute(catchAllRoute)
}

/** 兼容入口：重置动态路由。 */
export function resetRouter(): void {
  resetDynamicRoutes()
}

setupRouterGuard(router)

export default router
