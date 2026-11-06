import { applyResponse } from '../core/pipeline'
import { dispatch, TdiEvents } from '../events'
import type { InstructionRegistry } from '../instructions/registry'
import type { TdiRequestOptions, TdiResult } from '../types'
import { parseResponse } from './parse'
import { ajaxifyUrl } from './url'

const FORM_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8'

const toParams = (data: Record<string, unknown> | FormData): URLSearchParams => {
  const params = new URLSearchParams()
  const entries = data instanceof FormData ? data.entries() : Object.entries(data)
  for (const [k, v] of entries) {
    if (v instanceof Blob) throw new TypeError(`Cannot serialise a file ("${k}") into a query string; use POST`)
    params.append(k, v == null ? '' : String(v))
  }
  return params
}

const serialize = (data: NonNullable<TdiRequestOptions['data']>): string =>
  typeof data === 'string' ? data : toParams(data).toString()

// Folds data into the query before ajaxifyUrl so its byte-preserving rules apply to the result
function withQuery(url: string, data: string): string {
  const trimmed = data.replace(/^[?&]+|&+$/g, '')
  if (!trimmed) return url
  const hashAt = url.indexOf('#')
  const hash = hashAt < 0 ? '' : url.slice(hashAt)
  const rest = (hashAt < 0 ? url : url.slice(0, hashAt)).replace(/[?&]+$/, '')
  return `${rest}${rest.includes('?') ? '&' : '?'}${trimmed}${hash}`
}

// Involved elements may have left the DOM (v1 issue #6); fall back to document
function targetsOf(involved: Element[]): EventTarget[] {
  const live = involved.filter((el) => el.isConnected)
  return live.length ? live : [document]
}

/**
 * The internal AbortController is an implementation detail: it links `options.signal` and detects aborts during the body read.
 * Cancellation requires the caller to supply `options.signal`; without one the request cannot be cancelled.
 * No deadline by design: callers can pass `AbortSignal.timeout(ms)`.
 * Data values are stringified: nested objects/arrays are not supported, and a File in a GET FormData rejects.
 */
export async function sendRequest(
  url: string,
  options: TdiRequestOptions,
  registry: InstructionRegistry,
  involved: Element[],
): Promise<TdiResult> {
  const method = (options.method ?? 'GET').toUpperCase()
  const isGet = method === 'GET'
  const { data } = options

  const headers = new Headers({ Accept: 'application/xml, text/xml, */*' })
  let body: BodyInit | undefined
  if (data !== undefined && !isGet) {
    if (data instanceof FormData) body = data // browser supplies the multipart boundary
    else {
      body = serialize(data)
      headers.set('Content-Type', FORM_TYPE)
    }
  }
  new Headers(options.headers).forEach((v, k) => headers.set(k, v))

  const controller = new AbortController()
  const { signal } = options
  const onAbort = (): void => controller.abort(signal!.reason)
  if (signal?.aborted) onAbort()
  else signal?.addEventListener('abort', onAbort, { once: true })

  const init: RequestInit = { method, headers, body, credentials: options.credentials ?? 'same-origin', signal: controller.signal }
  if (options.mode) init.mode = options.mode
  if (options.cache) init.cache = options.cache
  if (options.redirect) init.redirect = options.redirect

  const fire = (name: string, targets: EventTarget[], detail: object): void => {
    for (const t of targets) dispatch(t, name, detail)
  }
  const fail = (response: Response | null, message: string): void =>
    fire(TdiEvents.error, [document], { response, status: response?.status ?? 0, message, options })

  fire(TdiEvents.start, targetsOf(involved), { options })
  let response: Response | null = null
  try {
    try {
      const target = data !== undefined && isGet ? withQuery(url, serialize(data)) : url
      response = await fetch(ajaxifyUrl(target), init)
      const text = await response.text()
      const parsed = parseResponse(text)
      if (!parsed.ok) fail(response, `Response status: ${parsed.status}`)
      const responses = await applyResponse(parsed, options, registry, involved)
      return { response, responses }
    } catch (err) {
      // An abort is not an error event; everything else here is a transport or parse failure
      if (!controller.signal.aborted) fail(response, err instanceof Error ? err.message : String(err))
      throw err
    }
  } finally {
    signal?.removeEventListener('abort', onAbort)
    fire(TdiEvents.end, targetsOf(involved), { options })
  }
}
