import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { applyResponse, createDefaultRegistry } from '../../src/core/pipeline'
import { InstructionRegistry } from '../../src/instructions/registry'
import { parseResponse } from '../../src/net/parse'
import type { TdiRequestOptions, UnknownDetail, UpdateDetail } from '../../src/types'

const options = {} as TdiRequestOptions
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0))
const xml = (body: string, status = 'OK'): ReturnType<typeof parseResponse> =>
  parseResponse(`<response><status>${status}</status>${body}</response>`)
const run = (body: string, involved: Element[] = [], registry = createDefaultRegistry(), status = 'OK') =>
  applyResponse(xml(body, status), options, registry, involved)

let ctl = new AbortController()
// Records every listed event on document, in order
function record(names: string[]): string[] {
  const seen: string[] = []
  for (const n of names) document.addEventListener(n, () => seen.push(n.replace('tdi:ajax:', '')), { signal: ctl.signal })
  return seen
}

beforeEach(() => {
  document.body.innerHTML = '<div id="a"></div><div id="b"></div><div id="trigger"></div>'
  ;(window as any).__log = []
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  ctl.abort()
  ctl = new AbortController()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  delete (window as any).__log
})

const log = (): string[] => (window as any).__log

describe('createDefaultRegistry', () => {
  test('registers the seven built-ins and nothing else', () => {
    const r = createDefaultRegistry()
    for (const n of ['update', 'insert', 'script', 'style', 'popup', 'reload', 'redirect']) {
      expect(r.resolve(n), n).toBeTypeOf('function')
    }
    expect(r.resolve('cart-badge')).toBeUndefined()
  })
})

