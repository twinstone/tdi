import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createTdi, type Tdi } from '../../src/index'

const OK = '<response><status>OK</status></response>'
let fetchMock: ReturnType<typeof vi.fn>
let tdi: Tdi

const html = (h: string): void => {
  document.body.innerHTML = h
}
const $ = <T extends Element>(sel: string): T => document.querySelector(sel) as T
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0))
const urls = (): string[] => fetchMock.mock.calls.map((c) => String(c[0]))
const click = (el: Element, init: MouseEventInit = {}): MouseEvent => {
  const evt = new MouseEvent('click', { bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(evt)
  return evt
}
const keydown = (el: Element, key: string): KeyboardEvent => {
  const evt = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  el.dispatchEvent(evt)
  return evt
}
const change = (el: Element): void => {
  el.dispatchEvent(new Event('change', { bubbles: true }))
}
const submit = (form: Element): Event => {
  const evt = new Event('submit', { bubbles: true, cancelable: true })
  form.dispatchEvent(evt)
  return evt
}

// Records defaultPrevented as TDI left it, then blocks jsdom's unimplemented navigation
const prevented = new WeakMap<Event, boolean>()
const wasPrevented = (evt: Event): boolean => prevented.get(evt)!
const record = (e: Event): void => {
  prevented.set(e, e.defaultPrevented)
  // A button click must keep its activation (the submit event), which is blocked in turn
  if (!(e.target as Element).closest('button')) e.preventDefault()
}
const cleanups: (() => void)[] = []
const listen = (name: string, fn: (e: Event) => void): void => {
  document.addEventListener(name, fn)
  cleanups.push(() => document.removeEventListener(name, fn))
}

beforeEach(() => {
  window.addEventListener('click', record)
  window.addEventListener('submit', record)
  fetchMock = vi.fn(async () => new Response(OK, { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  tdi = createTdi()
  tdi.start()
})
afterEach(() => {
  window.removeEventListener('click', record)
  window.removeEventListener('submit', record)
  cleanups.splice(0).forEach((c) => c())
  tdi.stop()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('clicks', () => {
  test.each(['tdi', 'infuse'])('a click on a.%s sends exactly one request and prevents default', async (cls) => {
    html(`<a class="${cls}" href="/x"><span id="in">go</span></a>`)
    const evt = click($('#in'))
    await tick()
    expect(urls()).toHaveLength(1)
    expect(urls()[0]).toContain('/x')
    expect(wasPrevented(evt)).toBe(true)
  })

  test.each([
    ['ctrl', { ctrlKey: true }],
    ['meta', { metaKey: true }],
    ['shift', { shiftKey: true }],
    ['middle button', { button: 1 }],
  ])('a %s click is left to the browser', async (_name, init) => {
    html('<a class="tdi" href="/x">go</a>')
    const evt = click($('a'), init)
    await tick()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(wasPrevented(evt)).toBe(false)
    click($('a')) // control: delegation is live, so the silence above is the modifier check
    await tick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('beforeLinkClick fires once with the link and preventDefault suppresses the request', async () => {
    html('<a class="tdi" href="/x">go</a>')
    const seen: unknown[] = []
    const listener = (e: Event): void => {
      seen.push((e as CustomEvent).detail.link)
      e.preventDefault()
    }
    document.addEventListener('tdi:ajax:beforeLinkClick', listener)
    click($('a'))
    await tick()
    const evt = click($('a'))
    expect(wasPrevented(evt)).toBe(true) // cancelling beforeLinkClick still blocks navigation
    expect(seen).toEqual([$('a'), $('a')])
    expect(fetchMock).not.toHaveBeenCalled()
    document.removeEventListener('tdi:ajax:beforeLinkClick', listener)
    click($('a'))
    await tick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('submits', () => {
  test('submit on form.infuse sends exactly one request and prevents default', async () => {
    html('<form class="infuse" action="/f"><input name="q" value="1"></form>')
    const evt = submit($('form'))
    await tick()
    expect(urls()).toHaveLength(1)
    expect(urls()[0]).toContain('/f?q=1')
    expect(wasPrevented(evt)).toBe(true)
  })

  test('the clicked submit button is sent with the form', async () => {
    html('<form class="tdi" action="/f"><button name="act" value="save">s</button><button name="act" value="del">d</button></form>')
    click($('button[value=del]'))
    await tick()
    expect(urls()).toHaveLength(1)
    expect(urls()[0]).toContain('act=del')
    expect(urls()[0]).not.toContain('act=save')
  })

  test('beforeFormSubmit fires once with the form and preventDefault suppresses the request', async () => {
    html('<form class="tdi" action="/f"></form>')
    const seen: unknown[] = []
    const listener = (e: Event): void => {
      seen.push((e as CustomEvent).detail.form)
      e.preventDefault()
    }
    document.addEventListener('tdi:ajax:beforeFormSubmit', listener)
    const evt = submit($('form'))
    await tick()
    expect(seen).toEqual([$('form')])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(wasPrevented(evt)).toBe(true) // the browser must not navigate either
    document.removeEventListener('tdi:ajax:beforeFormSubmit', listener)
    submit($('form'))
    await tick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('fields', () => {
  test('change on select.tdi submits its form when it has no data-ajax-url', async () => {
    html('<form action="/f"><select class="tdi" name="s"><option value="a">a</option><option value="b" selected>b</option></select></form>')
    const forms: unknown[] = []
    listen('tdi:ajax:beforeFormSubmit', (e) => forms.push((e as CustomEvent).detail.form))
    change($('select'))
    await tick()
    expect(urls()).toHaveLength(1)
    expect(urls()[0]).toContain('/f?s=b')
    expect(forms).toEqual([$('form')])
  })

  test('change on a field with data-ajax-url sends the field itself, not the form', async () => {
    html('<form action="/f"><input type="checkbox" class="tdi" name="c" value="1" data-ajax-url="/own" checked></form>')
    const forms: unknown[] = []
    listen('tdi:ajax:beforeFormSubmit', (e) => forms.push(e))
    change($('input'))
    await tick()
    expect(urls()).toHaveLength(1)
    expect(urls()[0]).toContain('/own?c=1')
    expect(forms).toHaveLength(0)
  })

  test('change on a radio.infuse is handled', async () => {
    html('<form action="/f"><input type="radio" class="infuse" name="r" value="1" checked></form>')
    change($('input'))
    await tick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('Enter in input[type=text].tdi sends the form once and prevents default; other keys do nothing', async () => {
    html('<form action="/f"><input type="text" class="tdi" name="q" value="v"></form>')
    expect(keydown($('input'), 'a').defaultPrevented).toBe(false)
    await tick()
    expect(fetchMock).not.toHaveBeenCalled()
    const evt = keydown($('input'), 'Enter')
    await tick()
    expect(evt.defaultPrevented).toBe(true)
    expect(urls()).toHaveLength(1)
    expect(urls()[0]).toContain('/f?q=v')
  })

  test('Enter in a text input with data-ajax-url sends the input itself', async () => {
    html('<input type="text" class="infuse" name="q" value="v" data-ajax-url="/own">')
    keydown($('input'), 'Enter')
    await tick()
    expect(urls()).toHaveLength(1)
    expect(urls()[0]).toContain('/own?q=v')
  })
})

describe('dropped v1 classes', () => {
  test('.ajaxlink, .ajaxform and .ajaxselect are not bound', async () => {
    html(`
      <a class="ajaxlink" href="/l">l</a>
      <form class="ajaxform" action="/f"><select class="ajaxselect" name="s"><option value="1">1</option></select></form>
      <a class="tdi" href="/ok">ok</a>`)
    const link = click($('a.ajaxlink'))
    const form = submit($('form'))
    change($('select'))
    await tick()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(wasPrevented(link)).toBe(false)
    expect(wasPrevented(form)).toBe(false)
    click($('a.tdi')) // control: delegation is live
    await tick()
    expect(urls()).toHaveLength(1)
  })
})

describe('start and stop', () => {
  test('stop removes every listener', async () => {
    html('<a class="tdi" href="/x">a</a><form class="tdi" action="/f"></form><select class="tdi" name="s" data-ajax-url="/sel"><option>1</option></select><input type="text" class="tdi">')
    click($('a'))
    submit($('form'))
    change($('select'))
    keydown($('input'), 'Enter')
    await tick()
    expect(fetchMock).toHaveBeenCalledTimes(3) // click + submit + change; a form-less Enter sends nothing
    $('input').setAttribute('data-ajax-url', '/k')
    keydown($('input'), 'Enter')
    await tick()
    expect(fetchMock).toHaveBeenCalledTimes(4)

    tdi.stop()
    const evts = [click($('a')), submit($('form'))]
    change($('select'))
    keydown($('input'), 'Enter')
    await tick()
    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(evts.some((e) => wasPrevented(e))).toBe(false)
  })

  test('start is idempotent: twice does not double-send, and one stop removes it all', async () => {
    html('<a class="tdi" href="/x">a</a>')
    tdi.start()
    tdi.start()
    click($('a'))
    await tick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    tdi.stop()
    click($('a'))
    await tick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('start works again after stop', async () => {
    html('<a class="tdi" href="/x">a</a>')
    tdi.stop()
    tdi.start()
    click($('a'))
    await tick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('binds only click, submit, change and keydown, and never pagehide or unload', () => {
    const doc = vi.spyOn(document, 'addEventListener')
    const win = vi.spyOn(window, 'addEventListener')
    const fresh = createTdi()
    fresh.start()
    expect(doc.mock.calls.map((c) => c[0]).sort()).toEqual(['change', 'click', 'keydown', 'submit'])
    expect(win).not.toHaveBeenCalled()
    fresh.stop()
  })
})

describe('root', () => {
  test('root scopes delegation but instructions still target document', async () => {
    tdi.stop()
    html('<div id="app"><a class="tdi" href="/in">in</a></div><a id="out" class="tdi" href="/out">out</a><p id="elsewhere">old</p>')
    fetchMock.mockImplementation(async () => new Response('<response><status>OK</status><update target="elsewhere">new</update></response>'))
    const scoped = createTdi({ root: $('#app') })
    scoped.start()
    click($('#out'))
    await tick()
    expect(fetchMock).not.toHaveBeenCalled()
    click($('#app a'))
    await tick()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect($('#elsewhere').textContent).toBe('new')
    scoped.stop()
  })
})

describe('root boundary', () => {
  test('a matching ancestor outside root is not delegated to', async () => {
    tdi.stop()
    html('<a class="tdi" href="/x"><div id="app"><span id="in">in</span></div></a>')
    const scoped = createTdi({ root: $('#app') })
    scoped.start()
    const evt = click($('#in'))
    await tick()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(wasPrevented(evt)).toBe(false)
    scoped.stop()
  })
})

describe('failures', () => {
  test('a failed request is reported once and never left as an unhandled rejection', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    fetchMock.mockRejectedValue(new TypeError('network'))
    html('<a class="tdi" href="/x">a</a><form class="tdi" action="/f"></form><select class="tdi" data-ajax-url="/s"><option>1</option></select>')
    click($('a'))
    submit($('form'))
    change($('select'))
    await new Promise((r) => setTimeout(r, 20))
    process.off('unhandledRejection', unhandled)
    expect(unhandled).not.toHaveBeenCalled()
    expect(err).toHaveBeenCalledTimes(3)
  })

  test('a malformed selector rejection is caught and reported', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    html('<a class="tdi" href="/x" data-related-element="[[">a</a>')
    click($('a'))
    await tick()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(err).toHaveBeenCalledTimes(1)
  })

  test('stop() aborts in-flight delegated requests without reporting them as errors', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    let signal!: AbortSignal
    fetchMock.mockImplementation((_u: string, init: RequestInit) => {
      signal = init.signal!
      return new Promise((_res, rej) => signal.addEventListener('abort', () => rej(signal.reason)))
    })
    html('<a class="tdi" href="/x">a</a>')
    click($('a'))
    await tick()
    expect(signal.aborted).toBe(false)
    tdi.stop()
    await tick()
    expect(signal.aborted).toBe(true)
    expect(err).not.toHaveBeenCalled()
  })
})
