import { afterEach, describe, expect, test } from 'vitest'
import { applyInsert, buildInsertDetail } from '../../src/instructions/insert'
import type { InsertDetail, TdiRequestOptions } from '../../src/types'

// Scripts run in jsdom's own context, so they report through the DOM
const options = {} as TdiRequestOptions

// Builds an <insert> tag the way the XML parser would
function tag(attrs: Record<string, string>, body = ''): Element {
  const el = new DOMParser().parseFromString('<insert/>', 'application/xml').documentElement
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  el.textContent = body
  return el
}

async function run(
  attrs: Record<string, string>,
  body = '',
  scripts?: { nonce?: string; policy?: 'all' | 'nonce-only' },
): Promise<InsertDetail> {
  const detail = buildInsertDetail(tag(attrs, body), options)
  if (!detail) throw new Error('no target')
  await applyInsert(detail, scripts)
  return detail
}

afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  delete document.documentElement.dataset.ran
})

describe('insert', () => {
  test('inserts after the target by default', async () => {
    document.body.innerHTML = '<div id="a"></div><i></i>'
    await run({ target: 'a' }, '<b></b>')
    expect(document.body.innerHTML).toBe('<div id="a"></div><b></b><i></i>')
  })

  test('position="before" inserts before the target', async () => {
    document.body.innerHTML = '<i></i><div id="a"></div>'
    await run({ target: 'a', position: 'before' }, '<b></b>')
    expect(document.body.innerHTML).toBe('<i></i><b></b><div id="a"></div>')
  })

  test('an unknown position falls back to after', async () => {
    document.body.innerHTML = '<div id="a"></div>'
    const detail = await run({ target: 'a', position: 'sideways' }, '<b></b>')
    expect(document.body.innerHTML).toBe('<div id="a"></div><b></b>')
    expect(detail.position).toBe('sideways')
  })

  test('inserted_node carries the inserted elements', async () => {
    document.body.innerHTML = '<div id="a"></div>'
    const detail = await run({ target: 'a' }, '<b id="x"></b>text<u id="y"></u>')
    expect(detail.inserted_node).toEqual([document.getElementById('x'), document.getElementById('y')])
    expect(detail.inserted_node![0]!.isConnected).toBe(true)
  })

  test('inserted_node is absent before apply', () => {
    document.body.innerHTML = '<div id="a"></div>'
    expect(buildInsertDetail(tag({ target: 'a' }, '<b></b>'), options)!.inserted_node).toBeUndefined()
  })

  test('a missing target is skipped without throwing', () => {
    expect(buildInsertDetail(tag({ target: 'nope' }, 'x'), options)).toBeNull()
    expect(buildInsertDetail(tag({ selector: '.nope' }, 'x'), options)).toBeNull()
  })

  test('an invalid selector throws', () => {
    expect(() => buildInsertDetail(tag({ selector: '[[' }, 'x'), options)).toThrow()
  })

  test('selector takes precedence over target', async () => {
    document.body.innerHTML = '<div id="a"></div><div class="s"></div>'
    await run({ target: 'a', selector: '.s' }, '<b></b>')
    expect(document.body.innerHTML).toBe('<div id="a"></div><div class="s"></div><b></b>')
  })

  test('many targets each get their own copy and inserted_node holds all', async () => {
    document.body.innerHTML = '<p class="s"></p><p class="s"></p>'
    const detail = await run({ selector: '.s' }, '<em></em>')
    expect(document.body.innerHTML).toBe('<p class="s"></p><em></em><p class="s"></p><em></em>')
    expect(detail.inserted_node).toHaveLength(2)
    expect(new Set(detail.inserted_node).size).toBe(2)
    expect(detail.inserted_node!.every((e) => e.isConnected)).toBe(true)
  })

  test('scripts in insert content execute after insertion', async () => {
    document.body.innerHTML = '<div id="a"></div>'
    await run(
      { target: 'a' },
      '<span id="n"></span><script>document.documentElement.dataset.ran = String(!!document.getElementById("n"))</script>',
    )
    expect(document.documentElement.dataset.ran).toBe('true')
  })

  test('only the new content scripts run, once per target copy', async () => {
    const mark = '<script>document.documentElement.dataset.ran=(document.documentElement.dataset.ran||"")+"n"</script>'
    document.body.innerHTML = '<p class="s"></p><p class="s"></p>'
    document.body.append(document.createElement('div'))
    document.body.lastElementChild!.innerHTML = mark.replace('"n"', '"page"')
    await run({ selector: '.s' }, mark)
    expect(document.documentElement.dataset.ran).toBe('nn')
  })

  test('the contentScripts policy and nonce are passed through', async () => {
    document.body.innerHTML = '<div id="a"></div>'
    const d1 = buildInsertDetail(tag({ target: 'a' }, '<script>document.documentElement.dataset.ran = "1"</script>'), options)!
    await applyInsert(d1, { policy: 'nonce-only' })
    expect(document.documentElement.dataset.ran).toBeUndefined()
    await run({ target: 'a' }, '<script>1</script>', { nonce: 'n1' })
    expect(document.head.querySelector('script')!.getAttribute('nonce')).toBe('n1')
  })

  test('fires tdi:ajax:insert on the target after applying', async () => {
    document.body.innerHTML = '<div id="a"></div>'
    let seen: { target: EventTarget | null; html: string; detail: InsertDetail } | undefined
    document.addEventListener(
      'tdi:ajax:insert',
      (e) => {
        seen = { target: e.target, html: document.body.innerHTML, detail: (e as CustomEvent).detail }
      },
      { once: true },
    )
    const detail = await run({ target: 'a' }, '<b></b>')
    expect(seen!.target).toBe(document.getElementById('a'))
    expect(seen!.html).toBe('<div id="a"></div><b></b>')
    expect(seen!.detail).toBe(detail)
    expect(detail.inserted_node).toHaveLength(1)
  })

  // v1 triggers insert on the whole target set (unlike update, which fires on the first only)
  test('the insert event fires once on every target', async () => {
    document.body.innerHTML = '<p class="s"></p><p class="s"></p><p class="s"></p>'
    const seen: EventTarget[] = []
    const fn = (e: Event) => seen.push(e.target!)
    document.addEventListener('tdi:ajax:insert', fn)
    await run({ selector: '.s' }, '<b></b>')
    document.removeEventListener('tdi:ajax:insert', fn)
    expect(seen).toEqual(Array.from(document.querySelectorAll('.s')))
  })

  test('detail carries v1 keys', () => {
    document.body.innerHTML = '<div id="a"></div>'
    const t = tag({ target: 'a', position: 'before' }, ' <b></b> ')
    const d = buildInsertDetail(t, options)!
    expect(d).toMatchObject({ target_id: 'a', selector: null, content: '<b></b>', position: 'before', options, tag: t })
    expect(d.target).toEqual([document.getElementById('a')])
  })
})
