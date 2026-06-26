import type { RouteRecordRaw } from 'vue-router'

// 示例路由：演示模板中动态路由的组织方式。
const exampleRoutes: RouteRecordRaw = {
  path: 'example',
  meta: { title: '示例页面', icon: 'i-ep-notebook', menuKey: 'system', serialNum: 10 },
  children: [
    {
      path: 'list-simple',
      name: 'SystemUser',
      component: () => import('@/views/examples/list/list-simple.vue'),
      meta: { title: '列表页-简单', menuKey: 'system_user', serialNum: 1, cache: true },
    },
  ],
}

export default exampleRoutes
