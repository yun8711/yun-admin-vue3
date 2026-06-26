<template>
  <y-app-wrap
    :page-header="{ paddingX: '0', titleTextStyle: { 'font-size': '16px' } }"
    :empty="{ image: EmptyPlaceholerImage }"
    locale="zh-cn"
  >
    <router-view />
  </y-app-wrap>
</template>

<script setup lang="ts">
import EmptyPlaceholerImage from '@/assets/images/basic/empty.png'
</script>
