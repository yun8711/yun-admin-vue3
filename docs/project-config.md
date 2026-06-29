# 项目配置入口速查

只列"功能点对应的配置入口"。

## 环境变量

- 接口基础地址：`.env.*` -> `VITE_APP_BASE_API`
- 请求成功数据路径：`.env.*` -> `VITE_APP_RES_PATH`
- 请求失败数据路径：`.env.*` -> `VITE_APP_ERROR_PATH`
- 统一请求前缀：`.env.*` -> `VITE_APP_API_PREFIX`
- 多后端前缀列表：`.env.*` -> `VITE_APP_API_PREFIXES`
- 开发代理后缀：`.env.*` -> `VITE_APP_DEV_PROXY_SUFFIX`
- 是否跳过菜单权限校验：`.env.*` -> `VITE_APP_SKIP_MENU_AUTH`
- 应用标题：`.env.*` -> `VITE_APP_TITLE`
- 前端端口：`.env.*` -> `VITE_APP_FE_PORT`
- 开发代理目标：`.env.*` -> `VITE_APP_PROXY_TARGET`
- qiankun 模式：`.env.*` -> `VITE_QIANKUN_ENABLED`
- 变量示例：`.env.example`
- 变量类型声明：`src/env.d.ts`

## 请求层

- 请求运行时配置入口：`src/config/app.ts` -> `appRequestConfig`
- 请求 URL 前缀解析：`src/config/app.ts` -> `resolveRequestUrl`
- qiankun 运行时判断：`src/config/app.ts` -> `inQiankun`（getter，依赖 `qiankunWindow.__POWERED_BY_QIANKUN__`）
- axios 实例与拦截器：`src/utils/request.ts`
- token 注入：`src/utils/request.ts` 请求拦截器
- 401 处理：`src/utils/request.ts` 响应拦截器
- 下载能力（blob）：`src/utils/request.ts` -> `downloadBlob`
- 可取消请求：`src/utils/request.ts` -> `abort` 配置

### 多后端代理

前后端均为微服务架构时，同一前端项目可能需要访问多个不同的后端服务。通过环境变量 + Vite proxy + 请求拦截器三层配合，实现 URL 前缀自动匹配与代理转发。

**环境变量：**

```
# 多后端前缀列表，逗号分隔，可选端口
# 格式：前缀[:端口]。未指定端口时使用 VITE_APP_PROXY_TARGET 的默认端口
VITE_APP_API_PREFIXES=/rhea,/daas,/indicator:8015,/poseidon:8300,/label
# 开发环境代理后缀（dev 下请求 /rhea/xxx -> /rhea_dev/xxx 命中代理）
VITE_APP_DEV_PROXY_SUFFIX=_dev
# 开发环境后端默认地址（未被独立端口覆盖时使用）
VITE_APP_PROXY_TARGET=http://192.168.122.130
```

**三层配合：**

| 层级 | 入口 | 职责 | 对应 rhea-fe |
|------|------|------|-------------|
| 构建配置 | `vite.config.ts` -> `buildPrefixProxy()` | 从 `VITE_APP_API_PREFIXES` 生成多前缀代理规则（`/rhea_dev` → `host/rhea`） | `getProxy()` |
| 运行时 | `src/config/app.ts` -> `resolveRequestUrl()` | 请求拦截中匹配 URL 前缀，未匹配则补默认前缀；dev 下追加 `_dev` 后缀 | `setAxios()` |
| 请求层 | `src/utils/request.ts` 请求拦截器 | 调用 `resolveRequestUrl(config.url)` 完成 URL 改写 | — |

**运行时链路示例（开发环境）：**

```
请求 /daas/api/query
  ↓ resolveRequestUrl()
  匹配到前缀 /daas（在 VITE_APP_API_PREFIXES 中）
  dev 下追加后缀 _dev → /daas_dev/api/query
  ↓ Vite proxy
  命中 /daas_dev 代理规则
  rewrite: /daas_dev → /daas
  ↓ 转发到后端
  http://192.168.122.130/daas/api/query
```

**独立端口场景：**

```
VITE_APP_API_PREFIXES=/rhea,/indicator:8015
VITE_APP_PROXY_TARGET=http://192.168.122.130

请求 /indicator/metrics
  ↓ resolveRequestUrl → /indicator_dev/metrics
  ↓ Vite proxy /indicator_dev → http://192.168.122.130:8015/indicator
```

**未匹配前缀兜底：**

```
请求 /api/xxx（不在 VITE_APP_API_PREFIXES 列表内）
  ↓ resolveRequestUrl()
  前缀 /api 不在列表，自动补第一个前缀 → /rhea/api/xxx
  dev 下追加后缀 → /rhea_dev/api/xxx
  ↓ Vite proxy /rhea_dev → host/rhea/api/xxx
```

