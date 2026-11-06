import { afterEach, describe, expect, test, vi } from 'vitest'
import { unknownDoneEventName, unknownEventName } from '../../src/events'
import { InstructionRegistry, runInstruction, unknownDetail } from '../../src/instructions/registry'
import type { TdiRequestOptions } from '../../src/types'

const options = {} as TdiRequestOptions
const listeners: Array<[string, EventListener]> = []
function listen(name: string, fn: (e: CustomEvent) => void) {
	document.addEventListener(name, fn as EventListener)
	listeners.push([name, fn as EventListener])
}
afterEach(() => {
	for (const [n, fn] of listeners.splice(0)) document.removeEventListener(n, fn)
})

describe('runInstruction', () => {
	test('a registered handler runs as the default action', async () => {
		const registry = new InstructionRegistry()
		const handler = vi.fn()
		registry.register('update', handler)
		const detail = { x: 1 }
		await runInstruction(registry, 'update', detail, document, 'tdi:ajax:beforeUpdate')
		expect(handler).toHaveBeenCalledWith(detail)
	})

	test('the before event fires before the handler runs', async () => {
		const registry = new InstructionRegistry()
		const order: string[] = []
		listen('tdi:ajax:beforeUpdate', () => order.push('event'))
		registry.register('update', () => void order.push('handler'))
		await runInstruction(registry, 'update', {}, document, 'tdi:ajax:beforeUpdate')
		expect(order).toEqual(['event', 'handler'])
	})

	test('preventDefault on the before event suppresses the handler', async () => {
		const registry = new InstructionRegistry()
		const handler = vi.fn()
		registry.register('update', handler)
		listen('tdi:ajax:beforeUpdate', (e) => e.preventDefault())
		await runInstruction(registry, 'update', {}, document, 'tdi:ajax:beforeUpdate')
		expect(handler).not.toHaveBeenCalled()
	})

	test('a rejecting handler rejects runInstruction', async () => {
		const registry = new InstructionRegistry()
		registry.register('update', async () => {
			throw new Error('boom')
		})
		await expect(
			runInstruction(registry, 'update', {}, document, 'tdi:ajax:beforeUpdate'),
		).rejects.toThrow('boom')
	})

	test('an async handler is awaited', async () => {
		const registry = new InstructionRegistry()
		let done = false
		registry.register('script', async () => {
			await new Promise((r) => setTimeout(r, 5))
			done = true
		})
		await runInstruction(registry, 'script', {}, document, 'tdi:ajax:beforeScript')
		expect(done).toBe(true)
	})

	test('instruction names resolve case-insensitively', async () => {
		const registry = new InstructionRegistry()
		const handler = vi.fn()
		registry.register('update', handler)
		await runInstruction(registry, 'UPDATE', {}, document, 'tdi:ajax:beforeUpdate')
		expect(handler).toHaveBeenCalledOnce()
	})

	test('an unknown instruction still fires its before event', async () => {
		const registry = new InstructionRegistry()
		const seen: unknown[] = []
		listen('tdi:ajax:beforeCartBadge', (e) => seen.push(e.detail))
		const detail = { _name: 'cart-badge' }
		await runInstruction(
			registry,
			'cart-badge',
			detail,
			document,
			unknownEventName('cart-badge'),
		)
		expect(seen).toEqual([detail])
	})
})

describe('unknown instruction past-tense event', () => {
	test('fires tdi:ajax:<name> after the before event when no handler exists', async () => {
		const registry = new InstructionRegistry()
		const order: string[] = []
		const detail = { _name: 'cart-badge' }
		listen('tdi:ajax:beforeCartBadge', () => order.push('before'))
		listen('tdi:ajax:cart-badge', (e) => order.push(e.detail === detail ? 'done' : 'wrong'))
		await runInstruction(
			registry,
			'Cart-Badge',
			detail,
			document,
			unknownEventName('cart-badge'),
		)
		expect(order).toEqual(['before', 'done'])
	})

	test('is not fired when the before event is prevented', async () => {
		const registry = new InstructionRegistry()
		const done = vi.fn()
		listen('tdi:ajax:beforeCartBadge', (e) => e.preventDefault())
		listen(unknownDoneEventName('cart-badge'), done)
		await runInstruction(registry, 'cart-badge', {}, document, unknownEventName('cart-badge'))
		expect(done).not.toHaveBeenCalled()
	})

	test('is not fired when a handler is registered', async () => {
		const registry = new InstructionRegistry()
		registry.register('update', vi.fn())
		const done = vi.fn()
		listen('tdi:ajax:update', done)
		await runInstruction(registry, 'update', {}, document, 'tdi:ajax:beforeUpdate')
		expect(done).not.toHaveBeenCalled()
	})
})

describe('InstructionRegistry', () => {
	test('register overrides a built-in of the same name', () => {
		const registry = new InstructionRegistry()
		const builtin = vi.fn()
		const custom = vi.fn()
		registry.register('update', builtin)
		registry.register('update', custom)
		expect(registry.resolve('update')).toBe(custom)
	})

	test('resolve returns undefined for an unregistered name', () => {
		expect(new InstructionRegistry().resolve('nope')).toBeUndefined()
	})

	test('register normalises the name to lowercase', () => {
		const registry = new InstructionRegistry()
		const handler = vi.fn()
		registry.register('Cart-Badge', handler)
		expect(registry.resolve('cart-badge')).toBe(handler)
	})
})

describe('unknownDetail', () => {
	const tag = () => {
		const doc = new DOMParser().parseFromString(
			'<response><Cart-Badge count="3" label="x"> hi </Cart-Badge></response>',
			'application/xml',
		)
		return doc.documentElement.firstElementChild as Element
	}

	test('unknown instruction attributes are copied onto detail', () => {
		const el = tag()
		const d = unknownDetail(el, options)
		expect(d).toMatchObject({ count: '3', label: 'x', contents: 'hi', options })
		expect(d.tag).toBe(el)
	})

	test('structural keys win over colliding attributes', () => {
		const el = new DOMParser().parseFromString(
			'<r><foo options="x" tag="y" _name="z" contents="w"/></r>',
			'application/xml',
		).documentElement.firstElementChild as Element
		const d = unknownDetail(el, options)
		expect(d.options).toBe(options)
		expect(d.tag).toBe(el)
		expect(d._name).toBe('foo')
		expect(d.contents).toBe('')
	})

	test('the name is lowercased', () => {
		expect(unknownDetail(tag(), options)._name).toBe('cart-badge')
	})
})

describe('unknownEventName', () => {
	test('hyphenated names capitalise each segment', () => {
		expect(unknownEventName('cart-badge')).toBe('tdi:ajax:beforeCartBadge')
		expect(unknownEventName('cart')).toBe('tdi:ajax:beforeCart')
	})

	test('mixed-case names produce the same event names as lowercase', () => {
		expect(unknownEventName('CART-Badge')).toBe(unknownEventName('cart-badge'))
		expect(unknownEventName('UPDATE')).toBe('tdi:ajax:beforeUpdate')
		expect(unknownDoneEventName('CART-Badge')).toBe('tdi:ajax:cart-badge')
	})
})
