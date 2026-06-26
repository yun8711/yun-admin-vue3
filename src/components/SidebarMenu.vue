<template>
  <template v-for="item in menus" :key="item.path">
    <el-sub-menu v-if="item.children?.length" :index="item.path">
      <template #title>
        <i v-if="item.icon" :class="item.icon" class="menu-icon" />
        <span>{{ item.title }}</span>
      </template>
      <sidebar-menu :menus="item.children" />
    </el-sub-menu>
    <el-menu-item v-else :index="item.path">
      <i v-if="item.icon" :class="item.icon" class="menu-icon" />
      <span>{{ item.title }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import type { MenuNode } from '@/router/types'

// 递归侧边栏菜单：分组渲染为 el-sub-menu，叶子渲染为 el-menu-item。
defineOptions({ name: 'SidebarMenu' })
defineProps<{ menus: MenuNode[] }>()
</script>

<style scoped lang="scss">
.menu-icon {
  margin-right: 8px;
  font-size: 18px;
}
</style>
