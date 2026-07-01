import type { RouteRecordRaw } from 'vue-router'

// 示例路由：演示模板中动态路由的组织方式。
const routes: RouteRecordRaw = {
  path: '/example',
  meta: { title: '示例页面' },
  children: [
    {
      path: 'list',
      name: 'ExampleCrud',
      component: () => import('@/views/examples/list/simple.vue'),
      meta: { title: '增删改查', icon: 'i-ep-notebook' },
    },
    {
      path: 'infinite-scroll',
      name: 'ExampleInfiniteScroll',
      component: () => import('@/views/examples/list/infinite-scroll.vue'),
      meta: { title: '无限滚动', icon: 'i-ep-notebook' },
    },
    {
      path: 'detail',
      name: 'ExampleDetail',
      component: () => import('@/views/examples/detail/index.vue'),
      meta: { title: '详情页', parent: 'ExampleCrud', hidden: true },
    },
    {
      path: 'edit',
      name: 'ExampleForm',
      component: () => import('@/views/examples/edit/index.vue'),
      meta: { title: '编辑页', parent: 'ExampleCrud', hidden: true },
    },
    {
      path: 'i18n-demo',
      name: 'I18nDemo',
      component: () => import('@/views/examples/i18n-demo/index.vue'),
      meta: { title: '国际化示例', icon: 'i-ep-notebook' },
    },
    {
      path: 'echarts',
      name: 'ExampleEcharts',
      component: () => import('@/views/examples/echarts/index.vue'),
      meta: { title: 'ECharts 图表', icon: 'i-ep-data-analysis' },
    },
  ],
}

export default routes
