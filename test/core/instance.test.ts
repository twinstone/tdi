import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createSenders } from '../../src/core/instance'
import { createDefaultRegistry } from '../../src/core/pipeline'
import { createTdi, type Tdi } from '../../src/index'

const OK = '<response><status>OK</status></response>'
let fetchMock: ReturnType<typeof vi.fn>
let started: Tdi[] = []

const html = (h: string): void => {
	document.body.innerHTML = h
}
const $ = <T extends Element>(sel: string): T => document.querySelector(sel) as T
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0))
const make = (...args: Parameters<typeof createTdi>): Tdi => {
	const t = createTdi(...args)
	started.push(t)
	return t
}
const respond = (body: string): void => {
	fetchMock.mockImplementation(
		async () => new Response(`<response><status>OK</status>${body}</response>`),
	)
}

beforeEach(() => {
	fetchMock = vi.fn(async () => new Response(OK, { status: 200 }))
	vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
	started.forEach((t) => t.stop())
	started = []
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
	vi.resetModules()
	delete (window as unknown as Record<string, unknown>).TDI
	delete document.documentElement.dataset.ran
	document.body.innerHTML = ''
	document.head.innerHTML = ''
})

describe('public surface', () => {
	test('exposes the D4 methods', () => {
		const t = make()
		for (const m of [
			'start',
			'stop',
			'send',
			'sendElement',
			'sendForm',
			'ajaxifyUrl',
			'registerInstruction',
		] as const) {
			expect(typeof t[m], m).toBe('function')
		}
	})

	test('send always sends and resolves to a TdiResult', async () => {
		const t = make()
		const res = await t.send('/u')
		expect(fetchMock).toHaveBeenCalledTimes(1)
		expect(String(fetchMock.mock.calls[0]![0])).toContain('/u')
		expect(res!.response).toBeInstanceOf(Response)
		expect(res.responses).toBeDefined()
	})

	test('ajaxifyUrl is the url helper', () => {
		expect(make().ajaxifyUrl('/a')).toMatch(/^\/a\?_infuse=1&_ts=\d+$/)
	})

	test('registerInstruction on the instance reaches the pipeline', async () => {
		const t = make()
		const handler = vi.fn()
		t.registerInstruction('cart-badge', handler)
		respond('<cart-badge count="3">x</cart-badge>')
		await t.send('/u')
		expect(handler).toHaveBeenCalledTimes(1)
		expect(handler.mock.calls[0]![0]).toMatchObject({ _name: 'cart-badge', count: '3' })
	})

	test('registerInstruction is per instance', async () => {
		const a = make()
		const b = make()
		const handler = vi.fn()
		a.registerInstruction('only-a', handler)
		respond('<only-a>x</only-a>')
		await b.send('/u')
		expect(handler).not.toHaveBeenCalled()
	})
})

describe('stop aborts live requests', () => {
	const hang = (): AbortSignal[] => {
		const signals: AbortSignal[] = []
		fetchMock.mockImplementation((_u: string, init: RequestInit) => {
			signals.push(init.signal!)
			return new Promise((_res, rej) =>
				init.signal!.addEventListener('abort', () => rej(init.signal!.reason)),
			)
		})
		return signals
	}

	test('stop aborts send, sendElement and sendForm in flight', async () => {
		const signals = hang()
		html('<a id="a" href="/a"></a><form id="f" action="/f"></form>')
		const t = make()
		const ps = [t.send('/s'), t.sendElement($('#a')), t.sendForm($('#f'))].map((p) =>
			p!.catch((e) => e),
		)
		await tick()
		expect(signals).toHaveLength(3)
		expect(signals.some((s) => s.aborted)).toBe(false)
		t.stop()
		const errs = await Promise.all(ps)
		expect(signals.every((s) => s.aborted)).toBe(true)
		expect(errs.map((e) => e.name)).toEqual(['AbortError', 'AbortError', 'AbortError'])
	})

	test('stop only aborts its own instance', async () => {
		const signals = hang()
		const a = make()
		const b = make()
		const pa = a.send('/a').catch((e) => e)
		const pb = b.send('/b').catch((e) => e)
		await tick()
		a.stop()
		expect((await pa).name).toBe('AbortError')
		expect(signals.map((s) => s.aborted)).toEqual([true, false])
		b.stop()
		await pb
	})

	test('a finished request leaves nothing behind for stop to abort', async () => {
		const t = make()
		await t.send('/u')
		const abort = vi.spyOn(AbortController.prototype, 'abort')
		t.stop()
		expect(abort).not.toHaveBeenCalled()
	})
})

