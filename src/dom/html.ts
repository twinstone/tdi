import type { ContentScriptPolicy } from '../types'
import { injectInlineScript, injectScript } from './assets'

// <template> parses in a neutral context, so table parts like a bare <tr> survive
export function parseFragment(html: string): DocumentFragment {
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  return tpl.content
}

const COPIED_ATTRS = ['integrity', 'crossorigin', 'referrerpolicy']

function scriptType(el: HTMLScriptElement): string {
  return (el.getAttribute('type') ?? '').trim().toLowerCase()
}

// Browsers hide the nonce attribute after parsing but keep the property
function carriesNonce(el: HTMLScriptElement, nonce: string | undefined): boolean {
  return !!nonce && (el.nonce === nonce || el.getAttribute('nonce') === nonce)
}

function copiedAttrs(el: HTMLScriptElement): Record<string, string> {
  const out: Record<string, string> = {}
  for (const { name, value } of Array.from(el.attributes)) {
    if (COPIED_ATTRS.includes(name) || name.startsWith('data-')) out[name] = value
  }
  return out
}

/**
 * Parser-inserted scripts never run, so replay each through a fresh element, in order.
 * Mutates the caller's tree: every replayed script node is removed from `root`.
 * Non-JS types are left in place; type=module is skipped with a warning.
 */
export async function runContentScripts(
  root: ParentNode,
  opts: { nonce?: string; policy?: ContentScriptPolicy } = {},
): Promise<void> {
  await runScriptsList(Array.from(root.querySelectorAll('script')), opts)
}

/** Same as runContentScripts for an explicit, already-collected list (nodes may be live in the page). */
export async function runScriptsList(
  scripts: HTMLScriptElement[],
  opts: { nonce?: string; policy?: ContentScriptPolicy } = {},
): Promise<void> {
  const { nonce, policy = 'all' } = opts
  for (const old of scripts) {
    const type = scriptType(old)
    if (type === 'module') {
      console.warn(`TDI: type=module script skipped in update content (${old.getAttribute('src') || old.id || 'inline'})`)
      continue
    }
    if (type !== '' && type !== 'text/javascript' && type !== 'application/javascript') continue
    if (policy === 'nonce-only' && !carriesNonce(old, nonce)) continue
    const src = old.getAttribute('src')
    const code = old.textContent ?? ''
    // TDI's own nonce wins; without one, honour a nonce the server put on the script
    const assetOpts = { nonce: nonce ?? (old.nonce || old.getAttribute('nonce') || undefined), attrs: copiedAttrs(old) }
    old.remove() // drop the inert node so nothing can re-run it
    if (src) await injectScript(src, assetOpts)
    else injectInlineScript(code, assetOpts)
  }
}
