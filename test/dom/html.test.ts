import { afterEach, describe, expect, test } from 'vitest'
import { parseFragment, runContentScripts } from '../../src/dom/html'

// Scripts run in jsdom's own context, not the Node global, so they report through the DOM
const order = () => document.documentElement.dataset.order ?? ''
const mark = (v: string) =>
  `<script>document.documentElement.dataset.order=(document.documentElement.dataset.order||'')+'${v}'</script>`

afterEach(() => {
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  delete document.documentElement.dataset.order
})

describe('parseFragment', () => {
  test('parseFragment preserves table rows', () => {
    const frag = parseFragment('<tr><td>a</td></tr>')
    expect(frag.firstElementChild?.tagName).toBe('TR')
    // Control: a div drops the row, which is why <template> is required
    const div = document.createElement('div')
    div.innerHTML = '<tr><td>a</td></tr>'
    expect(div.querySelector('tr')).toBeNull()
  })
})

describe('runContentScripts', () => {
  test('scripts inserted via innerHTML do not self-execute', () => {
    const div = document.createElement('div')
    div.innerHTML = mark('x')
    document.body.appendChild(div)
    expect(order()).toBe('')
  })

  test('runContentScripts executes inline scripts in document order', async () => {
    const frag = parseFragment(`${mark('a')}<p>x</p>${mark('b')}`)
    await runContentScripts(frag)
    expect(order()).toBe('ab')
  })

  test('runContentScripts removes the inert original nodes', async () => {
    const frag = parseFragment(`<p>x</p>${mark('a')}`)
    await runContentScripts(frag)
    expect(frag.querySelector('script')).toBeNull()
    expect(order()).toBe('a')
  })

  test('runContentScripts leaves non-JavaScript script blocks alone', async () => {
    const frag = parseFragment('<script type="application/json">{"a":1}</script>')
    await runContentScripts(frag)
    expect(frag.querySelector('script')?.textContent).toBe('{"a":1}')
    expect(document.head.querySelector('script')).toBeNull()
  })

  test('runContentScripts awaits src scripts before resolving', async () => {
    const frag = parseFragment(`<script src="/a.js"></script>${mark('inline')}`)
    let done = false
    const p = runContentScripts(frag).then(() => { done = true })
    await Promise.resolve()
    const el = document.head.querySelector('script[src="/a.js"]')!
    expect(el).not.toBeNull()
    // The next script must not run before the src script settles
    expect(order()).toBe('')
    expect(done).toBe(false)
    el.dispatchEvent(new Event('load'))
    await p
    expect(order()).toBe('inline')
    expect(done).toBe(true)
  })

  test('runContentScripts continues after a src script errors', async () => {
    const frag = parseFragment(`<script src="/a.js"></script>${mark('after')}`)
    const p = runContentScripts(frag)
    await Promise.resolve()
    document.head.querySelector('script')!.dispatchEvent(new Event('error'))
    await p
    expect(order()).toBe('after')
  })

  test('runContentScripts propagates the nonce', async () => {
    const frag = parseFragment(mark('n'))
    await runContentScripts(frag, 'abc')
    expect(document.head.querySelector('script')!.getAttribute('nonce')).toBe('abc')
  })
})
