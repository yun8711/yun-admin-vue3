<template>
  <div class="page">
    <div class="home-card">
      <div class="home-icon">
        <i class="i-fill-logo text-48" />
      </div>
      <h2 class="home-title">欢迎使用 Yun Admin</h2>
      <p class="home-desc">基于 Vue 3 + Element Plus + yun-elp 的后台管理模板</p>
      <div class="home-links">
        <el-link
          v-for="link in links"
          :key="link.to"
          :href="link.to"
          :underline="false"
          target="_blank"
          class="home-link"
        >
          <i :class="link.icon" class="text-16" />
          <span>{{ link.label }}</span>
        </el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="HomePage">
const links = [
  {
    label: 'Element Plus',
    icon: 'i-ep-element-plus',
    to: 'https://element-plus.org/',
  },
  {
    label: 'yun-elp',
    icon: 'i-ep-link',
    to: 'https://yun8711.github.io/yun-elp/',
  },
  {
    label: '项目文档',
    icon: 'i-ep-document',
    to: '/docs',
  },
]
</script>

<style scoped lang="scss">
.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 80px 0;

  text-align: center;
}

.home-icon {
  margin-bottom: 24px;
  color: var(--el-color-primary);
  opacity: 0.8;
}

.home-title {
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.home-desc {
  margin-bottom: 32px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.home-links {
  display: flex;
  gap: 24px;
}

.home-link {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 14px;
}
</style>
