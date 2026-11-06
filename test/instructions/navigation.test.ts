import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { applyPopup, buildPopupDetail } from '../../src/instructions/popup'
import { applyReload, buildReloadDetail } from '../../src/instructions/reload'
import { applyRedirect, buildRedirectDetail } from '../../src/instructions/redirect'
import type { PopupDetail, TdiRequestOptions } from '../../src/types'

const options = {} as TdiRequestOptions

function tag(name: string, attrs: Record<string, string> = {}): Element {
	const el = new DOMParser().parseFromString(`<${name}/>`, 'application/xml').documentElement
	for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
	return el
}

let ctl = new AbortController()
// Records every event of the given names, in order
function listen(...names: string[]): string[] {
	const seen: string[] = []
	for (const n of names) document.addEventListener(n, () => seen.push(n), { signal: ctl.signal })
	return seen
}

let open: ReturnType<typeof vi.spyOn>
// jsdom's location is unforgeable (spyOn throws), so the whole object is swapped via stubGlobal
const assign = vi.fn()
const reload = vi.fn()

beforeEach(() => {
	open = vi.spyOn(window, 'open').mockReturnValue(null)
	assign.mockReset()
	reload.mockReset()
	vi.stubGlobal('location', { assign, reload })
})
afterEach(() => {
	ctl.abort()
	ctl = new AbortController()
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('popup', () => {
	test('popup opens _blank with no features in popup mode', () => {
		const seen = listen('tdi:ajax:popup')
		applyPopup(buildPopupDetail(tag('popup', { href: '/p' }), options)!)
		expect(open).toHaveBeenCalledTimes(1)
		expect(open).toHaveBeenCalledWith('/p', '_blank', '')
		expect(seen).toEqual(['tdi:ajax:popup'])
	})

	test('popup in dialog mode passes width and height features', () => {
		applyPopup(
			buildPopupDetail(
				tag('popup', { href: '/p', mode: 'dialog', width: '800', height: '0x10' }),
				options,
			)!,
		)
		expect(open).toHaveBeenCalledTimes(1)
		// "0x10" with radix 10 parses to 0; without a radix it would be 16
		expect(open).toHaveBeenCalledWith('/p', '_blank', 'width=800, height=0')
	})

	test('popup dialog defaults to 600x500', () => {
		const detail = buildPopupDetail(tag('popup', { href: '/p', mode: 'dialog' }), options)!
		expect(detail).toMatchObject({ mode: 'dialog', width: 600, height: 500 })
		applyPopup(detail)
		expect(open).toHaveBeenCalledWith('/p', '_blank', 'width=600, height=500')
	})

	test('popup detail defaults mode to popup', () => {
		expect(buildPopupDetail(tag('popup', { href: '/p' }), options)).toMatchObject({
			href: '/p',
			mode: 'popup',
		})
	})

	test('popup stores the opened window on the event detail', () => {
		const win = {} as Window
		open.mockReturnValue(win)
		let got: PopupDetail | undefined
		document.addEventListener(
			'tdi:ajax:popup',
			(e) => (got = (e as CustomEvent<PopupDetail>).detail),
			{
				signal: ctl.signal,
			},
		)
		applyPopup(buildPopupDetail(tag('popup', { href: '/p' }), options)!)
		expect(got?.popup).toBe(win)
	})

	test('popup without href is skipped', () => {
		const seen = listen('tdi:ajax:popup')
		expect(buildPopupDetail(tag('popup'), options)).toBeNull()
		expect(open).not.toHaveBeenCalled()
		expect(seen).toEqual([])
	})
})

describe('reload', () => {
	test('reload calls location.reload', () => {
		const seen = listen('tdi:ajax:reload')
		applyReload(buildReloadDetail(tag('reload'), options))
		expect(reload).toHaveBeenCalledTimes(1)
		expect(reload).toHaveBeenCalledWith()
		expect(seen).toEqual([]) // v1 fires no past-tense reload event
	})
})

describe('redirect', () => {
	test('redirect calls location.assign with href', () => {
		const seen = listen('tdi:ajax:redirect')
		applyRedirect(buildRedirectDetail(tag('redirect', { href: '/next' }), options)!)
		expect(assign).toHaveBeenCalledTimes(1)
		expect(assign).toHaveBeenCalledWith('/next')
		expect(seen).toEqual([]) // v1 fires no past-tense redirect event
	})

	test('redirect without href is skipped', () => {
		expect(buildRedirectDetail(tag('redirect'), options)).toBeNull()
		expect(assign).not.toHaveBeenCalled()
	})
})

describe('stub hygiene', () => {
	test('restore calls undo the stubs', () => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		expect(vi.isMockFunction(window.open)).toBe(false)
		expect(window.location.assign).not.toBe(assign)
		expect(window.location.reload).not.toBe(reload)
		expect(window.location.href).toContain('http')
	})
})
