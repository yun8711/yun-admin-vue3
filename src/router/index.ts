import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, Router } from 'vue-router'

import { constantRoutes, finalRoute } from './constant-routes'
import { setupRouterGuard } from './guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
})

// 已注入动态路由的清理函数集合，用于精确移除（vue-router 4 的 addRoute 返回移除函数）。
let dynamicRouteRemovers: (() => void)[] = []

/** 注入动态路由：作为 Root 的子路由，并在末尾追加兜底路由。 */
export function addDynamicRoutes(target: Router, routes: RouteRecordRaw[]): void {
  resetDynamicRoutes()
  for (const route of routes) {
    dynamicRouteRemovers.push(target.addRoute('Root', route))
  }
  dynamicRouteRemovers.push(target.addRoute(finalRoute))
}

/** 移除全部动态路由，恢复到仅含常量路由的状态。 */
export function resetDynamicRoutes(): void {
  while (dynamicRouteRemovers.length) {
    dynamicRouteRemovers.pop()?.()
  }
  dynamicRouteRemovers = []
}

/** 兼容入口：重置动态路由。 */
export function resetRouter(): void {
  resetDynamicRoutes()
}

setupRouterGuard(router)

export default router
