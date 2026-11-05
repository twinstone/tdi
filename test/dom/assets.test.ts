import { afterEach, describe, expect, test } from 'vitest'
import { injectInlineScript, injectScript, injectStyle } from '../../src/dom/assets'

afterEach(() => {
  document.head.innerHTML = ''
})

describe('injectScript', () => {
  test('injectScript appends to head and resolves on load', async () => {
    const promise = injectScript('/a.js', { id: 'a' })
    const el = document.head.querySelector('script')!
    expect(el.getAttribute('src')).toBe('/a.js')
    expect(el.id).toBe('a')
    expect(el.parentElement).toBe(document.head)
    el.dispatchEvent(new Event('load'))
    await expect(promise).resolves.toBe(el)
  })

  test('injectScript sets the nonce attribute and property', () => {
    void injectScript('/a.js', { nonce: 'abc' })
    const el = document.head.querySelector('script')!
    expect(el.getAttribute('nonce')).toBe('abc')
    expect(el.nonce).toBe('abc')
  })

  test('injectScript resolves rather than hanging when the script fails to load', async () => {
    const promise = injectScript('/missing.js', {})
    const el = document.head.querySelector('script')!
    el.dispatchEvent(new Event('error'))
    await expect(promise).resolves.toBe(el)
  })

  test('injectScript stays pending until load or error fires', async () => {
    let settled = false
    const promise = injectScript('/a.js', {}).then(() => {
      settled = true
    })
    await Promise.resolve()
    await new Promise((r) => setTimeout(r, 0))
    expect(settled).toBe(false)
    document.head.querySelector('script')!.dispatchEvent(new Event('load'))
    await promise
    expect(settled).toBe(true)
  })
})

describe('injectInlineScript', () => {
  test('injectInlineScript suffixes the id with _inline', () => {
    const el = injectInlineScript('window.x = 1', { id: 'foo', nonce: 'n1' })
    expect(el.id).toBe('foo_inline')
    expect(el.textContent).toBe('window.x = 1')
    expect(el.getAttribute('nonce')).toBe('n1')
    expect(el.nonce).toBe('n1')
    expect(el.parentElement).toBe(document.head)
  })

  test('injectInlineScript sets no id when none is given', () => {
    const el = injectInlineScript('1', {})
    expect(el.hasAttribute('id')).toBe(false)
  })
})

describe('injectStyle', () => {
  test('injectStyle appends a link with media defaulting to screen', async () => {
    const promise = injectStyle('/a.css', { id: 's', nonce: 'n2' })
    const el = document.head.querySelector('link')!
    expect(el.rel).toBe('stylesheet')
    expect(el.getAttribute('href')).toBe('/a.css')
    expect(el.media).toBe('screen')
    expect(el.id).toBe('s')
    expect(el.getAttribute('nonce')).toBe('n2')
    expect(el.nonce).toBe('n2')
    el.dispatchEvent(new Event('load'))
    await expect(promise).resolves.toBe(el)
  })

  test('injectStyle honours an explicit media', () => {
    void injectStyle('/a.css', { media: 'print' })
    expect(document.head.querySelector('link')!.media).toBe('print')
  })

  test('injectStyle resolves rather than hanging when the stylesheet fails to load', async () => {
    const promise = injectStyle('/missing.css', {})
    const el = document.head.querySelector('link')!
    el.dispatchEvent(new Event('error'))
    await expect(promise).resolves.toBe(el)
  })
})
