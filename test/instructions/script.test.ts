import { afterEach, describe, expect, test } from 'vitest'
import { applyScript, buildScriptDetail } from '../../src/instructions/script'
import type { ScriptDetail, TdiRequestOptions } from '../../src/types'

const options = {} as TdiRequestOptions

function tag(attrs: Record<string, string>, body = ''): Element {
  const el = new DOMParser().parseFromString('<script/>', 'application/xml').documentElement
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  el.textContent = body
  return el
}

const build = (attrs: Record<string, string>, body = ''): ScriptDetail => buildScriptDetail(tag(attrs, body), options)
const srcScript = (): HTMLScriptElement | null => document.head.querySelector('script[src]')
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

// Collects every script event, in order
function listen(): ScriptDetail[] {
  const seen: ScriptDetail[] = []
  document.addEventListener('tdi:ajax:script', (e) => seen.push((e as CustomEvent<ScriptDetail>).detail), {
    signal: ctl.signal,
  })
  return seen
}
let ctl = new AbortController()

afterEach(() => {
  ctl.abort()
  ctl = new AbortController()
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  delete document.documentElement.dataset.ran
})

describe('script', () => {
  test('buildScriptDetail reads src, id and the trimmed body', () => {
    const d = build({ src: '/a.js', id: 'a' }, '  x  ')
    expect([d.script_src, d.script_id, d.script_data]).toEqual(['/a.js', 'a', 'x'])
    expect(buildScriptDetail(tag({}), options).script_src).toBeNull()
  })

  test('src loads before the inline body runs', async () => {
    const detail = build({ src: '/a.js' }, 'document.documentElement.dataset.ran = "1"')
    const done = applyScript(detail)
    await tick()
    expect(srcScript()).not.toBeNull()
    expect(document.head.querySelectorAll('script').length).toBe(1) // inline not injected yet
    expect(document.documentElement.dataset.ran).toBeUndefined()
    srcScript()!.dispatchEvent(new Event('load'))
    await done
    expect(document.documentElement.dataset.ran).toBe('1')
  })

  test('an inline-only script runs and fires the event once', async () => {
    const seen = listen()
    await applyScript(build({}, 'document.documentElement.dataset.ran = "1"'))
    expect(document.documentElement.dataset.ran).toBe('1')
    expect(seen.length).toBe(1)
  })

  test('an id already present is not downloaded again, yet it settles, runs the body and fires', async () => {
    document.body.innerHTML = '<script id="lib"></script>'
    const seen = listen()
    const detail = build({ src: '/lib.js', id: 'lib' }, 'document.documentElement.dataset.ran = "1"')
    await applyScript(detail) // would hang if the dedupe path never settled
    expect(srcScript()).toBeNull()
    expect(document.documentElement.dataset.ran).toBe('1')
    expect(seen.length).toBe(1)
    expect(detail.script_node).toBeUndefined()
    expect(detail.script_node_inline).toBeDefined()
  })

  test('the event fires only after src settles and the inline body ran', async () => {
    const seen = listen()
    const detail = build({ src: '/a.js' }, 'document.documentElement.dataset.ran = "1"')
    const done = applyScript(detail)
    await tick()
    expect(seen.length).toBe(0) // src still pending
    srcScript()!.dispatchEvent(new Event('load'))
    await done
    expect(seen.length).toBe(1)
  })

  test('a failing src still settles, runs the body and fires the event', async () => {
    const seen = listen()
    const detail = build({ src: '/missing.js' }, 'document.documentElement.dataset.ran = "1"')
    const done = applyScript(detail)
    await tick()
    srcScript()!.dispatchEvent(new Event('error'))
    await done
    expect(seen.length).toBe(1)
    expect(document.documentElement.dataset.ran).toBe('1')
    expect(detail.script_node).toBe(srcScript())
  })

  test('script_node and script_node_inline are set on detail', async () => {
    const detail = build({ src: '/a.js', id: 'a' }, 'void 0')
    const done = applyScript(detail)
    await tick()
    const ext = srcScript()!
    ext.dispatchEvent(new Event('load'))
    await done
    expect(detail.script_node).toBe(ext)
    expect(detail.script_node_inline).toBe(document.getElementById('a_inline'))
  })

  test('without src or body no node is set and the event still fires', async () => {
    const seen = listen()
    const detail = build({})
    await applyScript(detail)
    expect(detail.script_node).toBeUndefined()
    expect(detail.script_node_inline).toBeUndefined()
    expect(seen).toEqual([detail])
    expect(seen[0]).toBe(detail)
  })

  test('the event fires on document, after the inline body ran', async () => {
    let ranAtEvent: string | undefined = 'unset'
    document.addEventListener(
      'tdi:ajax:script',
      () => {
        ranAtEvent = document.documentElement.dataset.ran
      },
      { signal: ctl.signal },
    )
    const done = applyScript(build({ src: '/a.js' }, 'document.documentElement.dataset.ran = "1"'))
    await tick()
    srcScript()!.dispatchEvent(new Event('load'))
    await done
    expect(ranAtEvent).toBe('1')
  })

  test('the nonce is applied to the src and inline scripts, never taken from tag attributes', async () => {
    const detail = build({ src: '/a.js', nonce: 'evil', integrity: 'x' }, 'void 0')
    const done = applyScript(detail, { nonce: 'good' })
    await tick()
    srcScript()!.dispatchEvent(new Event('load'))
    await done
    expect(detail.script_node!.getAttribute('nonce')).toBe('good')
    expect(detail.script_node_inline!.getAttribute('nonce')).toBe('good')
    expect(detail.script_node!.getAttribute('integrity')).toBeNull()
  })
})
