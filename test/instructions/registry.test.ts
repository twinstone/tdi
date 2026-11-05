import { afterEach, describe, expect, test, vi } from 'vitest'
import { unknownEventName } from '../../src/events'
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

  test('an unknown instruction still fires its before event and runs no handler', async () => {
    const registry = new InstructionRegistry()
    const seen: unknown[] = []
    listen('tdi:ajax:beforeCartBadge', (e) => seen.push(e.detail))
    const detail = { _name: 'cart-badge' }
    await runInstruction(registry, 'cart-badge', detail, document, unknownEventName('cart-badge'))
    expect(seen).toEqual([detail])
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

  test('the name is lowercased', () => {
    expect(unknownDetail(tag(), options)._name).toBe('cart-badge')
  })
})

describe('unknownEventName', () => {
  test('hyphenated names capitalise each segment', () => {
    expect(unknownEventName('cart-badge')).toBe('tdi:ajax:beforeCartBadge')
    expect(unknownEventName('cart')).toBe('tdi:ajax:beforeCart')
  })
})
