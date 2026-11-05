import { describe, expect, test } from 'vitest'
import { dispatch } from '../src/events'

describe('dispatch', () => {
  test('dispatched events bubble to document', () => {
    const el = document.createElement('div')
    document.body.append(el)
    let seen = false
    const on = () => (seen = true)
    document.addEventListener('tdi:test', on)
    dispatch(el, 'tdi:test', {})
    document.removeEventListener('tdi:test', on)
    el.remove()
    expect(seen).toBe(true)
  })

  test('cancelable dispatch returns false when a listener calls preventDefault', () => {
    const el = document.createElement('div')
    el.addEventListener('tdi:test', (e) => e.preventDefault())
    expect(dispatch(el, 'tdi:test', {}, true)).toBe(false)
  })

  test('non-cancelable dispatch always returns true', () => {
    const el = document.createElement('div')
    el.addEventListener('tdi:test', (e) => e.preventDefault())
    expect(dispatch(el, 'tdi:test', {})).toBe(true)
  })

  test('detail is carried on evt.detail', () => {
    const el = document.createElement('div')
    const detail = { a: 1 }
    let got: unknown
    el.addEventListener('tdi:test', (e) => (got = (e as CustomEvent).detail))
    dispatch(el, 'tdi:test', detail)
    expect(got).toBe(detail)
  })
})
