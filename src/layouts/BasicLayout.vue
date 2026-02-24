<template>
  <el-container class="basic-layout h-screen">
    <el-aside width="220px" class="aside">
      <div class="logo p-4 text-center font-bold text-primary">Yun Admin</div>
      <el-menu
        :default-active="activeMenu"
        router
        class="border-r-0"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container direction="vertical">
      <el-header class="header flex items-center justify-between">
        <span class="text-lg font-medium">后台管理系统</span>
        <div class="flex items-center gap-2">
          <el-dropdown>
            <span class="el-dropdown-link cursor-pointer">
              用户 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main bg-gray-100 p-4 overflow-auto">
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
import { useRoute } from 'vue-router'
import { House, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.aside {
  background-color: #304156;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
