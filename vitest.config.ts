import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    // Inline scripts must really execute (content script tests); resources stay off
    environmentOptions: { jsdom: { runScripts: 'dangerously' } },
    include: ['test/**/*.test.ts'],
  },
})
