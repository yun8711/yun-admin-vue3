// 后端返回的菜单/权限节点结构（用 menuKey 作为唯一标识与前端路由匹配）。
export interface AuthButton {
  /** 按钮级权限标识，兼容后端两种命名 */
  action_mode?: string
  actionMode?: string
  [key: string]: unknown
}

export interface AuthMenu {
  /** 路由唯一标识；前端路由含 menuKey 的需要被后端控制 */
  menuKey: string
  /** 菜单标题，菜单节点会用它覆盖本地 title */
  name: string
  /** 排序，值越小越靠前 */
  serialNum?: number
  /** 外链地址，存在时直接作为路由 path */
  externalUrl?: string | null
  /** 页面内按钮级权限 */
  btnList?: AuthButton[]
  permissionTypes?: string[]
  children?: AuthMenu[]
  [key: string]: unknown
}

// 侧边栏菜单节点：由生成后的路由派生，path 为解析后的完整路径。
export interface MenuNode {
  path: string
  title: string
  icon?: string
  children?: MenuNode[]
}

// 扩展 vue-router 的 RouteMeta 类型，使动态路由的 meta 拥有类型提示。
declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题 */
    title?: string
    /** 权限标识；无则该路由始终可用 */
    menuKey?: string
    /** UnoCSS 图标类名，例如 i-ep-setting */
    icon?: string
    /** 是否在侧边栏隐藏 */
    hidden?: boolean
    /** 是否为菜单页（默认取 !hidden） */
    isMenu?: boolean
    /** 高亮的菜单路径（下钻页常用） */
    activeMenu?: string
    /** 父级路由 name（下钻页归属） */
    parent?: string
    /** 侧边栏状态 */
    sidebar?: string
    /** 是否显示面包屑 */
    breadcrumb?: boolean
    /** 是否 keep-alive 缓存 */
    cache?: boolean
    /** 是否免登录/免权限 */
    noAuth?: boolean
    /** 页面内按钮权限 */
    btnList?: AuthButton[]
    /** 排序 */
    serialNum?: number
  }
}
