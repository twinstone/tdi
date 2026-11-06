import { afterEach, describe, expect, test } from 'vitest'
import { optionsFromElement } from '../../src/core/options'
import { involvedElements, relatedElements } from '../../src/dom/elements'

function mount(html: string): HTMLElement {
  document.body.innerHTML = html
  return document.body.firstElementChild as HTMLElement
}
afterEach(() => {
  document.body.innerHTML = ''
})

describe('optionsFromElement', () => {
  test('url prefers data-ajax-url over href and action', () => {
    const el = mount('<a data-ajax-url="/d" href="/h" action="/a"></a>')
    expect(optionsFromElement(el).url).toBe('/d')
    el.removeAttribute('data-ajax-url')
    expect(optionsFromElement(el).url).toBe('/h')
    el.removeAttribute('href')
    expect(optionsFromElement(el).url).toBe('/a')
  })

  test('method prefers data-ajax-method over the method attribute', () => {
    const el = mount('<form data-ajax-method="PUT" method="post"></form>')
    expect(optionsFromElement(el).method).toBe('PUT')
    el.removeAttribute('data-ajax-method')
    expect(optionsFromElement(el).method).toBe('post')
    el.removeAttribute('method')
    expect(optionsFromElement(el).method).toBeUndefined()
  })

  test('an unchecked checkbox sends 0 for its name', () => {
    const el = mount('<input type="checkbox" name="c" value="yes" href="/u">') as HTMLInputElement
    expect(optionsFromElement(el).data).toEqual({ c: 0 })
    el.checked = true
    expect(optionsFromElement(el).data).toEqual({ c: 'yes' })
  })

  test('a named element sends its value; an unnamed one sends no data', () => {
    expect(optionsFromElement(mount('<input name="q" value="v" href="/u">')).data).toEqual({ q: 'v' })
    expect(optionsFromElement(mount('<input value="v" href="/u">')).data).toEqual({})
  })

  test('an element with no url falls back to its value', () => {
    const sel = mount('<select><option value="/one">1</option><option value="/two" selected>2</option></select>')
    expect(optionsFromElement(sel).url).toBe('/two')
    // an attribute url wins over the value
    expect(optionsFromElement(mount('<input value="/v" href="/h">')).url).toBe('/h')
    // an empty url attribute does not block the fallback
    expect(optionsFromElement(mount('<input value="/v" data-ajax-url="">')).url).toBe('/v')
  })

  test('the disabled attribute and the disabled class both suppress', () => {
    expect(optionsFromElement(mount('<button href="/u"></button>')).suppressed).toBe(false)
    expect(optionsFromElement(mount('<button disabled></button>')).suppressed).toBe(true)
    expect(optionsFromElement(mount('<a class="x disabled"></a>')).suppressed).toBe(true)
    expect(optionsFromElement(mount('<a class="notdisabled"></a>')).suppressed).toBe(false)
  })

  test('data-ajax-credentials maps to credentials', () => {
    const el = mount('<a href="/u" data-ajax-credentials="include"></a>')
    expect(optionsFromElement(el).credentials).toBe('include')
    el.setAttribute('data-ajax-credentials', 'omit')
    expect(optionsFromElement(el).credentials).toBe('omit')
    el.removeAttribute('data-ajax-credentials')
    expect('credentials' in optionsFromElement(el)).toBe(false)
    el.setAttribute('data-ajax-credentials', 'bogus')
    expect('credentials' in optionsFromElement(el)).toBe(false)
  })

  test('data-ajax-xhr-fields is ignored', () => {
    const el = mount('<a href="/u" data-ajax-xhr-fields=\'{"withCredentials":true}\'></a>')
    expect('credentials' in optionsFromElement(el)).toBe(false)
  })

  test('carries the trigger and data-confirm', () => {
    const el = mount('<a href="/u" data-confirm="Sure?"></a>')
    const o = optionsFromElement(el)
    expect(o.trigger).toBe(el)
    expect(o.confirm).toBe('Sure?')
    expect(optionsFromElement(mount('<a></a>')).confirm).toBeUndefined()
  })
})

describe('related elements', () => {
  test('related elements come from data-related-element and data-related-ancestor', () => {
    const el = mount(
      '<section class="box"><a id="t" data-related-element=".peer" data-related-ancestor=".box"></a></section>' +
        '<p class="peer" id="p1"></p><p class="peer" id="p2"></p><p id="other"></p>',
    )
    const t = document.getElementById('t')!
    const ids = relatedElements(t).map((e) => e.id || e.className)
    expect(ids).toEqual(['box', 'p1', 'p2'])
    expect(involvedElements(t)).toEqual([t, ...relatedElements(t)])
    expect(el).toBeTruthy()
  })

  test('involved is just the trigger when nothing is related', () => {
    const t = mount('<a id="t"></a>')
    expect(relatedElements(t)).toEqual([])
    expect(involvedElements(t)).toEqual([t])
  })

  test('a missing ancestor match adds nothing', () => {
    const t = mount('<a data-related-ancestor=".nope"></a>')
    expect(relatedElements(t)).toEqual([])
  })

  test('rel is ignored', () => {
    mount('<div id="wrap"><a id="t" rel="#target, #wrap"></a></div><div id="target"></div>')
    const a = document.getElementById('t')!
    expect(relatedElements(a)).toEqual([])
    expect(involvedElements(a)).toEqual([a])
  })
})
