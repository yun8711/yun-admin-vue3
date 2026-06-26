# CodeGraph 使用说明

本文档说明本项目中 CodeGraph 的维护策略与常见用法。

## 当前建议

- 目前先用单工作区开发，不强制使用 `git worktree`
- 只有高频开发分支和 `full` / `examples` 这类长期分支，才建议维护 `codegraph`
- 临时分支、低频合并分支默认不维护索引

## 单工作区用法

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

## 多分支长期并行时

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

## 推荐维护范围

- `main`：按需维护基础索引
- `full` / `examples`：建议长期维护索引
- 当前高频开发分支：按需维护索引
- 临时分支：需要时再临时 `codegraph init` 或 `codegraph index -f`

## 注意事项

- `src/auto-imports.d.ts`、`src/components.d.ts`、`.eslintrc-auto-import.json`、`tsconfig.tsbuildinfo` 是生成物，分析时优先看手写源码
- `codegraph` 更适合分析 `src/api`、`src/router`、`src/stores`、`src/utils`、`src/composables` 和页面之间的关系
