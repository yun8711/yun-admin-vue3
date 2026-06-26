import { ElMessage } from 'element-plus'
import type { Router } from 'vue-router'

import { APP_TITLE } from '@/config/menu'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'

import { addDynamicRoutes, resetDynamicRoutes } from './index'

// 免登录页面白名单
const WHITE_LIST = ['/login', '/404']

/** 安装路由守卫：动态生成路由、登录校验、标题维护。 */
export function setupRouterGuard(router: Router): void {
  router.beforeEach(async to => {
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    // 白名单/免权限页面直接放行
    if (to.meta?.noAuth || WHITE_LIST.includes(to.path)) return true

    // 未登录：清理动态路由与权限态，跳转登录
    if (!userStore.token) {
      permissionStore.reset()
      resetDynamicRoutes()
      const redirect = to.fullPath === '/' ? undefined : to.fullPath
      return { path: '/login', query: redirect ? { redirect } : {}, replace: true }
    }

    // 已生成动态路由：处理根路径重定向，其余放行
    if (permissionStore.loaded) {
      if (to.path === '/') return { path: permissionStore.homePath, replace: true }
      return true
    }

    // 首次进入：生成动态路由并注入，再重新导航以命中新路由
    try {
      const routes = await permissionStore.generateRoutes()
      addDynamicRoutes(router, routes)

      if (permissionStore.noRoutes) return { path: '/404', replace: true }
      return { ...to, replace: true }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[router] generate routes failed:', error)
      ElMessage.error('路由初始化失败')
      userStore.logout()
      return { path: '/login', replace: true }
    }
  })

  router.afterEach(to => {
    const title = to.meta?.title
    document.title = title ? `${title} - ${APP_TITLE}` : APP_TITLE
  })
}
