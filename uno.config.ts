import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
// import presetRemToPx from '@unocss/preset-rem-to-px'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: {
    // 不带page-header的页面
    page: 'h-full p-8 pt-6 box-border',
    // 带page-header的页面
    'page-with-header': 'h-full p-8 pt-2 box-border',
    'flex-center': 'flex items-center justify-center',
    'inline-flex-center': 'inline-flex items-center justify-center',
  },
  rules: [
    // Support text-12 / text-14 style pixel font sizes alongside preset typography tokens.
    [/^text-(\d+)$/, ([, d]) => ({ 'font-size': `${Number(d)}px` })],
  ],
  theme: {
    colors: {
      primary: 'var(--ep-color-primary)',
      success: 'var(--ep-color-success)',
      warning: 'var(--ep-color-warning)',
      danger: 'var(--ep-color-danger)',
      info: 'var(--ep-color-info)',
    },
    borderRadius: {
      DEFAULT: 'var(--ep-border-radius-base)',
    },
  },
  presets: [
    presetUno(),
    // presetRemToPx(),
    presetAttributify(),
    presetIcons({
      warn: true,
      unit: 'px',
      collections: {
        ep: () => import('@iconify-json/ep/icons.json').then(i => i.default),
        fill: FileSystemIconLoader('./src/assets/svg/fill'),
        icon: FileSystemIconLoader('./src/assets/svg/icon'),
        other: FileSystemIconLoader('./src/assets/svg/other'),
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
        width: '16px',
        height: '16px',
        'flex-shrink': 0,
      },
    }),
  ],
  transformers: [transformerVariantGroup()],
  content: {
    pipeline: {
      include: ['./index.html', './src/**/*.{vue,html,jsx,tsx,js,ts}'],
    },
  },
})
