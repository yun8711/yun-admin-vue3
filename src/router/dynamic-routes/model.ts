import type { RouteRecordRaw } from 'vue-router'

// 数据模型路由。
const routes: RouteRecordRaw = {
  path: '/model',
  meta: { title: '数据模型', icon: 'i-ep-notebook', menuKey: 'model_manage' },
  children: [
    {
      path: 'overview',
      name: 'ModelOverview',
      component: () => import('@/views/home/index.vue'),
      meta: { title: '模型概览' },
    },
  ],
}

export default routes
