<template>
  <div class="error-page flex flex-col items-center justify-center text-center">
    <div class="text-8xl font-bold text-gray-300">404</div>
    <p class="mt-4 text-gray-500">页面不存在</p>
    <el-button type="primary" class="mt-6" @click="goHome"> 返回首页 </el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => router.push('/')
</script>
