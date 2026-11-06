export interface AssetOptions {
	id?: string
	nonce?: string
	// Extra attributes copied verbatim (integrity, crossorigin, data-*, ...)
	attrs?: Record<string, string>
}

// Nonce goes on both attribute and property; some browsers need both for CSP
function applyCommon(
	el: HTMLScriptElement | HTMLLinkElement,
	{ id, nonce, attrs }: AssetOptions,
): void {
	for (const [k, v] of Object.entries(attrs ?? {})) el.setAttribute(k, v)
	if (id) el.id = id
	if (nonce) {
		el.setAttribute('nonce', nonce)
		el.nonce = nonce
	}
}

// Resolves on error too, so a failed asset cannot stall the response pipeline
function settleOnLoad<T extends HTMLElement>(el: T): Promise<T> {
	return new Promise((resolve) => {
		el.addEventListener('load', () => resolve(el), { once: true })
		el.addEventListener('error', () => resolve(el), { once: true })
	})
}

export function injectScript(
	src: string,
	opts: AssetOptions = {},
): Promise<HTMLScriptElement | null> {
	// Empty src: nothing to load, and an empty link href fires no event
	if (!src) return Promise.resolve(null)
	const el = document.createElement('script')
	el.src = src
	applyCommon(el, opts)
	const done = settleOnLoad(el)
	document.head.appendChild(el)
	return done
}

export function injectInlineScript(code: string, opts: AssetOptions): HTMLScriptElement {
	const el = document.createElement('script')
	applyCommon(el, { ...opts, id: opts.id ? `${opts.id}_inline` : undefined })
	el.textContent = code
	document.head.appendChild(el)
	return el
}

export function injectStyle(
	src: string,
	opts: AssetOptions & { media?: string } = {},
): Promise<HTMLLinkElement | null> {
	if (!src) return Promise.resolve(null)
	const el = document.createElement('link')
	el.rel = 'stylesheet'
	el.media = opts.media || 'screen'
	el.href = src
	applyCommon(el, opts)
	const done = settleOnLoad(el)
	document.head.appendChild(el)
	return done
}
