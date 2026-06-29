<template>
  <div class="flex flex-col items-center">
    <img src="@/assets/images/error/401.webp" alt="401">
    <p class="mt-4 text-14 text-center" style="color: var(--ep-text-color-regular)">
      {{ t('没有访问权限') }}
    </p>
    <div class="mt-4 text-center">
      <el-button type="primary" class="w-[88px]" @click="goHome">{{ t('返回首页') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVoerkaI18n } from '@voerkai18n/vue'
import { useRouter } from 'vue-router'

const { t } = useVoerkaI18n()
const router = useRouter()

function goHome() {
  router.push('/')
}
</script>
