import { disableTriggerGroup, involvedElements, setLoading } from '../dom/elements'
import type { InstructionRegistry } from '../instructions/registry'
import { sendRequest } from '../net/request'
import type { TdiRequestOptions, TdiResult } from '../types'
import { optionsFromElement } from './options'

export interface Senders {
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
    // Selector lookups may throw SyntaxError; all of them run before any state changes, so a throw leaves nothing behind
    const involved = [...new Set([...involvedElements(el), ...extra])]
    const restore = disableTriggerGroup(el)

    const controller = new AbortController()
    const { signal } = options
    const onAbort = (): void => controller.abort(signal!.reason)
    if (signal?.aborted) onAbort()
    else signal?.addEventListener('abort', onAbort, { once: true })
    live.add(controller)
    setLoading(involved, true)
    try {
      return await sendRequest(url, { ...options, signal: controller.signal }, registry, involved)
    } finally {
      live.delete(controller)
      signal?.removeEventListener('abort', onAbort)
      setLoading(involved, false)
      restore()
    }
  }

  function declined(base: ReturnType<typeof optionsFromElement>): boolean {
    return base.suppressed || (base.confirm !== undefined && !window.confirm(base.confirm))
  }

  async function sendForm(form: HTMLFormElement, options: TdiRequestOptions = {}): Promise<TdiResult | null> {
    const { url, confirm, suppressed, data: _data, trigger: _trigger, ...base } = optionsFromElement(form)
    if (declined({ url, confirm, suppressed, ...base })) return null

    // The trigger counts as the submitter only when it is a submit control of this form
    const t = options.trigger
    const submitter =
      t instanceof HTMLElement && (t instanceof HTMLButtonElement || t instanceof HTMLInputElement) &&
      t.form === form && (t.type === 'submit' || t.type === 'image')
        ? t
        : undefined

    const fd = new FormData(form, submitter) // leaves the DOM untouched
    const hasFile = form.querySelector('input[type=file]') !== null
    const method = hasFile ? 'POST' : (options.method ?? base.method ?? 'GET')
    const data = hasFile ? fd : new URLSearchParams(fd as unknown as Record<string, string>).toString()

    return run(form, { ...base, ...options, method, data, trigger: options.trigger ?? form }, url, submitter ? [submitter] : [])
  }

  async function sendElement(el: Element, options: TdiRequestOptions = {}): Promise<TdiResult | null> {
    if (el instanceof HTMLFormElement) return sendForm(el, options)
    const { url, confirm, suppressed, ...base } = optionsFromElement(el)
    if (declined({ url, confirm, suppressed, ...base })) return null
    return run(el, { ...base, ...options }, url)
  }

  return { sendElement, sendForm }
}
