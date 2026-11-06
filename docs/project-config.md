# 项目配置入口速查

只列"功能点对应的配置入口"。

## 项目配置

配置写在 `vite.custom.ts`，分成 `appConfig` 和 `requestConfig`。

`appConfig`：

- 后端地址：`host`（开发代理目标）
- 前端端口：`port`
- 静态资源路径：`base`
- 应用名：`name`
- 浏览器标签页标题：`title`
- 跳过菜单权限：`skipMenuAuth`（非生产环境为 true）

`requestConfig`：

- 接口基础地址：`baseURL`
- 成功响应取值路径：`resPath`
- 失败响应取值路径：`errorPath`
- 超时：`timeout`
- 统一前缀：`apiPrefix`
- 多后端前缀：`apiPrefixes`（`{ prefix, port? }`，`port` 为空时用 `appConfig.host`）
- 开发代理后缀：`devProxySuffix`

## 请求层

- 请求默认值：`vite.custom.ts` -> `requestConfig`
- 请求 URL 前缀解析：`src/utils/request-url.ts` -> `resolveRequestUrl`
- axios 实例与拦截器：`src/utils/request.ts`、`src/utils/request2.ts`
- token 注入：请求拦截器
- 401 处理：响应拦截器
- 下载能力（blob）：`downloadBlob`
- 可取消请求：`abort`；取消全部在途请求：`request2.ts` -> `cancelPendingRequests`

### 多后端代理

同一前端要访问多个后端时，`vite.custom.ts`、Vite proxy、请求拦截器读同一份 `apiPrefixes`。

```ts
appConfig.host = 'http://10.10.10.10:8080'
requestConfig.devProxySuffix = '_dev'
requestConfig.apiPrefixes = [
  { prefix: '/rhea' },
  { prefix: '/indicator', port: '8015' },
]
```

| 层级 | 入口 | 职责 |
| --- | --- | --- |
| 配置 | `vite.custom.ts` | 后端地址、前缀、代理后缀 |
| 构建 | `vite.config.ts` -> `buildPrefixProxy()` | 生成 `/rhea_dev` → `host/rhea` |
| 运行时 | `src/utils/request-url.ts` -> `resolveRequestUrl()` | 补默认前缀；开发环境追加后缀 |

**运行时链路示例（开发环境）：**

```
请求 /daas/api/query
  ↓ resolveRequestUrl()
  匹配到前缀 /daas（在 apiPrefixes 中）
  dev 下追加后缀 _dev → /daas_dev/api/query
  ↓ Vite proxy
  命中 /daas_dev 代理规则
  rewrite: /daas_dev → /daas
  ↓ 转发到后端
  http://192.168.122.130/daas/api/query
```

**独立端口场景：**

```
requestConfig.apiPrefixes = [{ prefix: '/rhea' }, { prefix: '/indicator', port: '8015' }]
appConfig.host = 'http://192.168.122.130'

请求 /indicator/metrics
  ↓ resolveRequestUrl → /indicator_dev/metrics
  ↓ Vite proxy /indicator_dev → http://192.168.122.130:8015/indicator
```

**未匹配前缀兜底：**

```
请求 /api/xxx（不在 apiPrefixes 列表内）
  ↓ resolveRequestUrl()
  前缀 /api 不在列表，自动补第一个前缀 → /rhea/api/xxx
  dev 下追加后缀 → /rhea_dev/api/xxx
  ↓ Vite proxy /rhea_dev → host/rhea/api/xxx
```

**生产环境行为：**

生产环境无 Vite proxy，仅走 `resolveRequestUrl()` 的前缀匹配与默认前缀补齐逻辑，不追加 `_dev` 后缀。nginx 等网关需自行配置对应的反向代理规则。

**新增后端接入步骤：**

1. 在 `vite.custom.ts` 的 `requestConfig.apiPrefixes` 中追加 `{ prefix, port? }`
2. 无需改动 `vite.config.ts`（代理由 `buildPrefixProxy` 自动生成）
3. 无需改动 `request.ts` 或 `request-url.ts`（`resolveRequestUrl` 已实现前缀匹配）
4. 生产环境同步更新 nginx/网关配置

## 路由与布局

