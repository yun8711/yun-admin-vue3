<template>
  <div class="flex flex-col items-center">
    <img src="@/assets/images/error/404.webp" alt="404">
    <p class="mt-4 text-14 text-center" style="color: var(--ep-text-color-regular)">
      {{ t('抱歉，页面走丢了') }}
    </p>
    <div class="mt-4 text-center">
      <el-button type="primary" class="w-[88px]" @click="goHome">{{ t('返回首页') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { t } from '@/languages'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>
