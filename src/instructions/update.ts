import { dispatch, TdiEvents } from '../events'
import { parseFragment, runContentScripts } from '../dom/html'
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
  const inserted: Node[] = []
  const replaced: Element[] = []
  let eventTarget: EventTarget = detail.target[0] ?? document

  for (const el of detail.target) {
    el.classList.remove(...classTokens(detail.class_remove))
    el.classList.add(...classTokens(detail.class_add))

    const fragment = parseFragment(detail.content) // fresh copy per target
    inserted.push(...Array.from(fragment.childNodes))
    if (detail.replace === 'true') {
      replaced.push(...Array.from(fragment.children))
      el.replaceWith(fragment)
    } else if (detail.append === 'true') el.append(fragment)
    else if (detail.prepend === 'true') el.prepend(fragment)
    else el.replaceChildren(fragment)
  }

  if (detail.replace === 'true') {
    detail.target = replaced
    eventTarget = replaced[0] ?? document
  }

  // Run after insertion so scripts see the new DOM. The scope covers only the new nodes,
  // never scripts already in the page; top-level scripts are matched too.
  const scope = {
    querySelectorAll: (sel: string) =>
      inserted.flatMap((n) =>
        n instanceof Element ? [...(n.matches(sel) ? [n] : []), ...Array.from(n.querySelectorAll(sel))] : [],
      ),
  } as unknown as ParentNode
  await runContentScripts(scope, scripts)

  dispatch(eventTarget, TdiEvents.update, detail)
}
