import { injectInlineScript, injectScript } from './assets'

// <template> parses in a neutral context, so table parts like a bare <tr> survive
export function parseFragment(html: string): DocumentFragment {
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  return tpl.content
}

// Only classic JavaScript is replayed; data blocks (JSON, templates) must not run
function isJavaScript(el: HTMLScriptElement): boolean {
  const type = (el.getAttribute('type') ?? '').trim().toLowerCase()
  return type === '' || type === 'text/javascript' || type === 'application/javascript'
}

// Parser-inserted scripts never run, so replay each through a fresh element, in order
export async function runContentScripts(root: ParentNode, nonce?: string): Promise<void> {
  const scripts = Array.from(root.querySelectorAll('script')).filter(isJavaScript)
  for (const old of scripts) {
    const src = old.getAttribute('src')
    const code = old.textContent ?? ''
    old.remove() // drop the inert node so nothing can re-run it
    if (src) await injectScript(src, { nonce })
    else injectInlineScript(code, { nonce })
  }
}