describe('applyResponse', () => {
  test('instructions apply in document order', async () => {
    const seen = record(['tdi:ajax:update', 'tdi:ajax:insert'])
    document.addEventListener('tdi:ajax:update', (e) => log().push('u:' + (e.target as Element).id), { signal: ctl.signal })
    await run(
      `<update target="b">B</update><insert selector="#a" position="after"><![CDATA[<i id="ins"></i>]]></insert><update target="a">A</update>`,
    )
    expect(seen).toEqual(['update', 'insert', 'update'])
    expect(log()).toEqual(['u:b', 'u:a'])
    expect(document.getElementById('a')!.textContent).toBe('A')
    expect(document.getElementById('b')!.textContent).toBe('B')
  })

  test('script instructions run after updates and inserts, in order, each awaiting the previous', async () => {
    const r = createDefaultRegistry()
    r.register('script', async (d) => {
      log().push('start:' + d.script_data)
      await tick()
      log().push('end:' + d.script_data)
    })
    document.addEventListener('tdi:ajax:update', () => log().push('update'), { signal: ctl.signal })
    document.addEventListener('tdi:ajax:insert', () => log().push('insert'), { signal: ctl.signal })
    const p = run(
      `<script>s1</script><update target="a">A</update><script>s2</script><insert target="b" position="after"><![CDATA[<i id="ins"></i>]]></insert>`,
      [],
      r,
    )
    // Everything non-script is applied during the synchronous-ish walk, before any script starts
    await Promise.resolve()
    await p
    expect(log()).toEqual(['update', 'insert', 'start:s1', 'end:s1', 'start:s2', 'end:s2'])
  })

  test('responses are scoped to one request', async () => {
    const first = await run(`<update target="a">1</update><insert target="b" position="after"><![CDATA[<i></i>]]></insert>`)
    expect([first.updates.length, first.inserts.length]).toEqual([1, 1])
    const second = await run(`<update target="b">2</update>`)
    expect(second.updates.map((u) => u.content)).toEqual(['2'])
    expect(second.inserts).toEqual([])
    expect(second.updates).not.toBe(first.updates)
    expect(first.updates).toHaveLength(1)
  })

  test('done carries only its own request responses', async () => {
    const dones: number[] = []
    document.addEventListener('tdi:ajax:done', (e) => dones.push((e as CustomEvent).detail.responses.updates.length), {
      signal: ctl.signal,
    })
    await run(`<update target="a">1</update><update target="b">1</update>`)
    await run(`<update target="a">2</update>`)
    expect(dones).toEqual([2, 1])
  })

  test('a handler that throws does not stop later instructions', async () => {
    const r = createDefaultRegistry()
    r.register('update', () => {
      throw new Error('boom')
    })
    const seen = record(['tdi:ajax:updatesDone', 'tdi:ajax:insertsDone', 'tdi:ajax:done'])
    const res = await run(`<update target="a">x</update><insert target="b" position="after"><![CDATA[<i id="ins"></i>]]></insert>`, [], r)
    expect(document.getElementById('ins')).not.toBeNull()
    expect(seen).toEqual(['updatesDone', 'insertsDone', 'done'])
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(res.updates).toHaveLength(1)
  })

  test('a script handler that throws does not stop later scripts or done', async () => {
    const r = createDefaultRegistry()
    r.register('script', (d) => {
      if (d.script_data === 'bad') throw new Error('boom')
      log().push(d.script_data)
    })
    const seen = record(['tdi:ajax:scriptsDone', 'tdi:ajax:done'])
    await run(`<script>bad</script><script>good</script>`, [], r)
    expect(log()).toEqual(['good'])
    expect(seen).toEqual(['scriptsDone', 'done'])
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  test('a missing target does not abort the response', async () => {
    const res = await run(`<update target="nope">x</update><update selector=".none">x</update><update target="a">ok</update>`)
    expect(document.getElementById('a')!.textContent).toBe('ok')
    expect(res.updates).toHaveLength(1)
    expect(console.error).not.toHaveBeenCalled()
  })

  test('popup and redirect without href are skipped silently', async () => {
    const res = await run(`<popup/><redirect/>`)
    expect(res.popups).toEqual([])
    expect(console.error).not.toHaveBeenCalled()
  })

  test('an invalid selector is isolated like any handler error', async () => {
    const res = await run(`<update selector="[[[">x</update><update target="a">ok</update>`)
    expect(document.getElementById('a')!.textContent).toBe('ok')
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(res.updates).toHaveLength(1)
  })

  test('fires updatesDone, insertsDone, stylesDone, popupsDone, unknownsDone, scriptsDone then done', async () => {
    const seen = record([
      'tdi:ajax:script',
      'tdi:ajax:done',
      'tdi:ajax:scriptsDone',
      'tdi:ajax:unknownsDone',
      'tdi:ajax:popupsDone',
      'tdi:ajax:stylesDone',
      'tdi:ajax:insertsDone',
      'tdi:ajax:updatesDone',
      'tdi:ajax:update',
    ])
    await run(`<script>1</script><update target="a">x</update>`)
    // script and update (walk, then scripts) precede every *Done; scriptsDone is last before done
    expect(seen).toEqual([
      'update',
      'script',
      'updatesDone',
      'insertsDone',
      'stylesDone',
      'popupsDone',
      'unknownsDone',
      'scriptsDone',
      'done',
    ])
  })

  test('done fires on document when involved elements have left the DOM', async () => {
    const trigger = document.getElementById('trigger')!
    const onDoc: string[] = []
    document.addEventListener('tdi:ajax:done', (e) => onDoc.push((e.target as Node).nodeName), { signal: ctl.signal })
    // The response itself replaces the trigger
    await run(`<update target="trigger" replace="true"><p>new</p></update>`, [trigger])
    expect(trigger.isConnected).toBe(false)
    expect(onDoc).toEqual(['#document'])
  })

  test('done fires on involved elements that are still in the DOM', async () => {
    const trigger = document.getElementById('trigger')!
    const targets: unknown[] = []
    document.addEventListener('tdi:ajax:done', (e) => targets.push(e.target), { signal: ctl.signal })
    await run(`<update target="a">x</update>`, [trigger])
    expect(targets).toEqual([trigger])
  })

  test('a non-OK status still applies instructions', async () => {
    const seen = record(['tdi:ajax:done'])
    const res = await run(`<update target="a">still</update>`, [], createDefaultRegistry(), 'ERROR')
    expect(document.getElementById('a')!.textContent).toBe('still')
    expect(res.updates).toHaveLength(1)
    expect(seen).toEqual(['done'])
  })

  test('tag names are matched case-insensitively', async () => {
    const res = await run(`<UPDATE target="a">up</UPDATE>`)
    expect(document.getElementById('a')!.textContent).toBe('up')
    expect(res.updates).toHaveLength(1)
    expect(res.unknowns).toEqual([])
  })

  test('a project override of a built-in receives a built detail', async () => {
    const r = createDefaultRegistry()
    const got: UpdateDetail[] = []
    r.register('update', (d) => void got.push(d))
    await run(`<update target="a" class-add="x">hi</update>`, [], r)
    expect(got[0]!.target).toEqual([document.getElementById('a')])
    expect(got[0]!.class_add).toBe('x')
    expect(document.getElementById('a')!.textContent).toBe('') // default handler did not run
  })

  test('an unknown instruction gets flattened attributes, its before event on document, and is collected', async () => {
    const r = createDefaultRegistry()
    const got: UnknownDetail[] = []
    r.register('cart-badge', (d) => void got.push(d))
    let before: EventTarget | null = null
    document.addEventListener('tdi:ajax:beforeCartBadge', (e) => (before = e.target), { signal: ctl.signal })
    const res = await run(`<cart-badge count="3">hello</cart-badge>`, [], r)
    expect(got[0]).toMatchObject({ _name: 'cart-badge', count: '3', contents: 'hello' })
    expect(before).toBe(document)
    expect(res.unknowns).toEqual(got)
  })

  test('an unregistered instruction fires its past-tense event', async () => {
    const seen = record(['tdi:ajax:beforeCartBadge', 'tdi:ajax:cart-badge'])
    await run(`<cart-badge/>`, [], new InstructionRegistry())
    expect(seen).toEqual(['beforeCartBadge', 'cart-badge'])
  })

  test('a prevented before event skips the handler but later instructions still run', async () => {
    document.addEventListener('tdi:ajax:beforeUpdate', (e) => e.preventDefault(), { signal: ctl.signal })
    await run(`<update target="a">x</update><insert target="b" position="after"><![CDATA[<i id="ins"></i>]]></insert>`)
    expect(document.getElementById('a')!.textContent).toBe('')
    expect(document.getElementById('ins')).not.toBeNull()
  })

  test('dispatch targets: update/insert on the target element, script on document', async () => {
    const hits: Record<string, EventTarget | null> = {}
    for (const n of ['beforeUpdate', 'beforeInsert', 'beforeScript'])
      document.addEventListener('tdi:ajax:' + n, (e) => (hits[n] = e.target), { signal: ctl.signal })
    const r = createDefaultRegistry()
    r.register('script', () => {})
    await run(`<update target="a">x</update><insert target="b" position="after"><![CDATA[<i id="ins"></i>]]></insert><script>s</script>`, [], r)
    expect(hits.beforeUpdate).toBe(document.getElementById('a'))
    expect(hits.beforeInsert).toBe(document.getElementById('b'))
    expect(hits.beforeScript).toBe(document)
  })
})
