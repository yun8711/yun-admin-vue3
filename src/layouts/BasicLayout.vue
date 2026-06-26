<template>
  <el-container class="basic-layout h-screen">
    <el-header height="50px" class="header flex items-center justify-between border-b-1">
      <div class="flex items-center gap-2">
        <i
          class="text-20 cursor-pointer"
          :class="sidebarCollapsed ? 'i-ep-expand' : 'i-ep-fold'"
          @click="sidebarCollapsed = !sidebarCollapsed"
        />
        <span class="text-lg font-medium">后台管理系统</span>
      </div>

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
      <!-- 侧边栏 -->
      <Sidebar
        v-model:collapsed="sidebarCollapsed"
        :menu-list="permissionStore.menuList"
        :active-menu="activeMenu"
      />

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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Sidebar from '@/layouts/Sidebar/index.vue'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 优先按 meta.activeMenu 高亮（下钻页归属到所属菜单）
const activeMenu = computed(() => (route.meta?.activeMenu as string) || route.path)

function onCommand(command: string) {
  if (command === 'logout') {
    userStore.logout()
    router.replace('/login')
  }
}
</script>

<style scoped lang="scss">
.basic-layout {
  .header {
    flex-shrink: 0;
    box-sizing: border-box;
    height: 50px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .main {
    height: 100%;
  }
}
</style>
