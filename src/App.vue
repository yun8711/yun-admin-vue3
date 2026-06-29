<template>
  <y-app-wrap
    :page-header="{ paddingX: '0', titleTextStyle: { 'font-size': '16px' } }"
    :empty="{ image: EmptyPlaceholerImage }"
    :locale="elLocaleString"
    :elp-config="{ namespace: 'ep' }"
    y-namespace="yp"
  >
    <router-view :key="viewKey" />
  </y-app-wrap>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import EmptyPlaceholerImage from '@/assets/images/basic/empty.png'
import { useLocale } from '@/composables/useLocale'
// 主应用消息通信
import { onGlobalStateChange, receiveMessage, hasProperty } from '@/composables/useQiankunActions'
import { addDynamicRoutes, resetDynamicRoutes } from '@/router'
import { finalRoute } from '@/router/constant-routes'
import { useGlobalStore } from '@/stores/global'
import { usePermissionStore } from '@/stores/permission'

const router = useRouter()
const route = useRoute()
const globalStore = useGlobalStore()
const permissionStore = usePermissionStore()

// yun-elp locale 字符串，Element Plus locale 由 y-app-wrap 内部管理
const { elLocaleString } = useLocale()

/** 租户切换后用于强制刷新 router-view */
const viewKey = ref(0)

/**
 * 租户切换时重新生成动态路由并刷新页面
 * 对标 rhea-fe 中 tenantId 变更后的 debounceReload 逻辑
 */
async function handleTenantReload(): Promise<void> {
  const routes = await permissionStore.generateRoutes()
  resetDynamicRoutes()
  addDynamicRoutes(router, routes)

  // 确保兜底路由
  try {
    router.addRoute(finalRoute)
  } catch {
    // finalRoute 可能已存在，忽略
  }

  // 尝试重定向到首页或当前路径
  const targetPath = route.path
  if (targetPath === '/404') {
    const homePath = permissionStore.homePath
    if (homePath !== '/404') {
      await router.replace(homePath)
    }
  } else {
    const routeExists = router.getRoutes().some(r => r.path === targetPath)
    if (!routeExists) {
      await router.replace('/')
    } else {
      viewKey.value += 1
    }
  }
}

onMounted(() => {
  // 监听主应用全局状态下发
  onGlobalStateChange(state => {
    // tabPrefix：浏览器标签页前缀
    if (hasProperty(state, 'tabPrefix')) {
      globalStore.setTabPrefix(receiveMessage(state, 'tabPrefix') as string)
    }

    // rhea：业务数据
    if (hasProperty(state, 'rhea')) {
      const data = receiveMessage(state, 'rhea')
      globalStore.setRheaData(data as Record<string, unknown> | null)
    }

    // sidebarStatus：侧边栏状态
    if (hasProperty(state, 'sidebarStatus')) {
      globalStore.setDefaultSidebarStatus(receiveMessage(state, 'sidebarStatus') as string)
    }

    // tenantId：租户切换，重新加载路由
    if (hasProperty(state, 'tenantId')) {
      const newTenantId = receiveMessage(state, 'tenantId') as string
      if (newTenantId && newTenantId !== globalStore.tenantId) {
        globalStore.setTenantId(newTenantId)
        handleTenantReload()
      }
    }
  }, true) // fireImmediately: 立即以当前状态执行一次
})
</script>
