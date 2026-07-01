# 示例页面说明

`src/views/examples/` 下为开发中常用的几种页面的示例，集中展示了 [yun-elp](https://yun8711.github.io/yun-elp/) 各组件的用法。

## 简单列表页面

`list/simple.vue`

整个页面以展示表格为主，由 [y-table-search](https://yun8711.github.io/yun-elp/components/y-table-search.html) 表格搜索组件 + [y-table](https://yun8711.github.io/yun-elp/components/y-table.html) 表格组件组成。提供表格数据分页展示、数据过滤功能，配合 [y-column-text](https://yun8711.github.io/yun-elp/components/y-column-text.html)、[y-column-select](https://yun8711.github.io/yun-elp/components/y-column-select.html)、[y-column-filter](https://yun8711.github.io/yun-elp/components/y-column-filter.html)、[y-column-op](https://yun8711.github.io/yun-elp/components/y-column-op.html) 等组件，提供表格内的功能拓展。

## 无限滚动页面

`list/infinite-scroll.vue`

基于 [VueUse `useInfiniteScroll`](https://vueuse.org/core/useInfiniteScroll/) 实现的卡片式无限加载列表，配合 `usePageScroll` 在 BasicLayout 的 el-scrollbar 内监听滚动。

## 详情页面

`detail/index.vue`

使用 [y-page-header](https://yun8711.github.io/yun-elp/components/y-page-header.html)、[y-part-title](https://yun8711.github.io/yun-elp/components/y-part-title.html)、[y-desc](https://yun8711.github.io/yun-elp/components/y-desc.html)、[y-group-select](https://yun8711.github.io/yun-elp/components/y-group-select.html) 构建详情展示页，展示三列描述列表、分组标题、tab 切换等信息展示模式。

## 编辑页面

`edit/index.vue`

使用 [y-page-header](https://yun8711.github.io/yun-elp/components/y-page-header.html)、[y-form](https://yun8711.github.io/yun-elp/components/y-form.html)、[y-form-item](https://yun8711.github.io/yun-elp/components/y-form-item.html)、[y-table](https://yun8711.github.io/yun-elp/components/y-table.html)（行内编辑）、[y-page-footer](https://yun8711.github.io/yun-elp/components/y-page-footer.html) 构建表单编辑页，覆盖输入、选择、数字、textarea 等常规表单项及表格表单。

## ECharts 图表页面

`echarts/index.vue`

使用 [y-echarts](https://yun8711.github.io/yun-elp/components/y-echarts.html) 组件按需加载 [ECharts](https://echarts.apache.org/) 模块，演示折线图、柱状图、饼图、散点图四种常用图表类型。

## 国际化示例页面

`i18n-demo/index.vue`

使用 [VoerkaI18n](https://zhangfisher.github.io/voerka-i18n/) 的 `t()` 函数演示基础翻译、变量插值、复数形式等场景，配合顶栏语言下拉实时切换。
