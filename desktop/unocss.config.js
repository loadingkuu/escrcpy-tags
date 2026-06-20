import { createRequire } from 'node:module'
import transformerDirectives from '@unocss/transformer-directives'
import { presetShades } from '@viarotel-org/unocss-preset-shades'
import { defineConfig, presetWind } from 'unocss'
import presetIcons from '@unocss/preset-icons'
import { primaryColor } from './src/configs/index.js'
import presetTypography from '@unocss/preset-typography'

const presetMain = presetWind()

// Load every Iconify collection explicitly from `@iconify/json`. The default
// `presetIcons()` resolver fails to locate `@iconify/json` under pnpm's
// isolated node_modules, which left all `i-*` icons (window controls, toolbar,
// control bar, …) silently empty/invisible.
const require = createRequire(import.meta.url)

const iconifyCollections = require('@iconify/json/collections.json')

const iconCollections = Object.fromEntries(
  Object.keys(iconifyCollections).map(prefix => [
    prefix,
    () => require(`@iconify/json/json/${prefix}.json`),
  ]),
)

const presets = [
  presetMain,
  presetIcons({ collections: iconCollections }),
  presetShades(primaryColor),
  presetTypography(),
]

export default defineConfig({
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
        '{src,pages}/**/**/*.{js,ts,vue}',
      ],
    },
  },
  presets,
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      // @ts-expect-error
      gray: presetMain?.theme?.colors?.neutral,
    },
    boxShadow: {
      'el': 'var(--el-box-shadow)',
      'el-light': 'var(--el-box-shadow-light)',
      'el-lighter': 'var(--el-box-shadow-lighter)',
      'el-dark': 'var(--el-box-shadow-dark)',
    },
  },
  shortcuts: {
    'inset-0': 'top-0 bottom-0 left-0 right-0',
    'inset-center':
      'top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2',
    'top-center': 'top-1/2 transform -translate-y-1/2',
    'left-center': 'left-1/2 transform -translate-x-1/2',
  },
})
