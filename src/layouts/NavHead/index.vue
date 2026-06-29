<template>
  <el-header height="50px" class="header flex items-center justify-between border-b-1">
    <span class="text-lg font-medium">后台管理系统</span>

    <!-- 一级导航：el-menu horizontal 模式 -->
    <el-menu
      :default-active="activeTopLevel"
      mode="horizontal"
      class="flex-1 nav-head-menu"
      @select="onNavTabSelect"
    >
      <el-menu-item v-for="item in topLevelMenus" :key="item.path" :index="item.path">
        {{ item.title }}
      </el-menu-item>
    </el-menu>

    <div class="flex items-center gap-6">
      <y-label label="租户">
        {{ tenantId || '-' }}
      </y-label>

      <y-label label="项目">
        {{ projectName || '-' }}
      </y-label>

      <!-- 多语言下拉 -->
      <y-label label="语言">
        <el-select
          v-model="currentLang"
          style="width: 100px"
          :options="langOptions"
          @change="onLangChange"
        />
      </y-label>

      <!-- 用户 -->
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { MenuNode } from '@/router/types'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// ========== 一级导航 ==========

const topLevelMenus = computed<MenuNode[]>(() => permissionStore.menuList)

const activeTopLevel = computed<string>(() => {
  const currentPath = route.path
  for (const menu of topLevelMenus.value) {
    if (currentPath === menu.path || currentPath.startsWith(`${menu.path}/`)) {
      return menu.path
    }
  }
  return topLevelMenus.value[0]?.path ?? ''
})

function onNavTabSelect(index: string): void {
  const item = topLevelMenus.value.find(m => m.path === index)
  const target = item?.children?.[0]?.path ?? index
  router.push(target)
}

// ========== 租户 & 项目 ==========

const tenantId = computed(() => localStorage.getItem('tenantId') || '')
const projectName = computed(() => {
  try {
    const raw = sessionStorage.getItem('projectObj')
    if (!raw) return ''
    const obj = JSON.parse(raw)
    return obj?.chName || ''
  } catch {
    return ''
  }
})

// ========== 多语言（UI 占位，后续接入 i18n） ==========

interface LangOption {
  label: string
  value: string
}

const langOptions: LangOption[] = [
  { label: '中文', value: 'zh-cn' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
  { label: 'العربية', value: 'ar' },
]

const currentLang = ref<string>('zh-cn')

function onLangChange(lang: string): void {
  currentLang.value = lang
  // TODO: 接入 i18n 后在此处调用 locale 切换逻辑
}

// ========== 用户操作 ==========

function onCommand(command: string) {
  if (command === 'logout') {
    userStore.logout()
    router.replace('/login')
  }
}
</script>

<style scoped lang="scss">
.header {
  flex-shrink: 0;
  box-sizing: border-box;
  height: 50px;
  border-bottom: 1px solid var(--el-border-color-light);
}

/* 一级导航菜单：扁平化 el-menu 外观，融入 header */
.nav-head-menu {
  --ep-menu-horizontal-height: 49px;

  margin-left: 24px;
  border-bottom: none !important;

  :deep(.ep-menu-item) {
    height: 50px;
    border-bottom-width: 2px;
    line-height: 50px;
  }
}

/* 租户 / 项目只读文字 */
.nav-meta {
  font-size: 13px;
  color: var(--ep-text-color-regular);
  white-space: nowrap;
}
</style>
