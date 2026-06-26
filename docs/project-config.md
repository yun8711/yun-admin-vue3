# 项目配置入口速查

只列“功能点对应的配置入口”。

## 环境变量

- 接口基础地址：`.env.*` -> `VITE_APP_BASE_API`
- 请求成功数据路径：`.env.*` -> `VITE_APP_RES_PATH`
- 请求失败数据路径：`.env.*` -> `VITE_APP_ERROR_PATH`
- 统一请求前缀：`.env.*` -> `VITE_APP_API_PREFIX`
- 多后端前缀列表：`.env.*` -> `VITE_APP_API_PREFIXES`
- 开发代理后缀：`.env.*` -> `VITE_APP_DEV_PROXY_SUFFIX`
- 变量示例：`.env.example`
- 变量类型声明：`src/env.d.ts`

## 请求层

- 请求运行时配置入口：`src/config/app.ts` -> `appRequestConfig`
- 请求 URL 前缀解析：`src/config/app.ts` -> `resolveRequestUrl`
- qiankun 运行时判断：`src/config/app.ts` -> `getQiankunRuntimeFlag`
- axios 实例与拦截器：`src/utils/request.ts`
- token 注入：`src/utils/request.ts` 请求拦截器
- 401 处理：`src/utils/request.ts` 响应拦截器
- 下载能力（blob）：`src/utils/request.ts` -> `downloadBlob`
- 可取消请求：`src/utils/request.ts` -> `abort` 配置

## 路由与布局

- 路由定义：`src/router/index.ts`
- 主布局挂载：`src/router/index.ts` 中 `BasicLayout`
- 空白布局挂载：`src/router/index.ts` 中 `BlankLayout`
- 页面基础信息：`src/router/index.ts` 中 `route.meta`

## 状态管理

- 全局状态入口：`src/stores`
- 用户登录态：`src/stores/user.ts`

## API 封装

- 接口函数入口：`src/api`
- 示例接口：`src/api/index.ts`

## 样式与图标

- 全局样式入口：`src/styles/index.scss`
- 重置样式：`src/styles/reset.scss`
- UnoCSS 图标目录：`src/assets/svg/fill`、`src/assets/svg/icon`、`src/assets/svg/other`
