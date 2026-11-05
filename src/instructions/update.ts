import { dispatch, TdiEvents } from '../events'
import { parseFragment, runScriptsList } from '../dom/html'
import type { ContentScriptPolicy, TdiRequestOptions, UpdateDetail } from '../types'

export interface UpdateScriptOptions {
  nonce?: string
  policy?: ContentScriptPolicy
}

// Targets resolve against `document`; `selector` wins over `target` (an element id).
// Returns null when nothing matches, so the caller skips the instruction.
export function buildUpdateDetail(tag: Element, options: TdiRequestOptions): UpdateDetail | null {
  const targetId = tag.getAttribute('target')
  const selector = tag.getAttribute('selector')
  let target: Element[]
  // An invalid selector throws (the caller isolates it); a valid one matching nothing returns null
  if (selector) target = Array.from(document.querySelectorAll(selector))
  else {
    const el = targetId ? document.getElementById(targetId) : null
    target = el ? [el] : []
  }
  if (target.length === 0) return null

  const content = (tag.textContent ?? '').trim()
  return {
    target_id: targetId,
    selector,
    target,
    content,
    // Informational only: an empty body still clears the target (v1 behaviour)
    content_empty: content.replace(/&nbsp;/g, '').length === 0,
    replace: tag.getAttribute('replace'),
    append: tag.getAttribute('append'),
    prepend: tag.getAttribute('prepend'),
    class_add: tag.getAttribute('class-add') || '',
    class_remove: tag.getAttribute('class-remove') || '',
    options,
    tag,
  }
}

const classTokens = (s: string): string[] => s.split(/\s+/).filter(Boolean)

export async function applyUpdate(detail: UpdateDetail, scripts: UpdateScriptOptions = {}): Promise<void> {
  const pending: HTMLScriptElement[] = []
  let replaced: Element[] = []

  for (const el of detail.target) {
    el.classList.remove(...classTokens(detail.class_remove))
    el.classList.add(...classTokens(detail.class_add))

    const fragment = parseFragment(detail.content) // fresh copy per target
    // Collected before insertion so only the new content's scripts run, never the page's own
    pending.push(...Array.from(fragment.querySelectorAll('script')))
    if (detail.replace === 'true') {
      replaced.push(...Array.from(fragment.children))
      el.replaceWith(fragment)
    } else if (detail.append === 'true') el.append(fragment)
    else if (detail.prepend === 'true') el.prepend(fragment)
    else el.replaceChildren(fragment)
  }

  // Runs after insertion so scripts see the new DOM. An error here propagates before the
  // update event fires, with the DOM already changed (registry contract: propagate, caller isolates).
  await runScriptsList(pending, scripts)

  if (detail.replace === 'true') {
    // Script-only content leaves detached nodes behind once the scripts are replayed
    replaced = replaced.filter((e) => e.isConnected)
    detail.target = replaced
  }
  // v1 fired on the first target only; nothing to fire on when a replace produced no elements
  const first = detail.target[0]
  if (first) dispatch(first, TdiEvents.update, detail)
}
