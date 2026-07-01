import type { RouteMeta, RouteRecordRaw } from 'vue-router'

import type { AuthMenu, MenuNode } from './types'

// 路由记录的宽松视图，方便在过滤/合并时读取通用字段。
type RouteLike = RouteRecordRaw & {
  path: string
  name?: RouteRecordRaw['name']
  meta?: RouteMeta
  children?: RouteRecordRaw[]
}

/** 拼接父子路径，子路径以 '/' 开头时视为绝对路径。 */
export function joinPath(parentPath: string, path: string): string {
  if (path.startsWith('/')) return path
  // parentPath 可能为空（顶层路由），此时直接返回 path
  const merged = parentPath ? `${parentPath}/${path}` : path
  return `/${merged}`.replace(/\/{2,}/g, '/')
}

/** 同级路由排序：按 meta.serialNum 升序。 */
function sortBySerial(a: RouteLike, b: RouteLike): number {
  return (a.meta?.serialNum ?? 0) - (b.meta?.serialNum ?? 0)
}

/** 将后端菜单树扁平化为 menuKey -> AuthMenu 的映射，便于按 key 匹配。 */
export function flattenAuthMenus(
  menus: AuthMenu[] | undefined,
  map: Map<string, AuthMenu> = new Map()
): Map<string, AuthMenu> {
  for (const menu of menus ?? []) {
    if (menu?.menuKey) map.set(menu.menuKey, menu)
    if (menu?.children?.length) flattenAuthMenus(menu.children, map)
  }
  return map
}

/**
 * 递归遍历路由树，构建 name → 完整路径映射。
 * 用于下钻页通过 meta.parent（父路由 name）自动推导 activeMenu。
 */
function buildNamePathMap(routes: RouteRecordRaw[], parentPath = ''): Map<string, string> {
  const map = new Map<string, string>()
  for (const route of routes as RouteLike[]) {
    const fullPath = joinPath(parentPath, route.path)
    if (route.name) {
      map.set(route.name as string, fullPath)
    }
    if (route.children?.length) {
      const childMap = buildNamePathMap(route.children, fullPath)
      for (const [name, path] of childMap) {
        map.set(name, path)
      }
    }
  }
  return map
}

/**
 * 过滤并合并异步路由（公开入口）：
 * 先构建 name → path 映射，再调用内部实现，自动填充 activeMenu。
 */
export function filterAsyncRoutes(
  routes: RouteRecordRaw[],
  authMap: Map<string, AuthMenu>,
  skip: boolean,
  parentPath = ''
): { routes: RouteRecordRaw[]; paths: string[] } {
  // activeMenu 自动填充始终需要 name → path 映射，与是否跳过权限无关
  const namePathMap = buildNamePathMap(routes)
  return filterAsyncRoutesImpl(routes, authMap, skip, parentPath, namePathMap)
}

/**
 * 递归遍历路由树进行权限过滤与 meta 合并。
 * 未配置 activeMenu 但存在 parent 的下钻页，自动根据父路由 name 填充完整路径。
 */
function filterAsyncRoutesImpl(
  routes: RouteRecordRaw[],
  authMap: Map<string, AuthMenu>,
  skip: boolean,
  parentPath: string,
  namePathMap: Map<string, string>
): { routes: RouteRecordRaw[]; paths: string[] } {
  const result: RouteRecordRaw[] = []
  const paths: string[] = []

  for (const route of routes as RouteLike[]) {
    const fullPath = joinPath(parentPath, route.path)
    const menuKey = route.meta?.menuKey
    const auth = menuKey ? authMap.get(menuKey) : undefined

    // 权限过滤：配置 menuKey 但后端未返回 → 跳过
    const accessible = skip || !menuKey || Boolean(auth)
    if (!accessible) continue

    const isMenu = route.meta?.isMenu ?? !route.meta?.hidden

    // 后端 externalUrl 存在时使用其作为 path
    const merged: RouteLike = {
      ...route,
      path: (auth?.externalUrl as string) || route.path,
      meta: {
        ...route.meta,
        parent: route.meta?.parent ?? '',
        isMenu,
        title: isMenu && auth?.name ? auth.name : route.meta?.title,
        icon: route.meta?.icon, // 图标始终取本地，不与后端合并
        // activeMenu 自动填充：已手动配置则保留，否则按 parent 查找父路由完整路径
        activeMenu:
          route.meta?.activeMenu ||
          (route.meta?.parent ? (namePathMap.get(route.meta.parent) ?? '') : ''),
        btnList: auth?.btnList ?? route.meta?.btnList ?? [],
        serialNum: auth?.serialNum ?? route.meta?.serialNum ?? 0,
        menuKey: route.meta?.menuKey,
        sidebar: route.meta?.sidebar,
        breadcrumb: route.meta?.breadcrumb,
        cache: route.meta?.cache ?? false,
      },
    }

    // 递归处理子路由
    let childResult: { routes: RouteRecordRaw[]; paths: string[] } | null = null
    if (route.children?.length) {
      childResult = filterAsyncRoutesImpl(route.children, authMap, skip, fullPath, namePathMap)
      merged.children = childResult.routes

      // 未显式指定 redirect 则自动指向第一个子路由
      if (!merged.redirect && childResult.routes.length > 0) {
        merged.redirect = joinPath(fullPath, childResult.routes[0].path)
      }
    }

    // 条件 2：子路由全部被过滤，且父路由无 component 无 redirect → 不展示
    if (childResult && childResult.routes.length === 0 && !merged.component && !merged.redirect) {
      continue
    }

    paths.push(fullPath)
    if (childResult) {
      paths.push(...childResult.paths)
    }

    result.push(merged as RouteRecordRaw)
  }

  result.sort(sortBySerial as (a: RouteRecordRaw, b: RouteRecordRaw) => number)
  return { routes: result, paths }
}

/** 由过滤后的路由派生侧边栏菜单：跳过隐藏项，丢弃没有可见子项的空分组。 */
export function buildMenuList(routes: RouteRecordRaw[], parentPath = ''): MenuNode[] {
  const list: MenuNode[] = []

  for (const route of routes as RouteLike[]) {
    if (route.meta?.hidden) continue

    const fullPath = joinPath(parentPath, route.path)
    const node: MenuNode = {
      path: fullPath,
      title: route.meta?.title ?? '',
      icon: route.meta?.icon,
    }

    if (route.children?.length) {
      const children = buildMenuList(route.children, fullPath)
      if (!children.length) continue
      node.children = children
    }

    list.push(node)
  }

  return list
}

/** 取菜单中第一个可跳转的叶子路径，作为根路径重定向目标。 */
export function firstMenuPath(menus: MenuNode[]): string {
  for (const menu of menus) {
    if (menu.children?.length) {
      const path = firstMenuPath(menu.children)
      if (path) return path
    } else {
      return menu.path
    }
  }
  return ''
}
