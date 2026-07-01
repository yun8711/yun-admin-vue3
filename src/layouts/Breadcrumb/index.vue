<template>
  <el-breadcrumb
    v-show="visible"
    class="app-breadcrumb"
    separator="|"
    :style="{ height: list.length > 0 ? '40px' : '0' }"
  >
    <template v-if="list.length > 0">
      <el-breadcrumb-item
        v-for="(item, idx) in list"
        :key="item.path"
        :to="idx < list.length - 1 ? { path: item.path } : undefined"
      >
        <span v-if="idx === 0" class="breadcrumb-label">当前位置：</span>
        <span v-if="idx === list.length - 1" class="breadcrumb-current">
          {{ item.title }}
        </span>
        <span v-else class="breadcrumb-link">{{ item.title }}</span>
      </el-breadcrumb-item>
    </template>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useGlobalStore } from '@/stores/global'

defineOptions({ name: 'AppBreadcrumb' })

const route = useRoute()
const globalStore = useGlobalStore()

const list = computed(() => globalStore.breadcrumbList)

/** 是否显示：优先取 meta.breadcrumb，兜底列表长度 > 0 */
const visible = computed<boolean>(
  () => (route.meta?.breadcrumb as boolean) ?? list.value.length > 0
)
</script>

<style scoped lang="scss">
.app-breadcrumb {
  padding: 0 24px;
  font-size: 12px;
  line-height: 40px;

  .breadcrumb-label {
    color: var(--el-text-color-secondary);
  }

  .breadcrumb-link {
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .breadcrumb-current {
    cursor: text;
    color: var(--el-text-color-secondary);
  }
}
</style>
