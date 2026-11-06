import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createDefaultRegistry } from '../../src/core/pipeline'
import { sendRequest } from '../../src/net/request'
import type { TdiRequestOptions } from '../../src/types'

const OK = '<response><status>OK</status></response>'
const registry = createDefaultRegistry()
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

let fetchMock: ReturnType<typeof vi.fn>
let ctl = new AbortController()

function respond(body = OK, init: ResponseInit = { status: 200 }): void {
	fetchMock.mockImplementation(async () => new Response(body, init))
}
const send = (url: string, options: TdiRequestOptions = {}, involved: Element[] = []) =>
	sendRequest(url, options, registry, involved)
const call = (): { url: string; init: RequestInit & { headers: Headers } } => {
	expect(fetchMock).toHaveBeenCalledTimes(1)
	const [url, init] = fetchMock.mock.calls[0]!
	return { url, init }
}
function record(target: EventTarget, names: string[]): string[] {
	const seen: string[] = []
	for (const n of names)
		target.addEventListener(n, () => seen.push(n.replace('tdi:ajax:', '')), {
			signal: ctl.signal,
		})
	return seen
}

beforeEach(() => {
	document.body.innerHTML = '<a id="trigger" href="#"></a><div id="x"></div>'
	fetchMock = vi.fn()
	respond()
	vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
	ctl.abort()
	ctl = new AbortController()
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
	document.body.innerHTML = ''
})

describe('headers', () => {
	test('same-origin sends Accept and X-Requested-With: XMLHttpRequest', async () => {
		await send('/a')
		const h = call().init.headers
		expect(h.get('accept')).toBe('application/xml, text/xml, */*')
		expect(h.get('x-requested-with')).toBe('XMLHttpRequest')
		expect([...h.keys()].sort()).toEqual(['accept', 'x-requested-with'])
	})

	test('cross-origin omits X-Requested-With', async () => {
		await send('https://other.example/a')
		const h = call().init.headers
		expect(h.has('x-requested-with')).toBe(false)
		expect([...h.keys()]).toEqual(['accept'])
	})

	test('a caller X-Requested-With wins', async () => {
		await send('/a', { headers: { 'X-Requested-With': 'custom' } })
		expect(call().init.headers.get('x-requested-with')).toBe('custom')
	})

	test('a <base href> on another origin makes a relative URL cross-origin', async () => {
		const base = document.createElement('base')
		base.href = 'https://other.example/'
		document.head.append(base)
		try {
			await send('/a')
			expect([...call().init.headers.keys()]).toEqual(['accept'])
		} finally {
			base.remove()
		}
	})

	test('a string body sets urlencoded Content-Type', async () => {
		await send('/a', { method: 'POST', data: 'a=1&b=2' })
		const { init } = call()
		expect(init.headers.get('content-type')).toBe(
			'application/x-www-form-urlencoded; charset=UTF-8',
		)
		expect(init.body).toBe('a=1&b=2')
	})

	test('an object body is serialised to urlencoded', async () => {
		await send('/a', { method: 'POST', data: { a: '1', b: 'x y&z', n: 5 } })
		const { init } = call()
		expect(init.headers.get('content-type')).toBe(
			'application/x-www-form-urlencoded; charset=UTF-8',
		)
		expect(String(init.body)).toBe('a=1&b=x+y%26z&n=5')
	})

	test('a FormData body sets no explicit Content-Type', async () => {
		const fd = new FormData()
		fd.append('f', 'v')
		await send('/a', { method: 'POST', data: fd })
		const { init } = call()
		expect(init.headers.has('content-type')).toBe(false)
		expect(init.body).toBe(fd)
	})

	test('the headers option overrides defaults', async () => {
		await send('/a', {
			method: 'POST',
			data: 'a=1',
			headers: { Accept: 'text/plain', 'Content-Type': 'application/json', 'X-Extra': '1' },
		})
		const h = call().init.headers
		expect(h.get('accept')).toBe('text/plain')
		expect(h.get('content-type')).toBe('application/json')
		expect(h.get('x-extra')).toBe('1')
	})
})

