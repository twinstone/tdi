import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createSenders } from '../../src/core/instance'
import { createDefaultRegistry } from '../../src/core/pipeline'

const OK = '<response><status>OK</status></response>'
let fetchMock: ReturnType<typeof vi.fn>
let live: Set<AbortController>
let s: ReturnType<typeof createSenders>

const html = (h: string): void => {
  document.body.innerHTML = h
}
const $ = <T extends Element>(sel: string): T => document.querySelector(sel) as T
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0))
const lastCall = (): { url: string; init: RequestInit & { headers: Headers } } => {
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, init] = fetchMock.mock.calls[0]!
  return { url, init }
}

beforeEach(() => {
  fetchMock = vi.fn(async () => new Response(OK, { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  live = new Set()
  s = createSenders(createDefaultRegistry(), live)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('sendElement', () => {
  test('applies the loading class for the request duration', async () => {
    html('<a id="t" href="/x" data-related-element="#r"></a><div id="r"></div>')
    let release!: () => void
    fetchMock.mockImplementation(() => new Promise((res) => (release = () => res(new Response(OK)))))
    const p = s.sendElement($('#t'))
    await tick()
    expect($('#t').classList.contains('loading')).toBe(true)
    expect($('#r').classList.contains('loading')).toBe(true)
    release()
    await p
    expect($('#t').classList.contains('loading')).toBe(false)
    expect($('#r').classList.contains('loading')).toBe(false)
  })

  test('disables the trigger group during the request and restores it afterwards', async () => {
    html('<a id="t" href="/x" data-trigger-group="button"></a><button id="b"></button>')
    let release!: () => void
    fetchMock.mockImplementation(() => new Promise((res) => (release = () => res(new Response(OK)))))
    const p = s.sendElement($('#t'))
    await tick()
    expect($<HTMLButtonElement>('#b').disabled).toBe(true)
    expect($('#b').classList.contains('disabled')).toBe(true)
    release()
    await p
    expect($<HTMLButtonElement>('#b').disabled).toBe(false)
    expect($('#b').classList.contains('disabled')).toBe(false)
  })

  test('sends the element url and name/value as the exact GET request', async () => {
    html('<input id="t" data-ajax-url="/search" name="q" value="a b">')
    await s.sendElement($('#t'))
    expect(lastCall().url).toContain('/search')
    expect(lastCall().url).toContain('q=a+b')
    expect(lastCall().init.method).toBe('GET')
  })

  test('honours data-confirm and sends nothing when declined', async () => {
    html('<a id="t" href="/x" data-confirm="Sure?"></a>')
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const ctl = new AbortController()
    const events: string[] = []
    for (const n of ['start', 'end']) document.addEventListener(`tdi:ajax:${n}`, () => events.push(n), { signal: ctl.signal })
    expect(await s.sendElement($('#t'))).toBeNull()
    expect(confirmSpy).toHaveBeenCalledWith('Sure?')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(events).toEqual([])
    expect($('#t').classList.contains('loading')).toBe(false)
    // positive control: the same listeners do fire once the user accepts
    confirmSpy.mockReturnValue(true)
    await s.sendElement($('#t'))
    expect(events).toEqual(['start', 'end'])
    ctl.abort()
  })

  test('an already-aborted caller signal sends nothing and changes nothing', async () => {
    html('<a id="t" href="/x" data-trigger-group="button"></a><button id="b"></button>')
    const ctl = new AbortController()
    ctl.abort()
    await expect(s.sendElement($('#t'), { signal: ctl.signal })).rejects.toBeDefined()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(live.size).toBe(0)
    expect($<HTMLButtonElement>('#b').disabled).toBe(false)
  })

  test('sends when data-confirm is accepted', async () => {
    html('<a id="t" href="/x" data-confirm="Sure?"></a>')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await s.sendElement($('#t'))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test.each(['<a id="t" href="/x" disabled></a>', '<a id="t" href="/x" class="disabled"></a>'])(
    'sends nothing when the element is suppressed (%s)',
    async (markup) => {
      html(markup)
      expect(await s.sendElement($('#t'))).toBeNull()
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )

  test('loading class and trigger group are restored when the request fails', async () => {
    html('<a id="t" href="/x" data-trigger-group="button"></a><button id="b"></button>')
    const seen: boolean[] = []
    fetchMock.mockImplementation(async () => {
      seen.push($('#t').classList.contains('loading'), $<HTMLButtonElement>('#b').disabled)
      throw new TypeError('network down')
    })
    await expect(s.sendElement($('#t'))).rejects.toThrow('network down')
    expect(seen).toEqual([true, true]) // was applied while in flight
    expect($('#t').classList.contains('loading')).toBe(false)
    expect($<HTMLButtonElement>('#b').disabled).toBe(false)
    expect(live.size).toBe(0)
  })

  test('registers an AbortController while in flight and aborting it cancels the request', async () => {
    html('<a id="t" href="/x"></a>')
    let fetchSignal: AbortSignal | undefined
    fetchMock.mockImplementation(
      (_u: string, init: RequestInit) =>
        new Promise((_res, rej) => {
          fetchSignal = init.signal!
          fetchSignal.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError')))
        }),
    )
    const p = s.sendElement($('#t'))
    await tick()
    expect(live.size).toBe(1)
    live.forEach((c) => c.abort())
    await expect(p).rejects.toThrow('aborted')
    expect(fetchSignal!.aborted).toBe(true)
    expect(live.size).toBe(0)
    expect($('#t').classList.contains('loading')).toBe(false)
  })

  test('a caller-supplied signal still cancels the request', async () => {
    html('<a id="t" href="/x"></a>')
    fetchMock.mockImplementation(
      (_u: string, init: RequestInit) =>
        new Promise((_res, rej) => init.signal!.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError')))),
    )
    const ctl = new AbortController()
    const p = s.sendElement($('#t'), { signal: ctl.signal })
    await tick()
    ctl.abort()
    await expect(p).rejects.toThrow('aborted')
  })

  test('a malformed related selector rejects before anything is sent or changed', async () => {
    html('<a id="t" href="/x" data-related-element="[" data-trigger-group="button"></a><button id="b"></button>')
    await expect(s.sendElement($('#t'))).rejects.toMatchObject({ name: 'SyntaxError' })
    expect(fetchMock).not.toHaveBeenCalled()
    expect($('#t').classList.contains('loading')).toBe(false)
    expect($<HTMLButtonElement>('#b').disabled).toBe(false)
    expect(live.size).toBe(0)
  })

  test('a malformed trigger-group selector leaves no loading class behind', async () => {
    html('<a id="t" href="/x" data-trigger-group="["></a>')
    await expect(s.sendElement($('#t'))).rejects.toMatchObject({ name: 'SyntaxError' })
    expect(fetchMock).not.toHaveBeenCalled()
    expect($('#t').classList.contains('loading')).toBe(false)
  })
})

describe('sendForm', () => {
  test('serialises fields with URLSearchParams for GET', async () => {
    html('<form id="f" action="/find" method="get"><input name="q" value="a b&c"><input name="n" value="1"></form>')
    await s.sendForm($('#f'))
    const { url, init } = lastCall()
    expect(url).toContain('/find')
    expect(url).toContain('q=a+b%26c&n=1')
    expect(init.method).toBe('GET')
    expect(init.body).toBeUndefined()
  })

  test('POST sends a urlencoded string body', async () => {
    html('<form id="f" action="/save" method="post"><input name="q" value="a b"></form>')
    await s.sendForm($('#f'))
    const { init } = lastCall()
    expect(init.method).toBe('POST')
    expect(init.body).toBe('q=a+b')
    expect(init.headers.get('Content-Type')).toContain('application/x-www-form-urlencoded')
  })

  test('uses FormData with a File and forces POST when the form has a file input', async () => {
    html('<form id="f" action="/up" method="get"><input name="t" value="x"><input type="file" name="doc"></form>')
    const file = new File(['hello'], 'a.txt', { type: 'text/plain' })
    // jsdom cannot select a file programmatically: a FormData subclass adds the File the way a browser would
    const Real = FormData
    vi.stubGlobal(
      'FormData',
      class extends Real {
        constructor(form?: HTMLFormElement, submitter?: HTMLElement | null) {
          super(form, submitter)
          if (form) this.set('doc', file)
        }
      },
    )
    await s.sendForm($('#f'))
    const { url, init } = lastCall()
    expect(init.method).toBe('POST')
    expect(url).not.toContain('t=x')
    expect(init.body).toBeInstanceOf(FormData)
    const body = init.body as FormData
    expect(body.get('t')).toBe('x')
    const sent = body.get('doc') as File
    expect(sent).toBeInstanceOf(File)
    expect(sent.name).toBe('a.txt')
    expect(init.headers.has('Content-Type')).toBe(false) // browser sets the multipart boundary
  })

  test('includes the clicked submit button name and value and leaves the DOM untouched', async () => {
    html('<form id="f" action="/s" method="post"><input name="a" value="1"><button id="ok" name="go" value="yes"></button><button name="other" value="no"></button></form>')
    const count = document.querySelectorAll('*').length
    const records: MutationRecord[] = []
    const observer = new MutationObserver((r) => records.push(...r))
    observer.observe(document.body, { childList: true, subtree: true })
    await s.sendForm($('#f'), { trigger: $('#ok') })
    records.push(...observer.takeRecords()) // callbacks run at microtask checkpoints, so collect both
    expect(records).toEqual([]) // v1 injected then removed a hidden input; end state alone cannot tell
    observer.disconnect()
    expect(lastCall().init.body).toBe('a=1&go=yes')
    expect(document.querySelectorAll('*').length).toBe(count)
    expect($('input.submit-action')).toBeNull()
  })

  test('omits submit buttons when none was clicked', async () => {
    html('<form id="f" action="/s" method="post"><input name="a" value="1"><button name="go" value="yes"></button></form>')
    await s.sendForm($('#f'))
    expect(lastCall().init.body).toBe('a=1')
  })

  test('applies loading to the submit button during the request', async () => {
    html('<form id="f" action="/s" method="post"><button id="ok" name="go" value="yes"></button></form>')
    let seen = false
    fetchMock.mockImplementation(async () => {
      seen = $('#ok').classList.contains('loading') && $('#f').classList.contains('loading')
      return new Response(OK)
    })
    await s.sendForm($('#f'), { trigger: $('#ok') })
    expect(seen).toBe(true)
    expect($('#ok').classList.contains('loading')).toBe(false)
  })

  test('sendElement on a form delegates to sendForm', async () => {
    html('<form id="f" action="/s" method="post"><input name="a" value="1"></form>')
    await s.sendElement($('#f'))
    expect(lastCall().init.body).toBe('a=1')
  })

  test('a suppressed form sends nothing', async () => {
    html('<form id="f" action="/s" class="disabled"><input name="a" value="1"></form>')
    expect(await s.sendForm($('#f'))).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
