import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordName } from 'vue-router'

/** 面包屑节点 */
export interface BreadcrumbItem {
  path: string
  title: string
}

/**
 * 存储主应用通过 qiankun 全局状态下发的配置，
 * 以及路由守卫衍生的运行时状态（侧边栏、缓存、面包屑）。
 */
export const useGlobalStore = defineStore('global', () => {
  // ---- 主应用下发 ----
  /** 浏览器标签页前缀（主应用下发） */
  const tabPrefix = ref('')
  /** 当前租户 ID（主应用下发），变更时触发路由重载 */
  const tenantId = ref('')
  /** 侧边栏初始状态（主应用下发） */
  const defaultSidebarStatus = ref('default')
  /** 主应用下发的 rhea 相关数据 */
  const rheaData = ref<Record<string, unknown> | null>(null)

  // ---- 路由守卫衍生 ----
  /** 当前侧边栏状态（路由切换时按 meta.sidebar 或 defaultSidebarStatus 决定） */
  const sidebarStatus = ref('default')
  /** 面包屑列表 */
  const breadcrumbList = ref<BreadcrumbItem[]>([])
  /** keep-alive 缓存的页面 name 集合 */
  const cachedViews = ref<RouteRecordName[]>([])

  // ---- 主应用下发 setter ----
  function setTabPrefix(value: string): void {
    tabPrefix.value = value
  }
  function setTenantId(value: string): void {
    tenantId.value = value
  }
  function setDefaultSidebarStatus(value: string): void {
    defaultSidebarStatus.value = value
  }
  function setRheaData(value: Record<string, unknown> | null): void {
    rheaData.value = value
  }

  // ---- 侧边栏 ----
  function setSidebarStatus(value: string): void {
    sidebarStatus.value = value
  }

  // ---- 面包屑 ----
  function setBreadcrumbList(value: BreadcrumbItem[]): void {
    breadcrumbList.value = value
  }

  // ---- keep-alive 缓存 ----
  /** 添加页面到缓存列表 */
  function addCachedView(name: RouteRecordName | undefined): void {
    if (name && !cachedViews.value.includes(name)) {
      cachedViews.value.push(name)
    }
  }
  /** 清除所有缓存页面 */
  function clearCachedViews(): void {
    cachedViews.value = []
  }
  /** 删除指定缓存页面 */
  function removeCachedView(name: RouteRecordName | undefined): void {
    if (!name) return
    const idx = cachedViews.value.indexOf(name)
    if (idx !== -1) cachedViews.value.splice(idx, 1)
  }

  return {
    tabPrefix,
    tenantId,
    defaultSidebarStatus,
    rheaData,
    sidebarStatus,
    breadcrumbList,
    cachedViews,
    setTabPrefix,
    setTenantId,
    setDefaultSidebarStatus,
    setRheaData,
    setSidebarStatus,
    setBreadcrumbList,
    addCachedView,
    clearCachedViews,
    removeCachedView,
  }
})