describe('contentScripts validation', () => {
	const run = async (opt: unknown): Promise<boolean> => {
		html('<div id="t"></div>')
		respond(
			'<update target="t"><![CDATA[<script>document.documentElement.dataset.ran = "1"</script>]]></update>',
		)
		await make({ contentScripts: opt as 'all' }).send('/u')
		const ran = document.documentElement.dataset.ran === '1'
		delete document.documentElement.dataset.ran
		return ran
	}

	test('all is the default and runs content scripts without warning', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		expect(await run(undefined)).toBe(true)
		expect(await run('all')).toBe(true)
		expect(warn).not.toHaveBeenCalled()
	})

	test('nonce-only is accepted without warning and blocks un-nonced scripts', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		expect(await run('nonce-only')).toBe(false)
		expect(warn).not.toHaveBeenCalled()
	})

	test('an unrecognised value warns naming it and falls back to the strict policy', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		expect(await run('nonce_only')).toBe(false)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(String(warn.mock.calls[0]![0])).toContain('nonce_only')
		expect(String(warn.mock.calls[0]![0])).toContain('will not run')
	})
})

describe('nonce', () => {
	test('is read once from document.currentScript at module initialisation', async () => {
		const fake = { nonce: 'n-1', getAttribute: () => null }
		Object.defineProperty(document, 'currentScript', { configurable: true, get: () => fake })
		vi.resetModules()
		const mod = await import('../../src/index')
		fake.nonce = 'n-2' // later changes, and a different currentScript, must not leak in
		Object.defineProperty(document, 'currentScript', { configurable: true, get: () => null })
		const t = mod.createTdi({ contentScripts: 'nonce-only' })
		html('<div id="t"></div>')
		respond('<script>window.__ran = true</script>')
		await t.send('/u')
		const node = document.querySelector('script')!
		expect(node.getAttribute('nonce')).toBe('n-1')
		delete (document as unknown as Record<string, unknown>).currentScript
	})
})

describe('nonce option', () => {
	const withScript = (attrs: Record<string, string>, nonce?: string): (() => void) => {
		const fake = { nonce: nonce ?? '', getAttribute: (n: string) => attrs[n] ?? null }
		Object.defineProperty(document, 'currentScript', { configurable: true, get: () => fake })
		return () => delete (document as unknown as Record<string, unknown>).currentScript
	}
	const injectedNonce = async (opts: Parameters<typeof createTdi>[0]): Promise<string | null> => {
		vi.resetModules()
		const mod = await import('../../src/index')
		html('<div id="t"></div>')
		respond('<script>window.__x = 1</script>')
		await mod.createTdi(opts).send('/u')
		return document.querySelector('script')!.getAttribute('nonce')
	}

	test('createTdi({ nonce }) is used for injected scripts', async () => {
		const restore = withScript({}) // no currentScript nonce at all, like an ESM consumer
		expect(await injectedNonce({ nonce: 'from-option' })).toBe('from-option')
		restore()
	})

	test('the option wins over document.currentScript', async () => {
		const restore = withScript({}, 'from-script')
		expect(await injectedNonce({ nonce: 'from-option' })).toBe('from-option')
		restore()
	})

	test('document.currentScript is the fallback when the option is absent', async () => {
		const restore = withScript({}, 'from-script')
		expect(await injectedNonce({})).toBe('from-script')
		restore()
	})

	test('nonce-only works for an ESM consumer that passes the nonce, and refuses scripts without it', async () => {
		vi.resetModules()
		const mod = await import('../../src/index')
		const t = mod.createTdi({ contentScripts: 'nonce-only', nonce: 'n' })
		html('<div id="t"></div>')
		respond(
			'<update target="t"><![CDATA[<script nonce="n">document.documentElement.dataset.a = "1"</script><script>document.documentElement.dataset.b = "1"</script>]]></update>',
		)
		await t.send('/u')
		expect(document.documentElement.dataset.a).toBe('1')
		expect(document.documentElement.dataset.b).toBeUndefined()
		delete document.documentElement.dataset.a
	})
})

