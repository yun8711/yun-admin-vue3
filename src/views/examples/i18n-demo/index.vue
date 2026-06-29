<template>
  <div class="page-with-header">
    <y-page-header />

    <el-alert type="info" :closable="false" class="mb-4">
      {{ t('通过顶部语言下拉切换语言，下方内容会实时更新') }}
    </el-alert>

    <!-- 1. 基础翻译 -->
    <el-card class="mb-4" shadow="never">
      <template #header>
        <span class="font-medium">{{ t('基础翻译') }}</span>
      </template>
      <p class="text-sm text-gray-500 mb-2">{{ t('直接调用 t() 函数进行文本翻译') }}</p>
      <el-tag>{{ t('你好，世界！') }}</el-tag>
    </el-card>

    <!-- 2. 变量插值 -->
    <el-card class="mb-4" shadow="never">
      <template #header>
        <span class="font-medium">{{ t('变量插值') }}</span>
      </template>
      <p class="text-sm text-gray-500 mb-2">
        t('你好，{"{name}"}！', {"{"} name: 'VoerkaI18n' {"}"})
      </p>
      <el-tag>{{ t('你好，{name}！', { name: 'VoerkaI18n' }) }}</el-tag>
    </el-card>

    <!-- 3. 复数形式 -->
    <el-card class="mb-4" shadow="never">
      <template #header>
        <span class="font-medium">{{ t('复数形式') }}</span>
      </template>
      <p class="text-sm text-gray-500 mb-2">
        {{ t('当前计数：{count}', { count }) }}
      </p>
      <div class="flex items-center gap-4 mb-2">
        <el-button size="small" @click="count = Math.max(0, count - 1)">-</el-button>
        <span class="font-bold">{{ count }}</span>
        <el-button size="small" @click="count++">+</el-button>
      </div>
      <el-tag>{{ count === 0 ? t('无消息') : t('{count} 条消息', { count }) }}</el-tag>
    </el-card>

    <!-- 4. Translate 组件 -->
    <el-card class="mb-4" shadow="never">
      <template #header>
        <span class="font-medium">{{ t('组件用法') }}</span>
      </template>
      <p class="text-sm text-gray-500 mb-2">{{ t('使用 Translate 组件进行翻译') }}</p>
      <el-tag>{{ t('Translate 组件示例') }}</el-tag>
    </el-card>

    <!-- 5. 当前语言信息 -->
    <el-card class="mb-4" shadow="never">
      <template #header>
        <span class="font-medium">{{ t('当前语言信息') }}</span>
      </template>
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item :label="t('当前语言：{lang}', { lang: '' }).replace(': ', '')">
          {{ activeLanguage }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('可用语言：')">
          {{ languages.map(l => `${l.name}(${l.title})`).join(' / ') }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="I18nDemoPage">
import { useVoerkaI18n } from '@voerkai18n/vue'
import { ref } from 'vue'

import { useLocale } from '@/composables/useLocale'

const { t } = useVoerkaI18n()
const { activeLanguage, languages } = useLocale()

// 复数示例计数器
const count = ref(3)
</script>
