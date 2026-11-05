import { afterEach, describe, expect, test } from 'vitest'
import { applyUpdate, buildUpdateDetail } from '../../src/instructions/update'
import type { TdiRequestOptions, UpdateDetail } from '../../src/types'

// Scripts run in jsdom's own context, so they report through the DOM
const options = {} as TdiRequestOptions

// Builds an <update> tag the way the XML parser would
function tag(attrs: Record<string, string>, body = ''): Element {
  const el = new DOMParser().parseFromString('<update/>', 'application/xml').documentElement
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  el.textContent = body
  return el
}

async function run(attrs: Record<string, string>, body = ''): Promise<UpdateDetail> {
  const detail = buildUpdateDetail(tag(attrs, body), options)
  if (!detail) throw new Error('no target')
  await applyUpdate(detail)
  return detail
}

afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  delete document.documentElement.dataset.ran
})

describe('update', () => {
  test('replaces target contents by default', async () => {
    document.body.innerHTML = '<div id="a"><b>old</b></div>'
    await run({ target: 'a' }, '<i>new</i>')
    expect(document.getElementById('a')!.innerHTML).toBe('<i>new</i>')
  })

  test('replace="true" replaces the element itself', async () => {
    document.body.innerHTML = '<div id="a">old</div>'
    const detail = await run({ target: 'a', replace: 'true' }, '<p id="b">new</p>')
    expect(document.body.innerHTML).toBe('<p id="b">new</p>')
    expect(detail.target).toEqual([document.getElementById('b')])
  })

  test('append="true" and prepend="true" place content correctly', async () => {
    document.body.innerHTML = '<div id="a"><i>mid</i></div>'
    await run({ target: 'a', append: 'true' }, '<b>end</b>')
    await run({ target: 'a', prepend: 'true' }, '<u>start</u>')
    expect(document.getElementById('a')!.innerHTML).toBe('<u>start</u><i>mid</i><b>end</b>')
  })

  test('class-add and class-remove apply to the target', async () => {
    document.body.innerHTML = '<div id="a" class="x y"></div>'
    await run({ target: 'a', 'class-add': 'p q', 'class-remove': 'x' })
    expect(document.getElementById('a')!.className).toBe('y p q')
  })

  test('selector takes precedence over target', async () => {
    document.body.innerHTML = '<div id="a"></div><div class="s"></div>'
    await run({ target: 'a', selector: '.s' }, 'hit')
    expect(document.getElementById('a')!.innerHTML).toBe('')
    expect(document.querySelector('.s')!.innerHTML).toBe('hit')
  })

  test('selector matching many elements updates all of them', async () => {
    document.body.innerHTML = '<p class="s"></p><p class="s"></p>'
    const detail = await run({ selector: '.s' }, 'x')
    expect(detail.target).toHaveLength(2)
    expect(Array.from(document.querySelectorAll('.s')).map((e) => e.innerHTML)).toEqual(['x', 'x'])
  })

  test('replace with many targets gives each its own copy', async () => {
    document.body.innerHTML = '<p class="s"></p><p class="s"></p>'
    const detail = await run({ selector: '.s', replace: 'true' }, '<em>n</em>')
    expect(document.body.innerHTML).toBe('<em>n</em><em>n</em>')
    expect(detail.target).toHaveLength(2)
  })

  test('an empty body clears the target', async () => {
    document.body.innerHTML = '<div id="a"><b>old</b></div>'
    const detail = await run({ target: 'a' }, '')
    expect(document.getElementById('a')!.innerHTML).toBe('')
    expect(detail.content_empty).toBe(true)
  })

  test('a missing target id is skipped without throwing', () => {
    const received: Event[] = []
    document.addEventListener('tdi:ajax:update', (e) => received.push(e), { once: true })
    expect(buildUpdateDetail(tag({ target: 'nope' }, 'x'), options)).toBeNull()
    expect(buildUpdateDetail(tag({ selector: '.nope' }, 'x'), options)).toBeNull()
    expect(received).toHaveLength(0)
  })

  test('scripts in update content execute after insertion', async () => {
    document.body.innerHTML = '<div id="a"></div>'
    await run(
      { target: 'a' },
      '<span id="n"></span><script>document.documentElement.dataset.ran = String(!!document.getElementById("n"))</script>',
    )
    expect(document.documentElement.dataset.ran).toBe('true')
  })

  test('the contentScripts policy is passed through', async () => {
    document.body.innerHTML = '<div id="a"></div>'
    const detail = buildUpdateDetail(tag({ target: 'a' }, '<script>document.documentElement.dataset.ran = "1"</script>'), options)!
    await applyUpdate(detail, { policy: 'nonce-only' })
    expect(document.documentElement.dataset.ran).toBeUndefined()
  })

  test('fires tdi:ajax:update on the target after applying', async () => {
    document.body.innerHTML = '<div id="a"></div>'
    let seen: { target: EventTarget | null; html: string; detail: UpdateDetail } | undefined
    document.addEventListener(
      'tdi:ajax:update',
      (e) => {
        seen = {
          target: e.target,
          html: document.getElementById('a')!.innerHTML,
          detail: (e as CustomEvent).detail,
        }
      },
      { once: true },
    )
    const detail = await run({ target: 'a' }, 'done')
    expect(seen!.target).toBe(document.getElementById('a'))
    expect(seen!.html).toBe('done')
    expect(seen!.detail).toBe(detail)
  })

  test('detail carries v1 keys', () => {
    document.body.innerHTML = '<div id="a"></div>'
    const t = tag({ target: 'a', 'class-add': 'k' }, ' &nbsp; ')
    const d = buildUpdateDetail(t, options)!
    expect(d).toMatchObject({ target_id: 'a', selector: null, class_add: 'k', class_remove: '', replace: null, options, tag: t })
    // v1 strips literal "&nbsp;" before testing emptiness
    expect(d.content_empty).toBe(true)
    expect(buildUpdateDetail(tag({ target: 'a' }, 'x'), options)!.content_empty).toBe(false)
  })
})
