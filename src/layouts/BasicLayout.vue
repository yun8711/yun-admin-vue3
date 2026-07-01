<template>
  <el-container
    class="basic-layout h-screen"
    :style="inQiankun ? { height: 'calc(100vh - 50px)' } : {}"
    direction="vertical"
  >
    <NavHead v-if="!inQiankun" />

    <!--
      Element Plus el-container 默认 flex-basis: auto 会按内容撑高，
      此处覆盖为 0 并加 min-height: 0 / overflow: hidden 确保由父级分配高度。
    -->
    <el-container class="body-container">
      <!-- 侧边栏：仅展示当前激活一级菜单的 children，visible 受 meta.sidebar 控制 -->
      <Sidebar
        v-model:collapsed="sidebarCollapsed"
        v-model:visible="sidebarVisible"
        :menu-list="sidebarMenuList"
        :active-menu="activeMenu"
      />

      <!--
        el-main 只负责 flex 布局，overflow: hidden 禁止自身滚动。
        内部 el-scrollbar 接管滚动，与侧边栏保持一致的滚动条样式。
        ref + @scroll 对接 usePageScroll，子页面可通过 inject 获取滚动状态。
      -->
      <el-main class="main" :style="{ '--ep-main-padding': 0 }">
        <el-scrollbar ref="scrollbarRef" class="main-scrollbar" always @scroll="onPageScroll">
          <AppBreadcrumb />

          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { computed, provide, ref } from 'vue'
import { useRoute } from 'vue-router'

import { usePageScroll, PAGE_SCROLL_KEY } from '@/composables/usePageScroll'
import { SIDEBAR_WIDTH_KEY } from '@/composables/useSidebarWidth'
import AppBreadcrumb from '@/layouts/Breadcrumb/index.vue'
import NavHead from '@/layouts/NavHead/index.vue'
import Sidebar from '@/layouts/Sidebar/index.vue'
import type { MenuNode } from '@/router/types'
import { useGlobalStore } from '@/stores/global'
import { usePermissionStore } from '@/stores/permission'

const inQiankun = qiankunWindow.__POWERED_BY_QIANKUN__
const route = useRoute()
const permissionStore = usePermissionStore()
const globalStore = useGlobalStore()

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 侧边栏可见性：由路由守卫 setSidebar() 写入 globalStore.sidebarStatus 控制
const sidebarVisible = computed(() => globalStore.sidebarStatus !== 'hidden')

// 侧边栏宽度（px）：与 Sidebar 组件 widths 默认值保持一致
const SIDEBAR_WIDTHS = { default: 184, fold: 54, hidden: 0 }
const sidebarWidth = computed(() => {
  if (!sidebarVisible.value) return SIDEBAR_WIDTHS.hidden
  return sidebarCollapsed.value ? SIDEBAR_WIDTHS.fold : SIDEBAR_WIDTHS.default
})

// 优先按 meta.activeMenu 高亮（下钻页归属到所属菜单）
const activeMenu = computed(() => (route.meta?.activeMenu as string) || route.path)

/** 一级菜单列表（menuList 第一层），用作顶部导航标签 */
const topLevelMenus = computed<MenuNode[]>(() => permissionStore.menuList)

/** 根据当前路由路径匹配激活的一级菜单 */
const activeTopLevel = computed<string>(() => {
  const currentPath = route.path
  for (const menu of topLevelMenus.value) {
    if (currentPath === menu.path || currentPath.startsWith(`${menu.path}/`)) {
      return menu.path
    }
  }
  return topLevelMenus.value[0]?.path ?? ''
})

/** 侧边栏菜单：仅展示当前激活一级菜单的 children */
const sidebarMenuList = computed<MenuNode[]>(() => {
  const active = topLevelMenus.value.find(m => m.path === activeTopLevel.value)
  return active?.children ?? []
})

// ========== 页面滚动 ==========

const { scrollbarRef, scrollTop, onScroll: onPageScroll, scrollToTop, scrollTo } = usePageScroll()

// 通过 provide 让子页面获取滚动实例
provide(PAGE_SCROLL_KEY, { scrollbarRef, scrollTop, scrollToTop, scrollTo })

// 通过 provide 让子页面获取侧边栏宽度，用于 y-page-footer 等固定定位组件
provide(SIDEBAR_WIDTH_KEY, sidebarWidth)

// 接受 HMR 更新，避免异步子组件首次加载时触发整页刷新
if (import.meta.hot) {
  import.meta.hot.accept()
}
</script>

<style scoped lang="scss">
.basic-layout {
  /* 内部容器：覆盖 el-container 的 flex-basis: auto，让父级 flex 分配高度 */
  .body-container {
    overflow: hidden;
    flex-basis: 0;
    min-height: 0;
  }

  .main {
    overflow: hidden;

    /* flex: 1 由 Element Plus el-main 提供，仅补 min-height: 0 防止内容撑开容器 */
    min-height: 0;
  }

  .main-scrollbar {
    height: 100%;
  }
}
</style>
