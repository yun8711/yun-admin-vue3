<template>
  <aside class="sidebar" :style="sidebarStyle">
    <template v-if="visible">
      <el-scrollbar class="sidebar-scrollbar">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapsed"
          :collapse-transition="false"
          class="sidebar-menu"
          @select="onSelect"
        >
          <SidebarItem
            v-for="item in menuList"
            :key="item.path"
            :route-info="item"
            :level="1"
            :indent-map="mergedIndentMap"
            :active-menu="activeMenu"
          />
        </el-menu>
      </el-scrollbar>

      <!-- 底部折叠/展开按钮 -->
      <div class="sidebar-footer" @click="toggle">
        <i :class="isCollapsed ? 'i-ep-expand' : 'i-ep-fold'" class="text-16" />
        <span v-show="!isCollapsed" class="sidebar-footer-text">收起菜单</span>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import type { MenuNode } from '@/router/types'

import SidebarItem from './SidebarItem.vue'

defineOptions({ name: 'AppSidebar' })

const props = withDefaults(
  defineProps<{
    /** 侧边栏菜单数据 */
    menuList: MenuNode[]
    /** 当前激活的菜单路径 */
    activeMenu: string
    /** 是否折叠 */
    collapsed?: boolean
    /** 是否可见（false 时完全隐藏） */
    visible?: boolean
    /** 展开 / 折叠 / 隐藏 对应的宽度，单位 px */
    widths?: { default: number; fold: number; hidden: number }
    /**
     * 层级 -> 左侧缩进值（单位为 px）
     * 默认值已考虑一级图标占位（图标宽 18px + 间距 8px = 26px），
     * 使子菜单文字与一级菜单文字视觉左对齐。
     */
    indentMap?: Record<number, number>
  }>(),
  {
    collapsed: false,
    visible: true,
    widths: () => ({ default: 184, fold: 54, hidden: 0 }),
    // 一级 16px（基础 padding），二级 42px（= 16 + 18 图标 + 8 间距），三级 54px
    indentMap: () => ({ 1: 16, 2: 42, 3: 54 }),
  }
)

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  'update:visible': [value: boolean]
}>()

const router = useRouter()

// 合并默认层级缩进与用户传入的缩进覆盖
const mergedIndentMap = computed<Record<number, number>>(() => {
  return { 1: 16, 2: 42, 3: 54, ...props.indentMap }
})

// el-menu 的 collapse 属性：折叠时收起
const isCollapsed = computed(() => props.collapsed)

// 根据当前状态计算侧边栏宽度
const sidebarStyle = computed(() => {
  const w = props.widths
  if (!props.visible) {
    return { width: `${w.hidden}px` }
  }
  return { width: `${props.collapsed ? w.fold : w.default}px` }
})

/** 切换折叠状态 */
function toggle(): void {
  emit('update:collapsed', !props.collapsed)
}

/** 编程式折叠 */
function collapse(): void {
  emit('update:collapsed', true)
}

/** 编程式展开 */
function expand(): void {
  emit('update:collapsed', false)
}

/** 编程式隐藏 */
function hide(): void {
  emit('update:visible', false)
}

/** 编程式显示 */
function show(): void {
  emit('update:visible', true)
}

/** 菜单选中回调 */
function onSelect(index: string): void {
  // 外部链接跳转
  if (/^(https?:)?\/\//.test(index)) {
    window.open(index, '_blank')
    return
  }
  router.push(index)
}

defineExpose({ toggle, collapse, expand, hide, show })
</script>

<style scoped lang="scss">
.sidebar {
  overflow: hidden;
  flex-shrink: 0;

  box-sizing: border-box;
  height: 100%;
  border-right: 1px solid var(--sidebar-border, var(--el-border-color-light));

  transition: width 0.2s;
}

.sidebar-scrollbar {
  width: 100%;
  height: calc(100% - 56px);

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
}

.sidebar-menu {
  border-right-width: 0;
}

// 菜单项公共样式
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 50px;
  padding: 0 16px;
  line-height: 50px;

  &:hover {
    background-color: var(--sidebar-hover, rgb(255 255 255 / 6%));
  }
}

// 子菜单激活时，父级菜单标题高亮
:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: var(--el-menu-active-color) !important;
}

// 折叠模式下 el-menu-item 图标居中
:deep(.el-menu--collapse) {
  width: v-bind('`${props.widths.fold}px`');

  .el-menu-item .el-tooltip {
    padding: 0 16px !important;
  }
}

// 侧边栏底部切换按钮
.sidebar-footer {
  cursor: pointer;

  display: flex;
  align-items: center;

  box-sizing: border-box;
  height: 56px;
  padding: 8px 16px;
  border-top: 1px solid var(--sidebar-border, var(--el-border-color-light));

  transition: background-color 0.2s;

  &:hover {
    background-color: var(--sidebar-hover, rgb(255 255 255 / 6%));
  }

  &-text {
    overflow: hidden;

    margin-left: 8px;

    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
