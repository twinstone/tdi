import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'

const dist = (file: string) => resolve(import.meta.dirname, '../dist', file)

test('build emits all three entry points', () => {
  for (const file of ['tdi.js', 'auto.js', 'tdi.global.js', 'tdi.global.min.js', 'index.d.ts']) {
    expect(existsSync(dist(file)), file).toBe(true)
  }
})

test('global build assigns window.TDI', () => {
  expect(readFileSync(dist('tdi.global.js'), 'utf8')).toMatch(/window\.TDI\s*=/)
})
