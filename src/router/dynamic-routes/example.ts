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
    {
      path: 'i18n-demo',
      name: 'I18nDemo',
      component: () => import('@/views/examples/i18n-demo/index.vue'),
      meta: { title: '国际化示例' },
    },
  ],
}

export default routes
