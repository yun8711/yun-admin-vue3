<template>
  <!-- 有可见子菜单：渲染为 el-sub-menu -->
  <el-sub-menu v-if="hasChild" :index="routeInfo.path" :class="levelClass">
    <template #title>
      <i v-if="level === 1 && routeInfo.icon" :class="routeInfo.icon" class="menu-icon" />
      <!-- 非一级菜单：通过 titleIndentStyle 补齐图标占位，让文字与一级菜单对齐 -->
      <span :style="titleIndentStyle">{{ routeInfo.title }}</span>
    </template>
    <SidebarItem
      v-for="child in routeInfo.children"
      :key="child.path"
      :route-info="child"
      :level="level + 1"
      :indent-map="indentMap"
      :active-menu="activeMenu"
    />
  </el-sub-menu>

  <!-- 叶子节点：渲染为 el-menu-item -->
  <el-menu-item v-else :index="routeInfo.path" :class="levelClass" :style="itemStyle">
    <i v-if="level === 1 && routeInfo.icon" :class="routeInfo.icon" class="menu-icon" />
    <span>{{ routeInfo.title }}</span>
  </el-menu-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { MenuNode } from '@/router/types'

defineOptions({ name: 'SidebarItem' })

const props = defineProps<{
  /** 菜单节点数据 */
  routeInfo: MenuNode
  /** 当前菜单层级，1 为一级菜单 */
  level: number
  /** 层级 -> 缩进 px 映射 */
  indentMap: Record<number, number>
  /** 当前激活的菜单路径 */
  activeMenu: string
}>()

/** 是否有子菜单（buildMenuList 已过滤隐藏项，此处直接判断 length） */
const hasChild = computed(() => (props.routeInfo.children?.length ?? 0) > 0)

/** 层级对应的 CSS class */
const levelClass = computed(() => `sidebar-level-${props.level}`)

/** el-menu-item 的内联缩进样式 */
const itemStyle = computed(() => {
  const padding = props.indentMap[props.level]
  if (padding == null) return undefined
  return { paddingLeft: `${padding}px` }
})

// el-sub-menu__title 基础 padding 为 16px；
// 一级菜单文字靠图标自然撑开，无需额外偏移；
// 二级及以上需补齐图标占位，让文字起始位置与一级对齐。
const BASE_TITLE_PADDING = 16

/** el-sub-menu 标题文字的额外左偏移（仅 level > 1 生效） */
const titleIndentStyle = computed(() => {
  if (props.level === 1) return undefined
  const target = props.indentMap[props.level]
  if (target == null) return undefined
  return { paddingLeft: `${target - BASE_TITLE_PADDING}px` }
})
</script>

<style scoped lang="scss">
.menu-icon {
  margin-inline-end: 8px;
  font-size: 18px;
}
</style>
