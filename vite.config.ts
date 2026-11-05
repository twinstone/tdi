import { resolve } from 'node:path'
import { build, defineConfig } from 'vite'

const src = (file: string) => resolve(import.meta.dirname, 'src', file)

// IIFE cannot be multi-entry, so the global bundles are built after the ESM pass
const globalBundles = {
  name: 'tdi-global',
  async closeBundle() {
    for (const minify of [false, true]) {
      await build({
        configFile: false,
        logLevel: 'warn',
        build: {
          lib: {
            entry: src('global.ts'),
            name: 'TDI',
            formats: ['iife'],
            fileName: () => (minify ? 'tdi.global.min.js' : 'tdi.global.js'),
          },
          minify,
          sourcemap: true,
          emptyOutDir: false,
        },
      })
    }
  },
}

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    lib: {
      entry: { tdi: src('index.ts'), auto: src('auto.ts') },
      formats: ['es'],
    },
  },
  plugins: [globalBundles],
})
