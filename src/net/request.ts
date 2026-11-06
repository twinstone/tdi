import { applyResponse } from '../core/pipeline'
import { dispatch, TdiEvents } from '../events'
import type { InstructionRegistry } from '../instructions/registry'
import type { TdiRequestOptions, TdiResult } from '../types'
import { parseResponse } from './parse'
import { ajaxifyUrl, originOf } from './url'

const FORM_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8'

export const toParams = (data: Record<string, unknown> | FormData): URLSearchParams => {
	const params = new URLSearchParams()
	const entries = data instanceof FormData ? data.entries() : Object.entries(data)
	for (const [k, v] of entries) {
		if (v instanceof Blob)
			throw new TypeError(`Cannot serialise a file ("${k}") into a query string; use POST`)
		// jQuery $.param parity: an array gets a [] suffix, one entry per item (FormData entries are scalar)
		if (Array.isArray(v))
			for (const item of v) params.append(`${k}[]`, item == null ? '' : String(item))
		else params.append(k, v == null ? '' : String(v))
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
 * Data values are stringified: nested objects are not supported, and an array becomes `name[]` entries (as jQuery did); a File in a GET FormData rejects.
 */
export async function sendRequest(
	url: string,
	callerOptions: TdiRequestOptions,
	registry: InstructionRegistry,
	involved: Element[],
	// Internal: called with the final response URL before the body is read; throws to reject
	validateResponseUrl?: (url: string) => void,
): Promise<TdiResult> {
	// One shared object for every event; `url` is the marked URL, as in v1
	const options: TdiRequestOptions = { ...callerOptions }
	const method = (options.method ?? 'GET').toUpperCase()
	const isGet = method === 'GET'
	const { data } = options

	const headers = new Headers({ Accept: 'application/xml, text/xml, */*' })
	let body: BodyInit | undefined
	if (data !== undefined && !isGet) {
		if (data instanceof FormData)
			body = data // browser supplies the multipart boundary
		else {
			body = serialize(data)
			headers.set('Content-Type', FORM_TYPE)
		}
	}
	try {
		if (originOf(url) === location.origin) headers.set('X-Requested-With', 'XMLHttpRequest')
	} catch {
		// Unparseable URL: fetch rejects it below as an error event
	}
	new Headers(options.headers).forEach((v, k) => headers.set(k, v))

	const controller = new AbortController()
	const { signal } = options
	const onAbort = (): void => controller.abort(signal!.reason)
	if (signal?.aborted) onAbort()
	else signal?.addEventListener('abort', onAbort, { once: true })

	const init: RequestInit = {
		method,
		headers,
		body,
		credentials: options.credentials ?? 'same-origin',
		signal: controller.signal,
	}
	if (options.mode) init.mode = options.mode
	if (options.cache) init.cache = options.cache
	if (options.redirect) init.redirect = options.redirect

	const markedUrl = (): string =>
		ajaxifyUrl(data !== undefined && isGet ? withQuery(url, serialize(data)) : url)
	try {
		options.url = markedUrl()
	} catch {
		// Serialisation failure resurfaces below as an error event
	}

	const fire = (name: string, targets: EventTarget[], detail: object): void => {
		for (const t of targets) dispatch(t, name, detail)
	}
	const fail = (response: Response | null, message: string): void =>
		fire(TdiEvents.error, [document], {
			response,
			status: response?.status ?? 0,
			message,
			options,
		})

	fire(TdiEvents.start, targetsOf(involved), { options })
	let response: Response | null = null
	try {
		try {
			response = await fetch(options.url ?? markedUrl(), init)
			if (response.url && validateResponseUrl) {
				try {
					validateResponseUrl(response.url) // redirects land here
				} catch (err) {
					void response.body?.cancel().catch(() => {}) // never leave a refused body streaming
					throw err
				}
			}
			const text = await response.text()
			const parsed = parseResponse(text)
			if (!parsed.ok) fail(response, `Response status: ${parsed.status}`)
			const responses = await applyResponse(parsed, options, registry, involved)
			return { response, responses }
		} catch (err) {
			// An abort is not an error event; everything else here is a transport or parse failure
			if (!controller.signal.aborted)
				fail(response, err instanceof Error ? err.message : String(err))
			throw err
		}
	} finally {
		signal?.removeEventListener('abort', onAbort)
		fire(TdiEvents.end, targetsOf(involved), { options })
	}
}
