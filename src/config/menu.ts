// 菜单与权限相关的运行时配置。

/**
 * 是否跳过菜单权限校验。
 * - 模板默认 true：全部异步路由可见，无需后端即可运行；
 * - 生产置 false：从后端菜单接口拉取权限并按 menuKey 过滤。
 */
export const SKIP_MENU_AUTH = import.meta.env.VITE_APP_SKIP_MENU_AUTH !== 'false'

/** 应用标题，用于浏览器标签页。 */
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Yun Admin'
