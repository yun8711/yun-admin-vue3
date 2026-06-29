<template>
  <div class="absolute top-40% left-50% -translate-x-50% -translate-y-50%">
    <NotFound v-if="showError" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { usePermissionStore } from '@/stores/permission'

import NotFound from './components/NotFound.vue'

const permissionStore = usePermissionStore()

// 动态路由未加载完成时不渲染，避免闪烁
const showError = computed(() => permissionStore.loaded)
</script>