describe('body and query', () => {
	test('GET puts data in the query string, not the body', async () => {
		await send('/a', { data: { a: '1', b: '2' } })
		const { url, init } = call()
		expect(init.body).toBeUndefined()
		expect(init.method).toBe('GET')
		expect(init.headers.has('content-type')).toBe(false)
		expect(url).toMatch(/^\/a\?a=1&b=2&_infuse=1&_ts=\d+$/)
	})

	test('GET appends a string and FormData to an existing query without && or ?&', async () => {
		await send('/a?x=%C3%A9&', { data: '&s=1&' })
		expect(call().url).toMatch(/^\/a\?x=%C3%A9&s=1&_infuse=1&_ts=\d+$/)

		fetchMock.mockClear()
		const fd = new FormData()
		fd.append('f', 'v w')
		await send('/b?#h', { data: fd })
		const { url, init } = call()
		expect(init.body).toBeUndefined()
		expect(url).toMatch(/^\/b\?f=v\+w&_infuse=1&_ts=\d+#h$/)
		expect(url).not.toMatch(/&&|\?&/)
	})

	test('a File in a GET FormData rejects, fires error and never calls fetch', async () => {
		const fd = new FormData()
		fd.append('up', new File(['x'], 'a.txt'))
		const seen: string[] = []
		for (const n of ['start', 'error', 'end'])
			document.addEventListener(`tdi:ajax:${n}`, () => seen.push(n), { signal: ctl.signal })
		await expect(send('/a', { data: fd })).rejects.toThrow(/file/)
		expect(fetchMock).not.toHaveBeenCalled()
		expect(seen).toEqual(['start', 'error', 'end'])
	})

	test('POST keeps data out of the URL and marks the URL', async () => {
		await send('/a?q=1', { method: 'post', data: 'a=1' })
		const { url, init } = call()
		expect(init.method).toBe('POST')
		expect(url).toMatch(/^\/a\?q=1&_infuse=1&_ts=\d+$/)
	})
})

describe('init', () => {
	test('credentials defaults to same-origin and options.credentials is passed through', async () => {
		await send('/a')
		expect(call().init.credentials).toBe('same-origin')

		fetchMock.mockClear()
		await send('/a', { credentials: 'include' })
		expect(call().init.credentials).toBe('include')
	})

	test('the request does not read data-ajax-credentials itself', async () => {
		const trigger = document.getElementById('trigger')!
		trigger.setAttribute('data-ajax-credentials', 'include')
		await send('/a', { trigger })
		expect(call().init.credentials).toBe('same-origin')
	})

	test('passes mode, cache, redirect through and links a caller signal', async () => {
		const own = new AbortController()
		await send('/a', {
			mode: 'cors',
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
			signal: own.signal,
		})
		const { init } = call()
		expect(init).toMatchObject({
			mode: 'cors',
			cache: 'no-store',
			redirect: 'manual',
			credentials: 'omit',
		})
		expect(init.signal).toBeInstanceOf(AbortSignal)
	})

	test('a caller signal aborts the fetch signal, also when already aborted', async () => {
		let fetchSignal!: AbortSignal
		fetchMock.mockImplementation((_u: string, init: RequestInit) => {
			fetchSignal = init.signal!
			return new Promise((_r, rej) => {
				const fail = (): void => rej(new DOMException('x', 'AbortError'))
				if (init.signal!.aborted) fail()
				else init.signal!.addEventListener('abort', fail)
			})
		})
		const own = new AbortController()
		const p = send('/a', { signal: own.signal })
		p.catch(() => {})
		expect(fetchSignal.aborted).toBe(false)
		own.abort()
		expect(fetchSignal.aborted).toBe(true)
		await expect(p).rejects.toThrow()

		fetchMock.mockClear()
		const pre = AbortSignal.abort()
		const p2 = send('/a', { signal: pre })
		expect(fetchSignal.aborted).toBe(true)
		await expect(p2).rejects.toThrow()
	})
})

describe('events and results', () => {
	const names = ['tdi:ajax:start', 'tdi:ajax:end', 'tdi:ajax:error']

	test('fires start then end on the involved elements', async () => {
		const trigger = document.getElementById('trigger')!
		const onTrigger = record(trigger, names)
		const onDoc = record(document, names)
		let release!: () => void
		fetchMock.mockImplementation(
			() => new Promise((r) => (release = () => r(new Response(OK)))),
		)

		const p = send('/a', { trigger }, [trigger])
		expect(onTrigger).toEqual(['start'])
		await tick()
		expect(onTrigger).toEqual(['start'])
		release()
		await p
		expect(onTrigger).toEqual(['start', 'end'])
		// bubbles to document once per event, not duplicated
		expect(onDoc).toEqual(['start', 'end'])
	})

	test('end falls back to document when involved elements left the DOM during apply', async () => {
		const trigger = document.getElementById('trigger')!
		const onDoc = record(document, names)
		const onTrigger = record(trigger, names)
		respond(
			'<response><status>OK</status><update target="x"><![CDATA[<b>1</b>]]></update></response>',
		)
		document.addEventListener('tdi:ajax:update', () => trigger.remove(), {
			signal: ctl.signal,
			once: true,
		})

		await send('/a', { trigger }, [trigger])
		expect(onTrigger).toEqual(['start'])
		expect(onDoc).toEqual(['start', 'end'])
	})

	test('rejects and fires tdi:ajax:error on a non-XML body', async () => {
		respond('<html>nope', { status: 200 })
		const seen: any[] = []
		document.addEventListener('tdi:ajax:error', (e) => seen.push((e as CustomEvent).detail), {
			signal: ctl.signal,
		})
		const onDoc = record(document, names)

		await expect(send('/a')).rejects.toThrow()
		expect(onDoc).toEqual(['start', 'error', 'end'])
		expect(seen).toHaveLength(1)
		expect(seen[0].response).toBeInstanceOf(Response)
		expect(seen[0].status).toBe(200)
		expect(typeof seen[0].message).toBe('string')
	})

	test('rejects on network failure and fires tdi:ajax:error', async () => {
		fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
		const seen: any[] = []
		document.addEventListener('tdi:ajax:error', (e) => seen.push((e as CustomEvent).detail), {
			signal: ctl.signal,
		})
		const onDoc = record(document, names)

		await expect(send('/a')).rejects.toThrow('Failed to fetch')
		expect(onDoc).toEqual(['start', 'error', 'end'])
		expect(seen).toHaveLength(1)
		expect(seen[0]).toMatchObject({ response: null, status: 0, message: 'Failed to fetch' })
	})

	test('a non-OK status fires error but resolves and still applies instructions', async () => {
		respond(
			'<response><status>ERROR</status><update target="x"><![CDATA[applied]]></update></response>',
		)
		const order: string[] = []
		for (const n of ['start', 'error', 'update', 'done', 'end'])
			document.addEventListener(`tdi:ajax:${n}`, () => order.push(n), { signal: ctl.signal })

		const result = await send('/a')
		expect(order).toEqual(['start', 'error', 'update', 'done', 'end'])
		expect(document.getElementById('x')!.innerHTML).toBe('applied')
		expect(result.responses.updates).toHaveLength(1)
	})

	test('an HTTP error status with a valid OK body does not fire error', async () => {
		respond(OK, { status: 500 })
		const onDoc = record(document, names)
		await send('/a')
		expect(onDoc).toEqual(['start', 'end'])
	})

	test('abort rejects, fires end, and does not fire error', async () => {
		fetchMock.mockImplementation(
			(_u: string, init: RequestInit) =>
				new Promise((_r, rej) =>
					init.signal!.addEventListener('abort', () =>
						rej(new DOMException('aborted', 'AbortError')),
					),
				),
		)
		const onDoc = record(document, names)
		const own = new AbortController()
		const p = send('/a', { signal: own.signal })
		const settled = vi.fn()
		p.then(settled, settled)

		await tick()
		expect(onDoc).toEqual(['start'])
		expect(settled).not.toHaveBeenCalled()
		own.abort()
		await expect(p).rejects.toMatchObject({ name: 'AbortError' })
		expect(onDoc).toEqual(['start', 'end'])
	})

	test('abort while reading the body is still an abort', async () => {
		const own = new AbortController()
		fetchMock.mockImplementation(async (_u: string, init: RequestInit) => ({
			text: () =>
				new Promise((_r, rej) =>
					init.signal!.addEventListener('abort', () =>
						rej(new DOMException('a', 'AbortError')),
					),
				),
		}))
		const onDoc = record(document, names)
		const p = send('/a', { signal: own.signal })
		p.catch(() => {})
		await tick()
		own.abort()
		await expect(p).rejects.toThrow()
		expect(onDoc).toEqual(['start', 'end'])
	})

	test('resolves with response and responses', async () => {
		respond(
			'<response><status>OK</status><update target="x"><![CDATA[hi]]></update></response>',
		)
		const result = await send('/a')
		expect(result.response).toBeInstanceOf(Response)
		expect(result.response.status).toBe(200)
		expect(result.responses.updates).toHaveLength(1)
		expect(result.responses.updates[0]!.content).toBe('hi')
	})

	test('exposes the marked URL as detail.options.url on start, end and error', async () => {
		respond('<html>nope', { status: 200 })
		const urls: Record<string, unknown> = {}
		for (const n of names)
			document.addEventListener(n, (e) => (urls[n] = (e as CustomEvent).detail.options.url), {
				signal: ctl.signal,
			})
		await expect(send('/a?x=1')).rejects.toThrow()
		for (const n of names) expect(urls[n]).toMatch(/_infuse=1&_ts=\d+/)
		expect(urls['tdi:ajax:start']).toMatch(/^\/a\?x=1&/)
	})
})
