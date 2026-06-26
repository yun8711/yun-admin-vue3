<template>
  <router-view />
</template>

<script setup lang="ts">
// 透传布局：作为菜单分组的占位组件，渲染其子路由。
defineOptions({ name: 'RouteView' })
</script>
