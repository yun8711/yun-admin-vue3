<template>
  <el-container class="basic-layout h-screen">
    <el-header height="50px" class="header flex items-center justify-between border-b-1">
      <span class="text-lg font-medium">后台管理系统</span>
      <div class="flex items-center gap-2">
        <el-dropdown @command="onCommand">
          <span class="el-dropdown-link cursor-pointer">
            {{ userStore.username || '用户' }}
            <i class="i-ep-arrow-down" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside width="220px" class="aside">
        <el-menu
          :default-active="activeMenu"
          router
          class="border-r-0"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
        >
          <SidebarMenu :menus="permissionStore.menuList" />
        </el-menu>
      </el-aside>

      <el-main class="main overflow-auto" :style="{ '--el-main-padding': 0 }">
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import SidebarMenu from '@/components/SidebarMenu.vue'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// 优先按 meta.activeMenu 高亮（下钻页归属到所属菜单）。
const activeMenu = computed(() => route.meta?.activeMenu || route.path)

function onCommand(command: string) {
  if (command === 'logout') {
    // 清空登录态，守卫会负责重置权限与动态路由。
    userStore.logout()
    router.replace('/login')
  }
}
</script>

<style scoped lang="scss">
.basic-layout {
  .header {
    box-sizing: border-box;
    height: 50px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .main {
    height: 100%;
  }
}

// .aside {
//   background-color: #304156;
// }

// .header {
//   background: #fff;
//   box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
// }

// .fade-enter-active,
// .fade-leave-active {
//   transition: opacity 0.2s ease;
// }

// .fade-enter-from,
// .fade-leave-to {
//   opacity: 0;
// }
</style>
