import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

import { getRouteList } from '@/api/menu'
import { SKIP_MENU_AUTH } from '@/config/menu'
import { asyncRoutes } from '@/router/dynamic-routes'
import { buildMenuList, filterAsyncRoutes, firstMenuPath, flattenAuthMenus } from '@/router/menu'
import type { AuthMenu, MenuNode } from '@/router/types'

export const usePermissionStore = defineStore('permission', () => {
  // 动态路由是否已生成（用于守卫判断是否需要拉取）
  const loaded = ref(false)
  // 过滤合并后的动态路由
  const permissionRoutes = ref<RouteRecordRaw[]>([])
  // 侧边栏菜单
  const menuList = ref<MenuNode[]>([])
  // 全部动态路由完整路径
  const allPaths = ref<string[]>([])
  // 是否没有任何可访问路由（避免守卫死循环）
  const noRoutes = ref(false)
  // 根路径重定向目标
  const homePath = ref('/')
  // menuKey -> 后端菜单，用于按钮级权限
  const authMap = ref<Map<string, AuthMenu>>(new Map())

  /** 拉取后端菜单并与本地异步路由合并，生成可访问路由表与菜单。 */
  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    let menus: AuthMenu[] = []
    if (!SKIP_MENU_AUTH) {
      menus = (await getRouteList()) ?? []
    }

    const map = flattenAuthMenus(menus)
    const { routes, paths } = filterAsyncRoutes(asyncRoutes, map, SKIP_MENU_AUTH)
    const menus2 = buildMenuList(routes)

    authMap.value = map
    permissionRoutes.value = routes
    allPaths.value = paths
    menuList.value = menus2
    noRoutes.value = routes.length === 0
    homePath.value = firstMenuPath(menus2) || '/404'
    loaded.value = true

    return routes
  }

  /** 按钮级权限判断：跳过权限时恒为 true。 */
  function hasAction(menuKey: string, action: string): boolean {
    if (SKIP_MENU_AUTH) return true
    const menu = authMap.value.get(menuKey)
    if (!menu) return false
    return (menu.btnList ?? []).some(btn => (btn.actionMode ?? btn.action_mode) === action)
  }

  /** 重置权限状态（登出或鉴权失效时调用）。 */
  function reset(): void {
    loaded.value = false
    permissionRoutes.value = []
    menuList.value = []
    allPaths.value = []
    noRoutes.value = false
    homePath.value = '/'
    authMap.value = new Map()
  }

  return {
    loaded,
    permissionRoutes,
    menuList,
    allPaths,
    noRoutes,
    homePath,
    authMap,
    generateRoutes,
    hasAction,
    reset,
  }
})
