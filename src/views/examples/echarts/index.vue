<template>
  <div class="page-with-header">
    <y-page-header title="ECharts 图表" />

    <el-row :gutter="16" class="chart-grid">
      <!-- 折线图：趋势数据 -->
      <el-col :xs="24" :md="12" class="chart-col">
        <el-card shadow="never">
          <template #header>
            <span class="chart-title">月度访问趋势</span>
          </template>
          <y-echarts
            :option="lineOption"
            :loading="lineLoading"
            :config="lineConfig"
            class="chart-box"
          />
        </el-card>
      </el-col>

      <!-- 柱状图：对比数据 -->
      <el-col :xs="24" :md="12" class="chart-col">
        <el-card shadow="never">
          <template #header>
            <span class="chart-title">各产品线营收对比</span>
          </template>
          <y-echarts
            :option="barOption"
            :loading="barLoading"
            :config="barConfig"
            class="chart-box"
          />
        </el-card>
      </el-col>

      <!-- 饼图：占比数据 -->
      <el-col :xs="24" :md="12" class="chart-col">
        <el-card shadow="never">
          <template #header>
            <span class="chart-title">流量来源分布</span>
          </template>
          <y-echarts
            :option="pieOption"
            :loading="pieLoading"
            :config="pieConfig"
            class="chart-box"
          />
        </el-card>
      </el-col>

      <!-- 散点图：分布数据 -->
      <el-col :xs="24" :md="12" class="chart-col">
        <el-card shadow="never">
          <template #header>
            <span class="chart-title">用户活跃度分布</span>
          </template>
          <y-echarts
            :option="scatterOption"
            :loading="scatterLoading"
            :config="scatterConfig"
            class="chart-box"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup name="EchartsPage">
import type { EChartsOption } from 'echarts'
import { onMounted, ref } from 'vue'

// ========== 按需加载配置 ==========
// y-echarts 通过 config.chartTypes / config.components 声明所需 ECharts 模块，
// EchartsLoader 是单例，相同模块只会加载一次。

const lineConfig = {
  chartTypes: ['LineChart'],
  components: ['GridComponent', 'TooltipComponent', 'LegendComponent'],
  renderers: ['CanvasRenderer'],
}

const barConfig = {
  chartTypes: ['BarChart'],
  components: ['GridComponent', 'TooltipComponent', 'LegendComponent'],
  renderers: ['CanvasRenderer'],
}

const pieConfig = {
  chartTypes: ['PieChart'],
  components: ['TooltipComponent', 'LegendComponent'],
  renderers: ['CanvasRenderer'],
}

const scatterConfig = {
  chartTypes: ['ScatterChart'],
  components: ['GridComponent', 'TooltipComponent'],
  renderers: ['CanvasRenderer'],
}

// ========== 加载状态 ==========

const lineLoading = ref(true)
const barLoading = ref(true)
const pieLoading = ref(true)
const scatterLoading = ref(true)

// ========== 图表配置 ==========

const lineOption = ref<EChartsOption>({})
const barOption = ref<EChartsOption>({})
const pieOption = ref<EChartsOption>({})
const scatterOption = ref<EChartsOption>({})

// ========== 模拟异步数据 ==========

/** 模拟折线图数据：近12个月访问量趋势 */
async function fetchLineData(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      const months = [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
      ]
      lineOption.value = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['PV', 'UV'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '12%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: months, boundaryGap: false },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'PV',
            type: 'line',
            smooth: true,
            data: [8200, 9300, 7500, 11000, 12500, 13800, 14200, 15600, 13200, 14800, 16200, 17500],
          },
          {
            name: 'UV',
            type: 'line',
            smooth: true,
            data: [2800, 3200, 2600, 4100, 4800, 5200, 5400, 6100, 4900, 5600, 6300, 7100],
          },
        ],
      }
      lineLoading.value = false
      resolve()
    }, 600)
  })
}

/** 模拟柱状图数据：各产品线季度营收 */
async function fetchBarData(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      barOption.value = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['Q1', 'Q2'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '12%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: ['产品A', '产品B', '产品C', '产品D', '产品E'] },
        yAxis: { type: 'value', axisLabel: { formatter: '{value} 万' } },
        series: [
          { name: 'Q1', type: 'bar', data: [320, 280, 450, 180, 500], barGap: '20%' },
          { name: 'Q2', type: 'bar', data: [380, 320, 520, 220, 560], barGap: '20%' },
        ],
      }
      barLoading.value = false
      resolve()
    }, 800)
  })
}

/** 模拟饼图数据：流量来源占比 */
async function fetchPieData(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      pieOption.value = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: '5%', top: 'center' },
        series: [
          {
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
            label: { show: false },
            data: [
              { value: 4800, name: '搜索引擎' },
              { value: 3200, name: '直接访问' },
              { value: 2100, name: '社交媒体' },
              { value: 1500, name: '外部链接' },
              { value: 900, name: '邮件营销' },
            ],
          },
        ],
      }
      pieLoading.value = false
      resolve()
    }, 500)
  })
}

/** 模拟散点图数据：用户活跃天数 vs 日均使用时长 */
async function fetchScatterData(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      scatterOption.value = {
        tooltip: {
          trigger: 'item',
          formatter(params: unknown) {
            const p = params as { value: [number, number] }
            return `活跃天数: ${p.value[0]} 天<br/>日均时长: ${p.value[1]} 分钟`
          },
        },
        grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
        xAxis: { type: 'value', name: '月活跃天数', min: 0, max: 30 },
        yAxis: { type: 'value', name: '日均时长(分钟)', min: 0, max: 120 },
        series: [
          {
            type: 'scatter',
            symbolSize: 10,
            data: [
              [3, 8],
              [5, 12],
              [7, 18],
              [10, 25],
              [12, 30],
              [14, 35],
              [16, 42],
              [18, 50],
              [20, 55],
              [22, 60],
              [24, 70],
              [25, 65],
              [26, 78],
              [27, 82],
              [28, 85],
              [28, 92],
              [29, 88],
              [29, 95],
              [30, 100],
              [30, 110],
            ],
          },
        ],
      }
      scatterLoading.value = false
      resolve()
    }, 1000)
  })
}

// ========== 生命周期 ==========

onMounted(() => {
  // 各图表独立异步加载，模拟实际业务中多个接口并发
  fetchLineData()
  fetchBarData()
  fetchPieData()
  fetchScatterData()
})
</script>

<style scoped lang="scss">
.chart-grid {
  margin-top: 4px;
}

.chart-col {
  margin-bottom: 16px;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.chart-box {
  width: 100%;
  height: 360px;
}
</style>
