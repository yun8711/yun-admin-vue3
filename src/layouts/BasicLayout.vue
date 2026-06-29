<template>
  <el-container
    class="basic-layout h-screen"
    :style="inQiankun ? { height: 'calc(100vh - 50px)' } : {}"
    direction="vertical"
  >
    <NavHead v-if="!inQiankun" />

    <el-container>
      <!-- 侧边栏：仅展示当前激活一级菜单的 children，visible 受 meta.sidebar 控制 -->
      <Sidebar
        v-model:collapsed="sidebarCollapsed"
        v-model:visible="sidebarVisible"
        :menu-list="sidebarMenuList"
        :active-menu="activeMenu"
      />

      <el-main class="main overflow-auto" :style="{ '--ep-main-padding': 0 }">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

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
</script>

<style scoped lang="scss">
.basic-layout {
  .main {
    height: 100%;
  }
}
</style>
