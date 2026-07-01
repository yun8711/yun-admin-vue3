<template>
  <div class="page-with-header">
    <y-page-header title="无限滚动" />

    <!-- 卡片容器 -->
    <div ref="containerRef" class="card-container mt-4">
      <CardItem v-for="item in cardList" :key="item.id" :item="item" :width="cardWidth" />
    </div>

    <div v-if="loading" class="load-footer">
      <span class="load-footer-inner">
        <i class="i-ep-loading text-16 load-spin" />
        加载中...
      </span>
    </div>
    <div v-else-if="!hasMore && cardList.length > 0" class="load-footer">
      <span class="load-footer-done">没有更多了</span>
    </div>
  </div>
</template>

<script lang="ts" setup name="InfiniteScrollPage">
import { useInfiniteScroll, useResizeObserver } from '@vueuse/core'
import { computed, nextTick, onMounted, ref } from 'vue'

import { injectPageScroll } from '@/composables/usePageScroll'

import CardItem from './components/CardItem.vue'

// ========== 常量 ==========

const GAP = 16
const CARD_MAX_WIDTH = 500
const PAGE_SIZE = 30
const TOTAL_PAGES = 3

// ========== 模拟数据源 ==========

const cardList = ref<CardData[]>([])
const page = ref(0)

interface CardData {
  id: string
  collectName: string
  status: string
  collectType: string
  datasourceName: string
  lastCollectTime: string
}

function fetchPage(p: number): Promise<CardData[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const items: CardData[] = []
      const statuses = ['SUCCESS', 'RUNNING', 'FAILED', 'PENDING']
      const types = ['定时', '实时', '手动']
      const sources = ['mysql_74_3309', 'kafka_prod_cluster', 'hdfs_logs_namenode', 'clickhouse_bi']
      const names = [
        '用户行为离线同步',
        '订单数据实时采集',
        '日志归档批处理',
        '用户画像宽表同步',
        '商品类目维度表',
        '库存变更流水',
        '广告投放回传',
        '风控规则引擎',
        '客服会话归档',
        '供应链对账数据',
      ]

      for (let i = 0; i < PAGE_SIZE; i++) {
        const idx = p * PAGE_SIZE + i
        items.push({
          id: `card_${idx}`,
          collectName:
            names[idx % names.length] +
            (idx >= names.length ? ` #${Math.floor(idx / names.length) + 1}` : ''),
          status: statuses[idx % statuses.length],
          collectType: types[idx % types.length],
          datasourceName: sources[idx % sources.length],
          lastCollectTime: `2026-06-${String(28 - (idx % 28)).padStart(2, '0')} ${String((idx * 3) % 24).padStart(2, '0')}:00:00`,
        })
      }
      resolve(items)
    }, 600)
  })
}

// ========== 动态卡片宽度 ==========

const containerRef = ref<HTMLElement | null>(null)
const cardWidth = ref(300)

useResizeObserver(containerRef, entries => {
  const entry = entries[0]
  if (!entry) return
  const wrapWidth = entry.contentRect.width + GAP
  const rowNum = Math.ceil(wrapWidth / (CARD_MAX_WIDTH + GAP))
  cardWidth.value = Math.floor(wrapWidth / rowNum - GAP)
})

// ========== 无限滚动 ==========

const { scrollbarRef } = injectPageScroll()
const scrollEl = computed(() => scrollbarRef.value?.wrapRef)
const loading = ref(false)
const hasMore = computed(() => page.value < TOTAL_PAGES)

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  const items = await fetchPage(page.value)
  cardList.value.push(...items)
  page.value++
  await nextTick()
  loading.value = false
}

onMounted(() => {
  nextTick(() => loadMore())
})

useInfiniteScroll(scrollEl, loadMore, {
  distance: 200,
  direction: 'bottom',
  interval: 500,
  canLoadMore: () => hasMore.value && !loading.value,
})
</script>

<style scoped lang="scss">
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.load-footer {
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px 0;

  font-size: 13px;

  &-inner {
    display: flex;
    gap: 8px;
    align-items: center;
    color: #909399;
  }

  &-done {
    color: #c0c4cc;
  }
}

.load-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
