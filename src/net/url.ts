const OWN = /^(_infuse|_ts)(=|$)/

/** Marks a URL so the server answers with TDI XML; `_ts` defeats caching. Other query bytes are left untouched. */
export function ajaxifyUrl(url: string): string {
  const hashAt = url.indexOf('#')
  const hash = hashAt < 0 ? '' : url.slice(hashAt)
  const rest = hashAt < 0 ? url : url.slice(0, hashAt)

  const queryAt = rest.indexOf('?')
  const base = queryAt < 0 ? rest : rest.slice(0, queryAt)
  const query = queryAt < 0 ? '' : rest.slice(queryAt + 1)

  const kept = query
    .split('&')
    .filter((pair) => !OWN.test(pair))
    .join('&')
    .replace(/^&+|&+$/g, '')

  const own = `_infuse=1&_ts=${Date.now()}`
  return `${base}?${kept ? `${kept}&` : ''}${own}${hash}`
}
