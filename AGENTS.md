# AGENTS.md

本文件面向在本仓库中工作的 AI Agent 和开发者，描述项目内部约束、目录职责和修改偏好。

## 目标

- 这是一个 Vue 3 后台模板项目，不是业务成品。
- 新增内容应优先保持“可复用、可扩展、易二次开发”。
- 避免把强业务语义、品牌信息或一次性页面逻辑固化进模板。

## 技术基线

- Vue 3 + TypeScript + Vite
- Vue Router + Pinia
- Element Plus + `yun-elp`
- SCSS + UnoCSS
- Axios
- Node.js >= 20
- 包管理器固定为 `pnpm`

### yun-elp

yun-elp 是一个基于 element-plus 二次封装的业务组件库，提供了yun-elp-mcp代本地查询组件信息，还提供了在线的：[官方文档](https://yun8711.github.io/yun-elp/)、[llms.txt](https://yun8711.github.io/yun-elp/llms.txt)、[llms-full.txt](https://yun8711.github.io/yun-elp/llms-full.txt)、[components.json](https://yun8711.github.io/yun-elp/metadata/components.json)、[sitemap.xml](https://yun8711.github.io/yun-elp/sitemap.xml) 以便查询。

## 代码质量工具

- Lint: `oxlint` + `eslint`
- Typecheck: `vue-tsc`
- Format: `oxfmt`
- Style: `stylelint`
- Git hooks: `husky` + `lint-staged`
- Commit message: `commitlint`

不要引入 Prettier。本项目格式化统一使用 `oxfmt`。

## 目录职责

- `src/views`: 页面级视图。按路由或业务模块分目录，页面入口文件优先使用 `index.vue`。
- `src/layouts`: 全局布局，如后台主布局、空白布局。
- `src/router`: 路由定义与路由层组织。
- `src/stores`: Pinia store。放可复用的全局状态，不把临时页面状态硬塞进 store。
- `src/api`: 接口函数封装。与页面解耦，不在页面中直接拼接大量请求逻辑。
- `src/utils`: 通用工具和底层基础能力，例如 `request.ts`。
- `src/components`: 通用组件。放跨页面复用组件，不放单页私有大组件。
- `src/composables`: 可复用组合式逻辑。
- `src/styles`: 全局样式、重置样式和样式入口。

## 现有约定

- 路由使用 `layouts + children` 组织，主路由挂在 `BasicLayout` 下。
- 页面标题等基础信息通过 `route.meta` 管理。
- 请求统一通过 `src/utils/request.ts` 导出的 axios 实例走拦截器。
- 全局样式入口是 `src/styles/index.scss`，其中引入 `reset.scss`。
- 环境变量统一放在 `.env.*` 文件中；暴露给前端运行时的变量必须使用 `VITE_` 前缀。
- 新增环境变量时，除了补对应 `.env.*` 文件，也要同步更新 `.env.example`。
- Vite 已配置：
  - `@` 指向 `src`
  - `unplugin-auto-import`
  - `unplugin-vue-components`
  - `ElementPlusResolver`
  - `YunElpResolver`
  - UnoCSS 本地图标集合：`ep`、`fill`、`icon`、`other`
  - SCSS 全局注入 `yun-elp/themes/kd.scss`，这一套内置的主题样式

## 图标约定

- UnoCSS 图标前缀约定：
  - `i-ep-*`：Element Plus Iconify 图标
  - `i-fill-*`：`src/assets/svg/fill`
  - `i-icon-*`：`src/assets/svg/icon`
  - `i-other-*`：`src/assets/svg/other`
- 默认直接在模板中写 UnoCSS 图标类，不额外封装图标组件。
- 图标尺寸优先使用 UnoCSS 原子类表达，例如 `text-18`、`text-24`。
- `iconfont` 不纳入统一抽象；确实需要时，按原始类名写法使用，例如：`<i class="iconfont icon-menu-fold" />`
- 新增本地 SVG 图标时，优先放到上述目录，并通过 UnoCSS 图标类名使用，而不是直接内联到页面。
- 图标文件名使用 kebab-case；类名与文件名保持一一对应。

## 自动生成文件

- 以下文件默认视为生成物或缓存，不要优先手改：
  - `src/auto-imports.d.ts`
  - `src/components.d.ts`
  - `.eslintrc-auto-import.json`
  - `tsconfig.tsbuildinfo`
- 这类文件异常时，优先回溯其上游配置或生成来源，而不是直接改结果文件。

## 修改偏好

- 优先复用现有布局、请求层、样式入口和组件注册机制。
- 新增页面时，先接入路由，再补页面内容；不要直接把演示代码散落在多个位置。
- 新增接口时，优先放到 `src/api`，页面中只负责调用和状态处理。
- 新增复用逻辑时，优先抽到 `src/composables` 或 `src/components`。
- 新增全局样式时，先判断是否应该写到 `src/styles`；避免在页面里堆大量重复样式。
- 保持模板项目中示例内容的中性命名，避免写死真实业务术语。

## 不要做的事

- 不要切回 Prettier 或引入多套格式化工具。
- 不要绕过 `request.ts` 直接在各页面重复创建 axios 实例。
- 不要把自动生成文件当作手写源码风格基准。
- 不要为了单页效果破坏模板整体结构。
- 不要无故改动构建链路、自动导入和组件解析配置。

## 提交前检查

在完成代码修改后，优先确保以下命令可通过：

```bash
pnpm run lint
pnpm run typecheck
pnpm run fmt:check
pnpm run stylelint
```

如果改动影响构建链路、样式导入、自动导入、组件解析或环境变量，还应额外执行：

```bash
pnpm run build
```

如果修改影响提交流程，也要确认 `commitlint`、`husky` 和 `lint-staged` 仍然可用。

## 编辑器约定

- 项目默认按 `.editorconfig` 和 `.vscode/settings.json` 协作。
- 推荐扩展以 `.vscode/extensions.json` 为准。
- 如果某项格式化或校验行为只在编辑器里出现，先检查是否是工作区设置导致，而不是直接怀疑源码或构建配置。
