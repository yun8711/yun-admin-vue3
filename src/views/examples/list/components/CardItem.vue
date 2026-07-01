<template>
  <div class="card-item" :style="{ width: width + 'px' }">
    <div class="card-header">
      <span class="card-name">{{ item.collectName }}</span>
      <span class="card-status" :style="statusStyle">{{ statusText }}</span>
    </div>
    <div class="card-body">
      <div class="card-row">
        <span class="card-label">采集方式</span>
        <span>{{ item.collectType }}</span>
      </div>
      <div class="card-row">
        <span class="card-label">数据源</span>
        <span>{{ item.datasourceName }}</span>
      </div>
      <div class="card-row">
        <span class="card-label">上次采集</span>
        <span>{{ item.lastCollectTime }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface CardItemData {
  id: string
  collectName: string
  status: string
  collectType: string
  datasourceName: string
  lastCollectTime: string
}

const props = defineProps<{
  item: CardItemData
  width: number
}>()

// ========== 状态映射 ==========

const statusColorMap: Record<string, string> = {
  SUCCESS: '#52c41a',
  RUNNING: '#1677ff',
  FAILED: '#ff4d4f',
  PENDING: '#faad14',
}
const statusTextMap: Record<string, string> = {
  SUCCESS: '成功',
  RUNNING: '运行中',
  FAILED: '失败',
  PENDING: '等待中',
}

const statusStyle = computed(() => {
  const color = statusColorMap[props.item.status] || '#999'
  return { color, borderColor: color }
})

const statusText = computed(() => statusTextMap[props.item.status] || props.item.status)
</script>

<style scoped lang="scss">
.card-item {
  display: flex;
  flex-direction: column;
  gap: 16px;

  box-sizing: border-box;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;

  background: #fff;

  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 12px rgb(0 0 0 / 6%);
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-name {
  overflow: hidden;
  flex: 1;

  margin-right: 8px;

  font-size: 16px;
  font-weight: 600;
  color: #303133;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-status {
  flex-shrink: 0;

  padding: 3px 10px;
  border: 1px solid;
  border-radius: 4px;

  font-size: 13px;
  white-space: nowrap;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
}

.card-label {
  color: #909399;
}
</style>