- 路由定义：`src/router/index.ts`
- 常量路由：`src/router/constant-routes.ts`（登录、404、Root 布局、兜底）
- 动态路由：`src/router/dynamic-routes/`（按模块拆分，由 `permissionStore.generateRoutes()` 合并）
- 路由过滤与菜单生成：`src/router/menu.ts` -> `filterAsyncRoutes` / `buildMenuList`
- 路由守卫：`src/router/guard.ts` -> `setupRouterGuard`
- 路由进度条：`App.vue` 中的 `y-page-progress`，开关在 `src/composables/usePageProgress.ts`
- 主布局：`src/layouts/BasicLayout/index.vue`（一级导航 + 侧边栏；`NavHead`、`Breadcrumb` 在同目录 `components/`）
- 空白布局：`src/layouts/BlankLayout/index.vue`
- 页面基础信息：`route.meta` 类型声明 -> `src/types/router.d.ts`

## 状态管理

- 全局状态：`src/stores/global.ts`（tabPrefix、tenantId、侧边栏、面包屑、keep-alive 缓存）
- 用户登录态：`src/stores/user.ts`
- 权限与菜单：`src/stores/permission.ts` -> `usePermissionStore`

## API 封装

- 接口函数入口：`src/api`
- 示例接口：`src/api/index.ts`

## 样式与图标

- 全局样式入口：`src/styles/index.scss`
- 重置样式：`src/styles/reset.scss`
- UnoCSS 图标目录：`src/assets/svg/fill`、`src/assets/svg/icon`、`src/assets/svg/other`

---

## qiankun 微前端

项目集成 [vite-plugin-qiankun](https://www.npmjs.com/package/vite-plugin-qiankun)。是否处于主应用中，只看运行时 `qiankunWindow.__POWERED_BY_QIANKUN__`。

### 职责划分

| 层级 | 判断方式 | 用途 |
| --- | --- | --- |
| 运行时 | `qiankunWindow.__POWERED_BY_QIANKUN__` | `main.ts` 生命周期、`appConfig.inQiankun` |

### 配置入口

| 入口 | 说明 |
| --- | --- |
| `vite.config.ts` | `base` 使用 `appConfig.base`；始终加载 qiankun 插件 |
| `src/main.ts` | 运行时检测 `qiankunWindow.__POWERED_BY_QIANKUN__`，注册或不注册生命周期 |
| `vite.custom.ts` | `appConfig.inQiankun` 读取 `qiankunWindow.__POWERED_BY_QIANKUN__` |
| `src/composables/useQiankunActions.ts` | 主应用与子应用通信 |

### 行为说明

运行时行为：

- `qiankunWindow.__POWERED_BY_QIANKUN__ === true` → `main.ts` 调用 `renderWithQiankun` 注册 `bootstrap/mount/unmount/update` 生命周期，mount 时注入主应用 actions
- `qiankunWindow.__POWERED_BY_QIANKUN__ === false/undefined` → 直接 `createApp` + `mount` 独立运行

### 主应用接入

主应用通过 qiankun 的 `registerMicroApps` 注册子应用时：

- `name` 需与 `vite.config.ts` 中 `qiankun('rhea')` 的参数一致（`'rhea'`）
- 子应用入口指向 `http://localhost:8026/subapp/rhea/`（开发）或构建产物地址（生产）

### 子应用与主应用通信

**接收主应用消息**（`src/App.vue`）：

```ts
import { onGlobalStateChange, receiveMessage, hasProperty } from '@/composables/useQiankunActions'

onGlobalStateChange(state => {
  if (hasProperty(state, 'tabPrefix')) {
    // 浏览器标签页前缀
  }
  if (hasProperty(state, 'tenantId')) {
    // 租户 ID，变更时触发路由重载
  }
  if (hasProperty(state, 'sidebarStatus')) {
    // 侧边栏状态
  }
}, true) // fireImmediately
```

消息写入 `src/stores/global.ts` 后在路由守卫 `src/router/guard.ts` 中消费。

**向主应用发送消息**（`src/router/guard.ts` `beforeEach`）：

```ts
import { sendMessage } from '@/composables/useQiankunActions'

sendMessage({ tenantDisabled: !to.meta?.isMenu })
```

### 常见场景

- **生产构建**：`base` 为 `appConfig.base`，由主应用加载时走 qiankun 生命周期。
- **本地独立运行**：`pnpm dev` 后直接访问 `http://localhost:8026`。
- **本地联调主应用**：主应用入口指向 `http://localhost:8026/subapp/rhea/`。开发环境 `skipMenuAuth` 为 true。
