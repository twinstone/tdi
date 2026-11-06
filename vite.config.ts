import { resolve } from 'node:path'
import { build, defineConfig, type LibraryFormats } from 'vite'

const src = (file: string) => resolve(import.meta.dirname, 'src', file)

// Every entry is built on its own, so each output is self-contained. A multi-entry pass would
// hoist the shared code into a chunk the entries import by relative path, which a CMS serving
// assets from generated URLs cannot resolve. The cost is one copy of the library per entry on
// disk; a page loads exactly one of them.
const extraBundles = {
	name: 'tdi-extra-bundles',
	apply: 'build' as const,
	async closeBundle() {
		const outputs = [
			// undefined leaves Vite's library default in place, as the main ESM build uses
			{ entry: 'auto.ts', format: 'es', fileName: 'auto.js', minify: undefined },
			{ entry: 'global.ts', format: 'iife', fileName: 'tdi.global.js', minify: false },
			{ entry: 'global.ts', format: 'iife', fileName: 'tdi.global.min.js', minify: true },
		]
		for (const out of outputs) {
			await build({
				configFile: false,
				logLevel: 'warn',
				build: {
					target: 'es2022',
					lib: {
						entry: src(out.entry),
						name: 'TDI',
						formats: [out.format as LibraryFormats],
						fileName: () => out.fileName,
					},
					minify: out.minify,
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
		lib: { entry: src('index.ts'), formats: ['es'], fileName: () => 'tdi.js' },
	},
	plugins: [extraBundles],
})
