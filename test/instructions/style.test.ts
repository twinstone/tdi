import { afterEach, describe, expect, test } from 'vitest'
import { applyStyle, buildStyleDetail } from '../../src/instructions/style'
import type { StyleDetail, TdiRequestOptions } from '../../src/types'

const options = {} as TdiRequestOptions

function tag(attrs: Record<string, string>): Element {
  const el = new DOMParser().parseFromString('<style/>', 'application/xml').documentElement
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}

const link = (): HTMLLinkElement | null => document.head.querySelector('link')
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0))
let ctl = new AbortController()

function listen(): StyleDetail[] {
  const seen: StyleDetail[] = []
  document.addEventListener('tdi:ajax:style', (e) => seen.push((e as CustomEvent<StyleDetail>).detail), {
    signal: ctl.signal,
  })
  return seen
}

afterEach(() => {
  ctl.abort()
  ctl = new AbortController()
  document.body.innerHTML = ''
  document.head.innerHTML = ''
})

describe('style', () => {
  test('buildStyleDetail reads src and id', () => {
    const d = buildStyleDetail(tag({ src: '/a.css', id: 'a' }), options)
    expect([d.style_src, d.style_id]).toEqual(['/a.css', 'a'])
  })

  test('style injection sets style_node and fires tdi:ajax:style', async () => {
    const seen = listen()
    const detail = buildStyleDetail(tag({ src: '/a.css', id: 'a' }), options)
    const done = applyStyle(detail)
    await tick()
    expect(seen.length).toBe(0) // not before the sheet settles
    link()!.dispatchEvent(new Event('load'))
    await done
    expect(detail.style_node).toBe(link())
    expect(link()!.id).toBe('a')
    expect(seen.length).toBe(1)
    expect(seen[0]).toBe(detail)
  })

  test('an id already present is not downloaded again, yet it settles and fires', async () => {
    document.body.innerHTML = '<div id="a"></div>'
    const seen = listen()
    const detail = buildStyleDetail(tag({ src: '/a.css', id: 'a' }), options)
    await applyStyle(detail) // would hang if the dedupe path never settled
    expect(link()).toBeNull()
    expect(detail.style_node).toBeUndefined()
    expect(seen.length).toBe(1)
  })

  test('a failing stylesheet still settles and fires', async () => {
    const seen = listen()
    const detail = buildStyleDetail(tag({ src: '/missing.css' }), options)
    const done = applyStyle(detail)
    await tick()
    link()!.dispatchEvent(new Event('error'))
    await done
    expect(seen.length).toBe(1)
    expect(detail.style_node).toBe(link())
  })

  test('an empty src leaves style_node undefined rather than null and still fires', async () => {
    const seen = listen()
    const detail = buildStyleDetail(tag({}), options)
    await applyStyle(detail)
    expect('style_node' in detail && detail.style_node === null).toBe(false)
    expect(detail.style_node).toBeUndefined()
    expect(seen.length).toBe(1)
  })

  test('the nonce is applied to the link', async () => {
    const detail = buildStyleDetail(tag({ src: '/a.css' }), options)
    const done = applyStyle(detail, { nonce: 'n1' })
    await tick()
    link()!.dispatchEvent(new Event('load'))
    await done
    expect(detail.style_node!.getAttribute('nonce')).toBe('n1')
  })
})
