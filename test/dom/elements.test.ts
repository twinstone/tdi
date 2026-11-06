import { afterEach, describe, expect, test} from 'vitest'
import { disableTriggerGroup, setLoading } from '../../src/dom/elements'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('setLoading', () => {
  function observe(el: Element): MutationObserver {
    const o = new MutationObserver(() => {})
    o.observe(el, { attributes: true, attributeOldValue: true })
    return o
  }
  // every class value the element passed through, in order
  const classHistory = (el: Element, o: MutationObserver): (string | null)[] => [
    ...o.takeRecords().map((r) => r.oldValue),
    el.getAttribute('class'),
  ]

  test('setLoading toggles only the loading class', () => {
    document.body.innerHTML = '<a class="keep"></a><b></b><i></i>'
    const [a, b, untouched] = [...document.body.children] as Element[]
    const oa = observe(a!)
    const ob = observe(b!)
    const ou = observe(untouched!)

    setLoading([a!, b!], true)
    expect(a!.className).toBe('keep loading')
    expect(b!.className).toBe('loading')
    expect(oa.takeRecords()).toHaveLength(1)
    expect(ob.takeRecords()).toHaveLength(1)

    setLoading([a!, b!], false)
    expect(a!.className).toBe('keep')
    expect(b!.className).toBe('')
    expect(classHistory(a!, oa)).toEqual(['keep loading', 'keep'])
    // only the passed elements were touched
    expect(ou.takeRecords()).toHaveLength(0)
  })

  test('never applies loading-target', () => {
    document.body.innerHTML = '<a></a>'
    const a = document.body.firstElementChild!
    const o = observe(a)
    setLoading([a], true)
    const seen = [...o.takeRecords().map((r) => r.oldValue), a.getAttribute('class')]
    expect(seen.join(' ')).not.toContain('loading-target')
    expect([...a.classList]).toEqual(['loading'])
  })
})

describe('disableTriggerGroup', () => {
  const html =
    '<button id="t" data-trigger-group=".g"></button>' +
    '<button class="g" id="g1"></button>' +
    '<button class="g" id="g2"></button>' +
    '<button class="g" id="attr" disabled></button>' +
    '<button class="g disabled" id="cls"></button>' +
    '<button id="outside"></button>'
  const $ = (id: string) => document.getElementById(id) as HTMLButtonElement

  test('disableTriggerGroup disables every matched element and the undo restores only what it disabled', () => {
    document.body.innerHTML = html
    const undo = disableTriggerGroup($('t'))

    expect($('g1').disabled).toBe(true)
    expect($('g1').classList.contains('disabled')).toBe(true)
    expect($('g2').disabled).toBe(true)
    expect($('outside').disabled).toBe(false)
    expect($('t').disabled).toBe(false)

    undo()
    expect($('g1').disabled).toBe(false)
    expect($('g1').classList.contains('disabled')).toBe(false)
    expect($('g2').disabled).toBe(false)
    // disabled by the page beforehand: still disabled, class state unchanged
    expect($('attr').disabled).toBe(true)
    expect($('attr').classList.contains('disabled')).toBe(false)
    expect($('cls').classList.contains('disabled')).toBe(true)
    expect($('cls').disabled).toBe(false)
  })

  test('the undo writes only to elements it changed', () => {
    document.body.innerHTML = html
    const undo = disableTriggerGroup($('t'))
    const observers = ['attr', 'cls', 'outside'].map((id) => {
      const o = new MutationObserver(() => {})
      o.observe($(id), { attributes: true })
      return o
    })
    undo()
    for (const o of observers) expect(o.takeRecords()).toHaveLength(0)
  })

  test('the undo is idempotent and does not re-enable what the page disabled in between', () => {
    document.body.innerHTML = html
    const undo = disableTriggerGroup($('t'))
    undo()
    $('g1').disabled = true // page disables it again after the request
    undo()
    expect($('g1').disabled).toBe(true)
  })

  test('a trigger without data-trigger-group, or matching nothing, is a no-op', () => {
    document.body.innerHTML = '<button id="a"></button><button id="b" data-trigger-group=".none"></button>'
    expect(() => disableTriggerGroup($('a'))()).not.toThrow()
    expect(() => disableTriggerGroup($('b'))()).not.toThrow()
    expect($('a').disabled).toBe(false)
  })

  test('non-form elements get the disabled class but no disabled attribute', () => {
    document.body.innerHTML = '<a id="t" data-trigger-group=".g"></a><a class="g" id="x"></a>'
    const undo = disableTriggerGroup($('t'))
    expect($('x').classList.contains('disabled')).toBe(true)
    undo()
    expect($('x').hasAttribute('class')).toBe(true)
    expect($('x').classList.contains('disabled')).toBe(false)
  })
})
