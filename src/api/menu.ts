import type { AuthMenu } from '@/router/types'
import { request } from '@/utils'

// 获取当前用户可访问的菜单/权限路由表（按 menuKey 与前端动态路由匹配）。
export function getRouteList() {
  // 响应拦截已按 resPath 解包，这里第二个泛型即最终返回数据类型。
  return request.get<AuthMenu[], AuthMenu[]>('/auth/menus')
}
