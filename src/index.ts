import { createSenders } from './core/instance'
import { createDefaultRegistry } from './core/pipeline'
import { bindDelegation } from './dom/delegation'
import type { InstructionHandler } from './instructions/registry'
import { ajaxifyUrl } from './net/url'
import type { ContentScriptPolicy, TdiOptions, TdiRequestOptions, TdiResult } from './types'

export type { TdiOptions }

export interface Tdi {
  version: string
  start(): void
  stop(): void
  send(url: string, options?: TdiRequestOptions): Promise<TdiResult>
  sendElement(el: Element, options?: TdiRequestOptions): Promise<TdiResult | null>
  sendForm(form: HTMLFormElement, options?: TdiRequestOptions): Promise<TdiResult | null>
  ajaxifyUrl(url: string): string
  registerInstruction(name: string, handler: InstructionHandler): void
}

// Read once: document.currentScript is only set while the script itself runs
const script = typeof document === 'undefined' ? null : (document.currentScript as HTMLScriptElement | null)
const NONCE = script ? script.nonce || script.getAttribute('nonce') || undefined : undefined

// An unknown value must not widen the policy, so it falls back to the strict one
function validPolicy(value: unknown): ContentScriptPolicy {
  if (value === undefined || value === 'all' || value === 'nonce-only') return value ?? 'all'
  console.warn(`TDI: invalid contentScripts "${String(value)}" ignored (use all or nonce-only); using nonce-only (scripts without a matching nonce will not run)`)
  return 'nonce-only'
}

export function createTdi(options: TdiOptions = {}): Tdi {
  const policy = validPolicy(options.contentScripts)
  const registry = createDefaultRegistry({ nonce: options.nonce ?? NONCE, policy })
  const live = new Set<AbortController>()
  const senders = createSenders(registry, live, options.allowedOrigins)
  let unbind: (() => void) | null = null

  const stop = (): void => {
    unbind?.()
    unbind = null
    for (const controller of live) controller.abort()
  }

  return {
    version: '2.0.0',
    start() {
      unbind ??= bindDelegation(options.root ?? document, senders)
    },
    stop,
    ...senders,
    ajaxifyUrl,
    registerInstruction: (name, handler) => registry.register(name, handler),
  }
}
