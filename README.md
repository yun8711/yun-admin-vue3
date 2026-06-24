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

## 多分支开发与 CodeGraph

### 当前建议

- 目前先用单工作区开发，不强制使用 `git worktree`
- 只有高频开发分支和 `full` / `examples` 这类长期分支，才建议维护 `codegraph`
- 临时分支、低频合并分支默认不维护索引

### 单工作区用法

切换分支后按下面规则处理：

- 小范围改动或相近分支切换：`codegraph sync`
- 大量新增、删除、重命名文件，或查询结果明显不对：`codegraph index -f`

常用命令：

```bash
codegraph init
codegraph status
codegraph sync
codegraph index -f
```

### 多分支长期并行时

如果后续长期并行维护 `main`、`full`、`feature/http` 这类分支，再引入 `git worktree`。

创建示例：

```bash
git worktree add ../yun-admin-vue3-full full
git worktree add ../yun-admin-vue3-feature-http feature/http
```

然后在各自目录初始化：

```bash
cd ../yun-admin-vue3-full
codegraph init

cd ../yun-admin-vue3-feature-http
codegraph init
```

后续在对应目录内同步：

```bash
codegraph sync
```

### 推荐维护范围

- `main`：按需维护基础索引
- `full` / `examples`：建议长期维护索引
- 当前高频开发分支：按需维护索引
- 临时分支：需要时再临时 `codegraph init` 或 `codegraph index -f`

### 注意

- `src/auto-imports.d.ts`、`src/components.d.ts`、`.eslintrc-auto-import.json`、`tsconfig.tsbuildinfo` 是生成物，分析时优先看手写源码
- `codegraph` 更适合分析 `src/api`、`src/router`、`src/stores`、`src/utils`、`src/composables` 和页面之间的关系
