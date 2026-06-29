import { ElMessage } from 'element-plus'
import type { RouteLocationNormalized, Router } from 'vue-router'

import { sendMessage } from '@/composables/useQiankunActions'
import { APP_TITLE, SKIP_MENU_AUTH } from '@/config/menu'
import { useGlobalStore } from '@/stores/global'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'
import { done, remove, start } from '@/utils/nprogress'

import { CATCH_ALL_NAME } from './constant-routes'
import { addDynamicRoutes, resetDynamicRoutes } from './index'

// 免登录页面白名单：跳过菜单权限时无登录页，仅 404
const WHITE_LIST: string[] = SKIP_MENU_AUTH ? ['/404'] : ['/login', '/404']

/** 安装路由守卫：对标 rhea-fe routerEach.js 实现完整守卫逻辑。 */
export function setupRouterGuard(router: Router): void {
  router.beforeEach(async to => {
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const globalStore = useGlobalStore()

    to.meta.query = to.query
    to.meta.params = to.params

    start()
    sendMessage({ tenantDisabled: !to.meta?.isMenu && to.path !== '/404' })

    // 白名单/免权限页面直接放行
    if (to.meta?.noAuth || WHITE_LIST.includes(to.path)) return true

    // 跳过菜单权限时，不要求登录态
    if (!SKIP_MENU_AUTH) {
      if (!userStore.token) {
        permissionStore.reset()
        resetDynamicRoutes()
        const redirect = to.fullPath === '/' ? undefined : to.fullPath
        return { path: '/login', query: redirect ? { redirect } : {}, replace: true }
      }
    }

    // 已生成动态路由
    if (permissionStore.loaded) {
      setSidebar(to, globalStore)

      // 根路径 → 重定向到首页
      if (to.path === '/') {
        return { path: permissionStore.homePath, replace: true }
      }

      // 目标路由已存在 → 直接放行
      if (!import.meta.env.DEV || routeExists(router, to.path)) {
        return true
      }
      // dev 模式：目标路由不存在（HMR 新增模块）→ 继续走 regeneration
    }

    // 生成/再生动态路由
    try {
      const routes = await permissionStore.generateRoutes()
      addDynamicRoutes(router, routes)

      if (permissionStore.noRoutes) return { path: '/404', replace: true }
      return { ...to, replace: true }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[router] generate routes failed:', error)
      ElMessage.error('路由初始化失败')
      remove()
      userStore.logout()
      return { path: SKIP_MENU_AUTH ? '/404' : '/login', replace: true }
    }
  })

  router.afterEach(to => {
    const globalStore = useGlobalStore()
    addCacheRoute(to, globalStore)
    handleBreadcrumb(to, globalStore)
    done()

    const prefix = globalStore.tabPrefix || APP_TITLE
    const title = to.meta?.title
    document.title = title ? `${title} - ${prefix}` : prefix
  })
}

/**
 * 检查目标路径是否在 router 中已有匹配路由（排除 catch-all 兜底）
 */
function routeExists(router: Router, path: string): boolean {
  const resolved = router.resolve(path)
  return resolved.matched.some(r => r.name && r.name !== CATCH_ALL_NAME)
}

/**
 * 侧边栏状态控制：优先取 meta.sidebar，其次 defaultSidebarStatus，兜底 'default'
 */
function setSidebar(
  route: RouteLocationNormalized,
  globalStore: ReturnType<typeof useGlobalStore>
): void {
  const value = (route.meta?.sidebar as string) || globalStore.defaultSidebarStatus || 'default'
  globalStore.setSidebarStatus(value)
}

function addCacheRoute(
  route: RouteLocationNormalized,
  globalStore: ReturnType<typeof useGlobalStore>
): void {
  if (route.meta?.cache) {
    globalStore.addCachedView(route.name)
  }
}

function handleBreadcrumb(
  to: RouteLocationNormalized,
  globalStore: ReturnType<typeof useGlobalStore>
): void {
  const firstHiddenIdx = to.matched.findIndex(r => r.meta?.hidden)
  const list: { path: string; title: string }[] = []

  if (firstHiddenIdx !== -1) {
    for (let i = Math.max(0, firstHiddenIdx - 1); i < to.matched.length; i++) {
      const record = to.matched[i]
      if (record.meta?.breadcrumb !== false) {
        list.push({ path: record.path, title: (record.meta?.title as string) || '' })
      }
    }
  }

  globalStore.setBreadcrumbList(list)
}