describe('global entry configuration from its script tag', () => {
	const load = async (attrs: Record<string, string>, nonce = ''): Promise<Tdi> => {
		const fake = { nonce, getAttribute: (n: string) => attrs[n] ?? null }
		Object.defineProperty(document, 'currentScript', { configurable: true, get: () => fake })
		vi.resetModules()
		await import('../../src/global')
		delete (document as unknown as Record<string, unknown>).currentScript
		const tdi = (window as unknown as { TDI: Tdi }).TDI
		started.push(tdi)
		return tdi
	}
	const ranContentScript = async (tdi: Tdi): Promise<boolean> => {
		html('<div id="t"></div>')
		respond(
			'<update target="t"><![CDATA[<script>document.documentElement.dataset.g = "1"</script>]]></update>',
		)
		await tdi.send('/u')
		const ran = document.documentElement.dataset.g === '1'
		delete document.documentElement.dataset.g
		return ran
	}

	test('without data attributes the defaults apply (all scripts run, no origin check)', async () => {
		const tdi = await load({})
		expect(await ranContentScript(tdi)).toBe(true)
		respond('')
		await expect(tdi.send('https://elsewhere.example/x')).resolves.toBeDefined()
	})

	test('data-content-scripts reaches the pipeline', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const tdi = await load({ 'data-content-scripts': 'nonce-only' }, 'n')
		expect(await ranContentScript(tdi)).toBe(false)
		expect(warn).not.toHaveBeenCalled()
	})

	test('an invalid data-content-scripts warns and falls back to nonce-only', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const tdi = await load({ 'data-content-scripts': 'nonce_only' }, 'n')
		expect(warn).toHaveBeenCalledTimes(1)
		expect(String(warn.mock.calls[0]![0])).toContain('nonce_only')
		expect(await ranContentScript(tdi)).toBe(false)
	})

	test('data-allowed-origins is a comma-separated list; same-origin always passes', async () => {
		const tdi = await load({ 'data-allowed-origins': 'https://a.example, https://b.example' })
		respond('')
		await expect(tdi.send('/same-origin')).resolves.toBeDefined()
		await expect(tdi.send('https://a.example/x')).resolves.toBeDefined()
		await expect(tdi.send('https://c.example/x')).rejects.toThrow('not in allowedOrigins')
	})

	test('an empty data-allowed-origins means same-origin only', async () => {
		const tdi = await load({ 'data-allowed-origins': '' })
		await expect(tdi.send('https://a.example/x')).rejects.toThrow('not in allowedOrigins')
	})

	test('an unparseable origin entry warns', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		await load({ 'data-allowed-origins': 'api.example.com' })
		expect(String(warn.mock.calls[0]![0])).toContain('api.example.com')
	})
})

