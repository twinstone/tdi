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
export function createSenders(registry: InstructionRegistry, live: Set<AbortController>): Senders {
  async function run(
    el: Element,
    options: TdiRequestOptions,
    url: string,
    extra: Element[] = [],
  ): Promise<TdiResult> {
    options.signal?.throwIfAborted() // an already-aborted signal sends nothing
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
      return await sendRequest(url, { ...options, signal: controller.signal }, registry, involved)
    } finally {
      live.delete(controller)
      signal?.removeEventListener('abort', onAbort)
    }
  }

  async function send(url: string, options: TdiRequestOptions = {}): Promise<TdiResult> {
    options.signal?.throwIfAborted()
    return tracked(url, options, [])
  }

  function declined({ suppressed, confirm }: { suppressed: boolean; confirm?: string }): boolean {
    return suppressed || (confirm !== undefined && !window.confirm(confirm))
  }

  async function sendForm(form: HTMLFormElement, options: TdiRequestOptions = {}): Promise<TdiResult | null> {
    const { url, method: attrMethod, ...base } = optionsFromElement(form)
    if (declined(base)) return null

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
    if (declined({ confirm, suppressed })) return null
    return run(el, { ...rest, ...options }, url)
  }

  return { send, sendElement, sendForm }
}
