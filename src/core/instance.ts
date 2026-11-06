import { dispatch, TdiEvents } from '../events'
import { disableTriggerGroup, involvedElements, setLoading } from '../dom/elements'
import type { InstructionRegistry } from '../instructions/registry'
import { sendRequest } from '../net/request'
import type { TdiRequestOptions, TdiResult } from '../types'
import { optionsFromElement } from './options'

export interface Senders {
  /** Always sends; unlike the element senders it has no confirm or suppression step. */
  send(url: string, options?: TdiRequestOptions): Promise<TdiResult>
  /** Resolves to null when nothing was sent (suppressed element or declined confirm). */
  sendElement(el: Element, options?: TdiRequestOptions): Promise<TdiResult | null>
  sendForm(form: HTMLFormElement, options?: TdiRequestOptions): Promise<TdiResult | null>
}

// `live` holds one controller per in-flight request so stop() can abort them all
export function createSenders(
  registry: InstructionRegistry,
  live: Set<AbortController>,
  allowedOrigins?: string[],
): Senders {
  const allowed = allowedOrigins?.map((o) => {
    try {
      return new URL(o).origin
    } catch {
      console.warn(`TDI: allowedOrigins entry "${o}" is not a valid origin and will never match (include the scheme, e.g. https://${o})`)
      return o
    }
  })

  function verifyOrigin(url: string): void {
    if (!allowed) return
    const origin = new URL(url, document.baseURI).origin // the base fetch resolves against
    if (origin === location.origin || allowed.includes(origin)) return
    throw new Error(`TDI: Origin ${origin} is not in allowedOrigins`)
  }

  // Pre-flight, before any state change: fires tdi:ajax:error and rejects
  function checkOrigin(url: string, target: EventTarget, options: TdiRequestOptions): void {
    try {
      verifyOrigin(url)
    } catch (err) {
      dispatch(target, TdiEvents.error, { response: null, status: 0, message: (err as Error).message.slice(5), options })
      throw err
    }
  }

  async function run(
    el: Element,
    options: TdiRequestOptions,
    url: string,
    extra: Element[] = [],
  ): Promise<TdiResult> {
    options.signal?.throwIfAborted() // an already-aborted signal sends nothing
    checkOrigin(url, el, options)
    // Selector lookups may throw SyntaxError; all of them run before any state changes, so a throw leaves nothing behind
    const involved = [...new Set([...involvedElements(el), ...extra])]
    const restore = disableTriggerGroup(el)

    try {
      setLoading(involved, true)
      return await tracked(url, options, involved)
    } finally {
      setLoading(involved, false)
      restore()
    }
  }

  async function tracked(url: string, options: TdiRequestOptions, involved: Element[]): Promise<TdiResult> {
    const controller = new AbortController()
    const { signal } = options
    const onAbort = (): void => controller.abort(signal!.reason)
    try {
      signal?.addEventListener('abort', onAbort, { once: true })
      live.add(controller)
      return await sendRequest(url, { ...options, signal: controller.signal, validateOrigin: verifyOrigin }, registry, involved)
    } finally {
      live.delete(controller)
      signal?.removeEventListener('abort', onAbort)
    }
  }

  async function send(url: string, options: TdiRequestOptions = {}): Promise<TdiResult> {
    options.signal?.throwIfAborted()
    checkOrigin(url, document, options)
    return tracked(url, options, [])
  }

  // The origin check comes before the confirm so nobody confirms a request that is refused anyway
  function declined(
    el: Element,
    url: string,
    options: TdiRequestOptions,
    { suppressed, confirm }: { suppressed: boolean; confirm?: string },
  ): boolean {
    if (suppressed) return true
    checkOrigin(url, el, options)
    return confirm !== undefined && !window.confirm(confirm)
  }

  async function sendForm(form: HTMLFormElement, options: TdiRequestOptions = {}): Promise<TdiResult | null> {
    const { url, method: attrMethod, ...base } = optionsFromElement(form)
    if (declined(form, url, options, base)) return null

    // The trigger counts as the submitter only when it is a submit control of this form
    const t = options.trigger
    const submitter =
      t instanceof HTMLElement && (t instanceof HTMLButtonElement || t instanceof HTMLInputElement) &&
      t.form === form && (t.type === 'submit' || t.type === 'image')
        ? t
        : undefined

    const fd = new FormData(form, submitter) // leaves the DOM untouched
    const hasFile = form.querySelector('input[type=file]') !== null
    const method = hasFile ? 'POST' : (options.method ?? attrMethod ?? 'GET')
    const data = hasFile ? fd : new URLSearchParams(fd as unknown as Record<string, string>).toString()

    return run(form, { ...options, credentials: options.credentials ?? base.credentials, method, data, trigger: options.trigger ?? form }, url, submitter ? [submitter] : [])
  }

  async function sendElement(el: Element, options: TdiRequestOptions = {}): Promise<TdiResult | null> {
    if (el instanceof HTMLFormElement) return sendForm(el, options)
    const { url, confirm, suppressed, ...rest } = optionsFromElement(el)
    if (declined(el, url, options, { confirm, suppressed })) return null
    return run(el, { ...rest, ...options }, url)
  }

  return { send, sendElement, sendForm }
}
