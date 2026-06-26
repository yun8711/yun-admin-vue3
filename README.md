# yun-admin-vue3

一个基于 Vue 3、TypeScript、Vite、Element Plus 和 `yun-elp` 的后台管理模板项目。

它提供了后台项目常见的基础结构：布局、路由、请求封装、全局样式，以及开箱即用的代码质量工具链，适合作为中后台项目的起点。

## 技术栈

- Vue `3.5.38`
- TypeScript `~6.0.3`
- Vite `8.0.16`
- Vue Router `4.6.4`
- Pinia `3.0.4`
- Element Plus `2.14.2`
- `yun-elp` `1.2.2`
- SCSS / Sass `1.101.0`
- UnoCSS `66.7.2`
- VueUse `14.3.0`
- Axios `1.18.1`

## 环境要求

- Node.js >= 20
- pnpm >= 9

本项目仅支持 `pnpm`，安装阶段会通过 `only-allow` 阻止 `npm` 和 `yarn`。

## 快速开始

```bash
pnpm install
pnpm dev
```

## 常用命令

```bash
# 启动开发环境
pnpm dev

# 类型检查
pnpm run typecheck

# 生产构建 / 本地预览构建结果
pnpm build
pnpm preview

# 代码检查 / 自动修复
pnpm run lint
pnpm run lint:fix

# 代码格式化 / 检查格式是否符合规范
pnpm run fmt
pnpm run fmt:check

# 样式检查 / 自动修复样式问题
pnpm run stylelint
pnpm run stylelint:fix
```

## 项目结构

```text
src/
  api/          接口封装
  assets/       静态资源
  components/   通用组件
  composables/  组合式函数
  layouts/      页面布局
  router/       路由配置
  stores/       Pinia store
  styles/       全局样式
  utils/        工具函数与请求实例
  views/        页面级视图
```

## 开发说明

- 代码检查：ESLint + Oxlint
- 类型检查：Vue TSC
- 代码格式化：Oxfmt
- 样式检查：Stylelint
- 提交校验：Husky + lint-staged + Commitlint

更偏向项目内部协作和 AI 约束的规则，见 [AGENTS.md](./AGENTS.md)。

## 配置文档

- 项目配置总览见 [docs/project-config.md](./docs/project-config.md)

## CodeGraph 文档

- CodeGraph 使用说明见 [docs/codegraph.md](./docs/codegraph.md)

## 示例页面

- 项目内置了一些符合标品风格的示例页面，详见 [docs/example.md](./docs/example.md)
