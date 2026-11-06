// Budget for the global bundle, measured by size-limit as minified + brotli.
// 6 kB is ~20% headroom over the v2 size when set (~5 kB), which already carries things v1 lacked
// (origin allowlist, content-script policy, promise pipeline). The old 5 kB figure was estimated in gzip
// from v1 sources, not measured from a v1 bundle. Raise it only with a stated reason.
export default [
  {
    name: 'tdi.global.min.js',
    path: 'dist/tdi.global.min.js',
    limit: '6 kB',
  },
]
