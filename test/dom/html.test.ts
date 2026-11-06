import { afterEach, describe, expect, test, vi } from 'vitest'
import { parseFragment, runContentScripts } from '../../src/dom/html'

// Scripts run in jsdom's own context, not the Node global, so they report through the DOM
const order = () => document.documentElement.dataset.order ?? ''
const mark = (v: string) =>
	`<script>document.documentElement.dataset.order=(document.documentElement.dataset.order||'')+'${v}'</script>`

afterEach(() => {
	document.head.innerHTML = ''
	document.body.innerHTML = ''
	delete document.documentElement.dataset.order
})

describe('parseFragment', () => {
	test('parseFragment preserves table rows', () => {
		const frag = parseFragment('<tr><td>a</td></tr>')
		expect(frag.firstElementChild?.tagName).toBe('TR')
		// Control: a div drops the row, which is why <template> is required
		const div = document.createElement('div')
		div.innerHTML = '<tr><td>a</td></tr>'
		expect(div.querySelector('tr')).toBeNull()
	})
})

describe('runContentScripts', () => {
	// Platform canary only: never calls our code, pins the native behaviour D10 compensates for
	test('scripts inserted via innerHTML do not self-execute', async () => {
		const div = document.createElement('div')
		div.innerHTML = mark('x')
		document.body.appendChild(div)
		expect(order()).toBe('')
		// Positive control: the same markup through runContentScripts does execute
		await runContentScripts(parseFragment(mark('x')))
		expect(order()).toBe('x')
	})

	test('runContentScripts executes inline scripts in document order', async () => {
		const frag = parseFragment(`${mark('a')}<p>x</p>${mark('b')}`)
		await runContentScripts(frag)
		expect(order()).toBe('ab')
	})

	test('runContentScripts removes the inert original nodes', async () => {
		const frag = parseFragment(`<p>x</p>${mark('a')}`)
		await runContentScripts(frag)
		expect(frag.querySelector('script')).toBeNull()
		expect(order()).toBe('a')
	})

	test('runContentScripts leaves non-JavaScript script blocks alone', async () => {
		const frag = parseFragment('<script type="application/json">{"a":1}</script>')
		await runContentScripts(frag)
		expect(frag.querySelector('script')?.textContent).toBe('{"a":1}')
		expect(document.head.querySelector('script')).toBeNull()
	})

	test('runContentScripts awaits src scripts before resolving', async () => {
		const frag = parseFragment(`<script src="/a.js"></script>${mark('inline')}`)
		let done = false
		const p = runContentScripts(frag).then(() => {
			done = true
		})
		await Promise.resolve()
		const el = document.head.querySelector('script[src="/a.js"]')!
		expect(el).not.toBeNull()
		// The next script must not run before the src script settles
		expect(order()).toBe('')
		expect(done).toBe(false)
		el.dispatchEvent(new Event('load'))
		await p
		expect(order()).toBe('inline')
		expect(done).toBe(true)
	})

	test('runContentScripts continues after a src script errors', async () => {
		const frag = parseFragment(`<script src="/a.js"></script>${mark('after')}`)
		const p = runContentScripts(frag)
		await Promise.resolve()
		document.head.querySelector('script')!.dispatchEvent(new Event('error'))
		await p
		expect(order()).toBe('after')
	})

	test('runContentScripts propagates the nonce', async () => {
		const frag = parseFragment(mark('n'))
		await runContentScripts(frag, { nonce: 'abc' })
		expect(document.head.querySelector('script')!.getAttribute('nonce')).toBe('abc')
	})

	test("runContentScripts inherits the original script's nonce when TDI has none", async () => {
		await runContentScripts(parseFragment('<script nonce="srv">1</script>'))
		expect(document.head.querySelector('script')!.getAttribute('nonce')).toBe('srv')
	})

	test("runContentScripts prefers TDI's nonce over the original's", async () => {
		await runContentScripts(parseFragment('<script nonce="srv">1</script>'), { nonce: 'tdi' })
		expect(document.head.querySelector('script')!.getAttribute('nonce')).toBe('tdi')
	})

	test('runContentScripts adds no nonce when neither side has one', async () => {
		await runContentScripts(parseFragment('<script>1</script>'))
		expect(document.head.querySelector('script')!.hasAttribute('nonce')).toBe(false)
	})

	test('runContentScripts does not carry id across (v1 parity)', async () => {
		await runContentScripts(parseFragment('<script id="mine">1</script>'))
		expect(document.head.querySelector('script')!.hasAttribute('id')).toBe(false)
	})

	test('runContentScripts propagates the nonce to src scripts', async () => {
		const p = runContentScripts(parseFragment('<script src="/a.js"></script>'), {
			nonce: 'abc',
		})
		await Promise.resolve()
		const el = document.head.querySelector('script')!
		expect(el.getAttribute('nonce')).toBe('abc')
		el.dispatchEvent(new Event('load'))
		await p
	})

	test('runContentScripts copies integrity, crossorigin, referrerpolicy and data-*, not async/defer', async () => {
		const frag = parseFragment(
			'<script src="/a.js" integrity="sha384-x" crossorigin="anonymous" referrerpolicy="no-referrer" data-k="v" async defer></script>',
		)
		const p = runContentScripts(frag)
		await Promise.resolve()
		const el = document.head.querySelector('script')!
		expect(el.getAttribute('integrity')).toBe('sha384-x')
		expect(el.getAttribute('crossorigin')).toBe('anonymous')
		expect(el.getAttribute('referrerpolicy')).toBe('no-referrer')
		expect(el.dataset.k).toBe('v')
		expect(el.hasAttribute('async')).toBe(false)
		expect(el.hasAttribute('defer')).toBe(false)
		el.dispatchEvent(new Event('load'))
		await p
	})

	test('runContentScripts copies data-* onto inline scripts', async () => {
		await runContentScripts(parseFragment('<script data-k="v">1</script>'))
		expect(document.head.querySelector('script')!.dataset.k).toBe('v')
	})

	test('runContentScripts keeps going after an inline script throws', async () => {
		const frag = parseFragment(`<script>throw new Error('boom')</script>${mark('after')}`)
		// jsdom reports the uncaught error on window; swallow it so vitest does not flag it
		const swallow = (e: Event) => e.preventDefault()
		window.addEventListener('error', swallow)
		await runContentScripts(frag)
		window.removeEventListener('error', swallow)
		expect(order()).toBe('after')
	})

	test('runContentScripts warns about and skips type=module scripts', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const frag = parseFragment('<script type="module" src="/m.js"></script>')
		await runContentScripts(frag)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('/m.js'))
		expect(document.head.querySelector('script')).toBeNull()
		warn.mockRestore()
	})

	describe('policy', () => {
		const nonceMark = (n: string, v: string) =>
			mark(v).replace('<script>', `<script nonce="${n}">`)

		test("'all' (default) replays scripts without a nonce", async () => {
			await runContentScripts(parseFragment(mark('a')), { nonce: 'n1' })
			expect(order()).toBe('a')
		})

		test("'nonce-only' replays only scripts carrying the page nonce", async () => {
			const frag = parseFragment(
				`${mark('plain')}${nonceMark('n1', 'ok')}${nonceMark('other', 'bad')}`,
			)
			await runContentScripts(frag, { nonce: 'n1', policy: 'nonce-only' })
			expect(order()).toBe('ok')
		})

		test("'nonce-only' skips everything when no page nonce is known", async () => {
			await runContentScripts(parseFragment(nonceMark('n1', 'x')), { policy: 'nonce-only' })
			expect(order()).toBe('')
		})

		test('jsdom nonce attribute/property probe', () => {
			const el = parseFragment(nonceMark('n1', 'x')).querySelector('script')!
			expect([el.getAttribute('nonce'), el.nonce]).toEqual(['n1', 'n1'])
		})
	})
})
