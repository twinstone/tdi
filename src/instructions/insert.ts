import { dispatch, TdiEvents } from '../events'
import { parseFragment, runScriptsList } from '../dom/html'
import type { ContentScriptPolicy, InsertDetail, TdiRequestOptions } from '../types'

export interface InsertScriptOptions {
  nonce?: string
  policy?: ContentScriptPolicy
}

// Targets resolve against `document`; `selector` wins over `target` (an element id).
// Returns null when nothing matches, so the caller skips the instruction.
export function buildInsertDetail(tag: Element, options: TdiRequestOptions): InsertDetail | null {
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

  return {
    target_id: targetId,
    selector,
    target,
    content: (tag.textContent ?? '').trim(),
    position: tag.getAttribute('position') || 'after',
    options,
    tag,
  }
}

export async function applyInsert(detail: InsertDetail, scripts: InsertScriptOptions = {}): Promise<void> {
  const pending: HTMLScriptElement[] = []
  const inserted: Element[] = []

  for (const el of detail.target) {
    const fragment = parseFragment(detail.content) // fresh copy per target
    // Collected before insertion so only the new content's scripts run, never the page's own
    pending.push(...Array.from(fragment.querySelectorAll('script')))
    inserted.push(...Array.from(fragment.children))
    if (detail.position === 'before') el.before(fragment)
    else el.after(fragment)
  }
  detail.inserted_node = inserted

  // Runs after insertion so scripts see the new DOM. An error here propagates before the
  // insert event fires, with the DOM already changed (registry contract: propagate, caller isolates).
  await runScriptsList(pending, scripts)

  // v1 triggered on the whole target set, so every target gets the event (unlike update)
  for (const el of detail.target) dispatch(el, TdiEvents.insert, detail)
}
