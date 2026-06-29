import type { RouteRecordRaw } from 'vue-router'

// 首页路由：作为子应用默认入口。
const routes: RouteRecordRaw = {
  path: '/home',
  meta: { title: '首页', icon: 'i-ep-notebook', serialNum: 10 },
  children: [
    {
      path: 'index',
      name: 'HomeIndex',
      component: () => import('@/views/home/index.vue'),
      meta: { title: '首页', serialNum: 1, sidebar: 'hidden' },
    },
  ],
}

export default routes
