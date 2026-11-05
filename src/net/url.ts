const ABSOLUTE = /^([a-z][a-z\d+.-]*:|\/\/)/i

/** Marks a URL so the server answers with TDI XML; `_ts` defeats caching. */
export function ajaxifyUrl(url: string): string {
  const parsed = new URL(url, document.baseURI)
  parsed.searchParams.set('_infuse', '1')
  parsed.searchParams.set('_ts', String(Date.now()))

  const sameOrigin = parsed.origin === new URL(document.baseURI).origin
  if (!ABSOLUTE.test(url) && sameOrigin) {
    return parsed.pathname + parsed.search + parsed.hash
  }
  return parsed.href
}