describe('entry points', () => {
	test('the global entry sets window.TDI and auto-starts', async () => {
		vi.resetModules()
		await import('../../src/global')
		const tdi = (window as unknown as { TDI: Tdi }).TDI
		started.push(tdi)
		expect(typeof tdi.sendElement).toBe('function')
		html('<a class="tdi" href="/x">a</a>')
		$('a').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
		await tick()
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	test('the auto entry exports a started instance', async () => {
		vi.resetModules()
		const { tdi } = await import('../../src/auto')
		started.push(tdi)
		html('<a class="tdi" href="/x">a</a>')
		$('a').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
		await tick()
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	test('createTdi alone does not bind anything until start', async () => {
		make()
		html('<a class="tdi" href="/x">a</a>')
		const block = (e: Event): void => e.preventDefault() // jsdom would try to navigate
		window.addEventListener('click', block)
		$('a').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
		window.removeEventListener('click', block)
		await tick()
		expect(fetchMock).not.toHaveBeenCalled()
	})
})

describe('allowedOrigins', () => {
	const errors = (): CustomEvent[] => {
		const seen: CustomEvent[] = []
		const fn = (e: Event): void => void seen.push(e as CustomEvent)
		document.addEventListener('tdi:ajax:error', fn)
		cleanup.push(() => document.removeEventListener('tdi:ajax:error', fn))
		return seen
	}
	const cleanup: (() => void)[] = []
	afterEach(() => cleanup.splice(0).forEach((c) => c()))

	const OTHER = 'https://evil.example/x'

	test('undefined allows any origin', async () => {
		await make().send(OTHER)
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	test('a listed origin passes', async () => {
		await make({ allowedOrigins: ['https://cdn.example'] }).send('https://cdn.example/x')
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	test('same-origin passes without being listed', async () => {
		const t = make({ allowedOrigins: ['https://cdn.example'] })
		await t.send('/rel')
		await t.send(`${location.origin}/abs`)
		expect(fetchMock).toHaveBeenCalledTimes(2)
	})

	test('send to an unlisted origin rejects, fires tdi:ajax:error and does not fetch', async () => {
		const seen = errors()
		const t = make({ allowedOrigins: ['https://cdn.example'] })
		await expect(t.send(OTHER)).rejects.toThrow(/evil\.example/)
		expect(fetchMock).not.toHaveBeenCalled()
		expect(seen).toHaveLength(1)
		expect(seen[0]!.detail).toMatchObject({ response: null, status: 0 })
		expect(seen[0]!.detail.message).toContain('https://evil.example')
	})

	test('sendElement and sendForm are covered and leave no state behind', async () => {
		const seen = errors()
		html(`<a id="a" href="${OTHER}" data-related-element="#r" data-trigger-group="button"></a>
      <form id="f" action="${OTHER}"></form><div id="r"></div><button id="g"></button>`)
		const t = make({ allowedOrigins: [] })
		await expect(t.sendElement($('#a'))).rejects.toThrow()
		await expect(t.sendForm($('#f'))).rejects.toThrow()
		expect(fetchMock).not.toHaveBeenCalled()
		expect(seen).toHaveLength(2)
		expect(seen[0]!.target).toBe($('#a'))
		for (const el of ['#a', '#r', '#f'])
			expect($(el).classList.contains('loading'), el).toBe(false)
		expect($<HTMLButtonElement>('#g').disabled).toBe(false)
		expect($('#g').classList.contains('disabled')).toBe(false)
	})

	describe('<base href>', () => {
		beforeEach(() => {
			document.head.innerHTML = '<base href="https://cdn.example/">'
		})

		test('a relative URL is checked against the base origin, not location.origin', async () => {
			const t = make({ allowedOrigins: ['https://other.example'] })
			await expect(t.send('/x')).rejects.toThrow(/cdn\.example/)
			expect(fetchMock).not.toHaveBeenCalled()
		})

		test('a relative URL passes when the base origin is listed', async () => {
			await make({ allowedOrigins: ['https://cdn.example'] }).send('/x')
			expect(fetchMock).toHaveBeenCalledTimes(1)
		})

		test('the element path is checked the same way', async () => {
			html('<a id="a" href="/x"></a>')
			await expect(make({ allowedOrigins: [] }).sendElement($('#a'))).rejects.toThrow(
				/cdn\.example/,
			)
			expect(fetchMock).not.toHaveBeenCalled()
		})
	})

	describe('redirects', () => {
		const redirected = (
			finalUrl: string,
		): { text: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn> } => {
			const res = new Response(
				'<response><status>OK</status><update target="t">HACKED</update></response>',
			)
			Object.defineProperty(res, 'url', { value: finalUrl })
			const text = vi.spyOn(res, 'text')
			const cancel = vi.spyOn(res.body!, 'cancel')
			fetchMock.mockImplementation(async () => res)
			return { text, cancel }
		}

		test('a redirect from an allowed origin to an unlisted one rejects before the body is read or applied', async () => {
			html('<div id="t">safe</div>')
			const seen = errors()
			const updates = vi.fn()
			document.addEventListener('tdi:ajax:update', updates)
			cleanup.push(() => document.removeEventListener('tdi:ajax:update', updates))
			const { text, cancel } = redirected('https://evil.example/y')
			const t = make({ allowedOrigins: ['https://cdn.example'] })
			await expect(t.send('https://cdn.example/x')).rejects.toThrow(/evil\.example/)
			expect(fetchMock).toHaveBeenCalledTimes(1)
			expect(text).not.toHaveBeenCalled()
			expect(cancel).toHaveBeenCalledTimes(1)
			expect($('#t').textContent).toBe('safe')
			expect(updates).not.toHaveBeenCalled()
			expect(seen).toHaveLength(1)
			expect(seen[0]!.detail.message).toContain('https://evil.example')
		})

		test('the same holds through sendElement, which also leaves no loading state', async () => {
			html('<a id="a" href="https://cdn.example/x"></a><div id="t">safe</div>')
			redirected('https://evil.example/y')
			const t = make({ allowedOrigins: ['https://cdn.example'] })
			await expect(t.sendElement($('#a'))).rejects.toThrow()
			expect($('#t').textContent).toBe('safe')
			expect($('#a').classList.contains('loading')).toBe(false)
		})

		test('a redirect to another allowed origin succeeds and is applied', async () => {
			html('<div id="t">safe</div>')
			redirected('https://other.example/y')
			await make({ allowedOrigins: ['https://cdn.example', 'https://other.example'] }).send(
				'https://cdn.example/x',
			)
			expect($('#t').textContent).toBe('HACKED')
		})

		test('with allowedOrigins undefined a redirect anywhere still works', async () => {
			html('<div id="t">safe</div>')
			redirected('https://evil.example/y')
			await make().send('https://cdn.example/x')
			expect($('#t').textContent).toBe('HACKED')
		})
	})

	test('an unparseable allowedOrigins entry warns naming it', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		make({ allowedOrigins: ['https://ok.example', 'cdn.example'] })
		expect(warn).toHaveBeenCalledTimes(1)
		expect(String(warn.mock.calls[0]![0])).toContain('cdn.example')
	})

	test('an unparseable request URL fires the error with the real message', async () => {
		const seen = errors()
		await expect(make({ allowedOrigins: [] }).send('http://')).rejects.toThrow(TypeError)
		expect(fetchMock).not.toHaveBeenCalled()
		expect(seen).toHaveLength(1)
		expect(seen[0]!.detail.message).toMatch(/^Invalid URL/)
	})

	test('error details never carry internals: no validateOrigin on start or error', async () => {
		const details: Record<string, unknown>[] = []
		const fn = (e: Event): void => void details.push((e as CustomEvent).detail.options)
		for (const n of ['tdi:ajax:start', 'tdi:ajax:error']) document.addEventListener(n, fn)
		cleanup.push(() =>
			['tdi:ajax:start', 'tdi:ajax:error'].forEach((n) =>
				document.removeEventListener(n, fn),
			),
		)
		const res = new Response('<response><status>OK</status></response>')
		Object.defineProperty(res, 'url', { value: 'https://evil.example/y' })
		fetchMock.mockImplementation(async () => res)
		await expect(
			make({ allowedOrigins: ['https://cdn.example'] }).send('https://cdn.example/x'),
		).rejects.toThrow()
		expect(details.length).toBe(2) // start and error
		for (const o of details) expect(Object.keys(o)).not.toContain('validateOrigin')
	})

	test('a valid-only list does not warn', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		make({ allowedOrigins: ['https://ok.example'] })
		expect(warn).not.toHaveBeenCalled()
	})

	test('a refused origin is rejected before any confirm dialog', async () => {
		const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
		html(
			`<a id="a" href="${OTHER}" data-confirm="sure?"></a><form id="f" action="${OTHER}" data-confirm="sure?"></form>`,
		)
		const t = make({ allowedOrigins: [] })
		await expect(t.sendElement($('#a'))).rejects.toThrow()
		await expect(t.sendForm($('#f'))).rejects.toThrow()
		expect(confirm).not.toHaveBeenCalled()
	})

	test('a suppressed element resolves to null even for a refused origin', async () => {
		html(`<a id="a" class="disabled" href="${OTHER}"></a>`)
		expect(await make({ allowedOrigins: [] }).sendElement($('#a'))).toBeNull()
	})

	test('a delegated click to an unlisted origin is rejected without noise beyond one report', async () => {
		const err = vi.spyOn(console, 'error').mockImplementation(() => {})
		html(`<a class="tdi" href="${OTHER}">a</a>`)
		const t = make({ allowedOrigins: [] })
		t.start()
		$('a').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
		await tick()
		expect(fetchMock).not.toHaveBeenCalled()
		expect(err).toHaveBeenCalledTimes(1)
	})
})

describe('element edge cases', () => {
	test('a link with neither href nor data-ajax-url sends nothing and resolves to null', async () => {
		html('<a id="a" class="tdi">x</a>')
		expect(await make().sendElement($('#a'))).toBeNull()
		expect(fetchMock).not.toHaveBeenCalled()
	})

	test('a multiple select sends every selected option under its name', async () => {
		html(
			'<select id="s" multiple name="m" data-ajax-url="/s"><option value="a" selected>a</option><option value="b">b</option><option value="c" selected>c</option></select>',
		)
		await make().sendElement($('#s'))
		expect(String(fetchMock.mock.calls[0]![0])).toContain('/s?m%5B%5D=a&m%5B%5D=c&')
	})

	test('a multiple select inside a form sends repeated names without brackets', async () => {
		html(
			'<form id="f" action="/f"><select multiple name="m"><option value="a" selected>a</option><option value="b">b</option><option value="c" selected>c</option></select></form>',
		)
		await make().sendForm($('#f'))
		expect(String(fetchMock.mock.calls[0]![0])).toContain('/f?m=a&m=c&')
	})

	test('a pre-flight origin error for a detached element reaches document', async () => {
		const seen: unknown[] = []
		const fn = (e: Event): void => void seen.push(e.target)
		document.addEventListener('tdi:ajax:error', fn)
		try {
			const el = document.createElement('a')
			el.href = 'https://evil.example/x'
			await expect(make({ allowedOrigins: [] }).sendElement(el)).rejects.toThrow()
			expect(seen).toEqual([document])
		} finally {
			document.removeEventListener('tdi:ajax:error', fn)
		}
	})

	test('a form-associated file input (form="") is detected and the form goes out as multipart POST', async () => {
		html('<form id="f" action="/up"></form><input type="file" name="up" form="f">')
		// An unselected file input still yields an empty File entry, which querySelector('input[type=file]') on the form misses
		await make().sendForm($('#f'))
		const init = fetchMock.mock.calls[0]![1] as RequestInit
		expect(init.method).toBe('POST')
		expect(init.body).toBeInstanceOf(FormData)
		expect(String(fetchMock.mock.calls[0]![0])).not.toContain('object')
	})
})

describe('overlapping requests (v1 parity: no refcounting)', () => {
	const pending = (): (() => void)[] => {
		const releases: (() => void)[] = []
		fetchMock.mockImplementation(
			() => new Promise((res) => releases.push(() => res(new Response(OK)))),
		)
		return releases
	}

	test('the first completion clears loading from an element a second request still involves', async () => {
		const releases = pending()
		html(
			'<a id="a" href="/a" data-related-element="#r"></a><a id="b" href="/b" data-related-element="#r"></a><div id="r"></div>',
		)
		const s = createSenders(createDefaultRegistry(), new Set())
		const first = s.sendElement($('#a'))
		const second = s.sendElement($('#b'))
		await tick()
		expect($('#r').classList.contains('loading')).toBe(true)
		releases[0]!()
		await first
		expect($('#r').classList.contains('loading')).toBe(false) // known limitation: #b's request is still in flight
		expect($('#b').classList.contains('loading')).toBe(true)
		releases[1]!()
		await second
		expect($('#b').classList.contains('loading')).toBe(false)
	})

	test('the first completion re-enables a shared trigger group while the second is in flight', async () => {
		const releases = pending()
		html(
			'<a id="a" href="/a" data-trigger-group="button"></a><a id="b" href="/b" data-trigger-group="button"></a><button id="g"></button>',
		)
		const s = createSenders(createDefaultRegistry(), new Set())
		const first = s.sendElement($('#a'))
		await tick()
		expect($<HTMLButtonElement>('#g').disabled).toBe(true)
		const second = s.sendElement($('#b'))
		await tick()
		releases[0]!()
		await first
		expect($<HTMLButtonElement>('#g').disabled).toBe(false) // known limitation: restored although #b is still in flight
		releases[1]!()
		await second
		expect($<HTMLButtonElement>('#g').disabled).toBe(false)
	})
})
