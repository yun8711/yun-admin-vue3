import type { RouteRecordRaw } from 'vue-router'

// 示例路由：演示模板中动态路由的组织方式。
const routes: RouteRecordRaw = {
  path: '/example',
  meta: { title: '示例页面', icon: 'i-ep-notebook' },
  children: [
    {
      path: 'list-simple',
      name: 'ExampleListSimple',
      component: () => import('@/views/examples/list/list-simple.vue'),
      meta: { title: '列表页-简单', cache: true },
    },
  ],
}

export default routes