**生产环境行为：**

生产环境无 Vite proxy，仅走 `resolveRequestUrl()` 的前缀匹配与默认前缀补齐逻辑，不追加 `_dev` 后缀。nginx 等网关需自行配置对应的反向代理规则。

**新增后端接入步骤：**

1. 在 `.env.development` 和 `.env.example` 的 `VITE_APP_API_PREFIXES` 中追加新前缀，如需独立端口使用 `:port` 格式
2. 无需改动 `vite.config.ts`（代理由 `buildPrefixProxy` 自动生成）
3. 无需改动 `request.ts` 或 `app.ts`（`resolveRequestUrl` 已实现前缀匹配）
4. 生产环境同步更新 nginx/网关配置

## 路由与布局

- 路由定义：`src/router/index.ts`
- 常量路由：`src/router/constant-routes.ts`（登录、404、Root 布局、兜底）
- 动态路由：`src/router/dynamic-routes/`（按模块拆分，由 `permissionStore.generateRoutes()` 合并）
- 路由过滤与菜单生成：`src/router/menu.ts` -> `filterAsyncRoutes` / `buildMenuList`
- 路由守卫：`src/router/guard.ts` -> `setupRouterGuard`
- 路由进度条：`src/utils/nprogress.ts`
- 主布局：`src/layouts/BasicLayout.vue`（一级导航 + 侧边栏）
- 侧边栏：`src/layouts/Sidebar/`
- 空白布局：`src/layouts/BlankLayout.vue`
- 页面基础信息：`route.meta` 类型声明 -> `src/router/types.ts`

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

项目集成 [vite-plugin-qiankun](https://www.npmjs.com/package/vite-plugin-qiankun)，通过环境变量 `VITE_QIANKUN_ENABLED` 控制 Vite 构建/开发配置，运行时通过 `qiankunWindow.__POWERED_BY_QIANKUN__` 检测是否处于主应用环境中。

### 环境变量

| 变量 | 说明 | 开发默认值 | 生产默认值 |
|------|------|-----------|-----------|
| `VITE_QIANKUN_ENABLED` | 是否启用 qiankun 子应用模式（Vite 配置层） | `false` | `true` |

### 职责划分

| 层级 | 判断方式 | 用途 |
|------|---------|------|
| Vite 构建/开发配置 | `VITE_QIANKUN_ENABLED` 环境变量 | 控制 `vite-plugin-qiankun` 插件、`base` 路径、dev self-proxy |
| 运行时 | `qiankunWindow.__POWERED_BY_QIANKUN__` | `main.ts` 生命周期注册、`inQiankun` getter |

### 配置入口

| 入口 | 说明 |
|------|------|
| `.env.development` / `.env.production` | `VITE_QIANKUN_ENABLED` 控制 Vite 插件开关 |
| `vite.config.ts` | `base` 条件化（qiankun dev → `/`，生产 → `/subapp/rhea/`）；条件加载 `qiankun('rhea', { useDevMode: true })` 插件；dev self-proxy（`/subapp` 回源到自身） |
| `src/main.ts` | 运行时检测 `qiankunWindow.__POWERED_BY_QIANKUN__`，注册/不注册生命周期 |
| `src/config/app.ts` | `inQiankun` 改为 getter，每次访问实时读取 `qiankunWindow.__POWERED_BY_QIANKUN__` |
| `src/composables/useQiankunActions.ts` | 主应用与子应用通信封装（`onGlobalStateChange` / `setGlobalState` / `sendMessage` / `receiveMessage`） |

### 行为说明

- **`VITE_QIANKUN_ENABLED=true`**：Vite 加载 `vite-plugin-qiankun` 插件，dev 模式下 `base` 设为 `/` 并添加 self-proxy（`/subapp` → `localhost:{port}`）解决 useDevMode 路径问题；生产构建 `base` 为 `/subapp/rhea/`。
- **`VITE_QIANKUN_ENABLED=false`**：插件不加载，`base` 始终为 `/subapp/rhea/`，应用独立运行。

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

onGlobalStateChange((state) => {
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

- **生产构建**：默认 `VITE_QIANKUN_ENABLED=true`，构建产物为 qiankun 子应用格式。
- **本地开发（独立运行）**：`VITE_QIANKUN_ENABLED=false`，`pnpm dev` 后直接访问 `http://localhost:8026`，登录 mock 账号即可预览全部 demo 路由。
- **本地开发（联调主应用）**：`VITE_QIANKUN_ENABLED=true`，主应用配置子应用入口为 `http://localhost:8026/subapp/rhea/`，无需自带登录页（`SKIP_MENU_AUTH=true` 自动隐藏）。
