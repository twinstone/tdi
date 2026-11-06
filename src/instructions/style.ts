import { dispatch, TdiEvents } from '../events'
import { injectStyle } from '../dom/assets'
import type { StyleDetail, TdiRequestOptions } from '../types'

export interface StyleNonceOptions {
	nonce?: string
}

export function buildStyleDetail(tag: Element, options: TdiRequestOptions): StyleDetail {
	return { style_src: tag.getAttribute('src'), style_id: tag.getAttribute('id'), options, tag }
}

export async function applyStyle(
	detail: StyleDetail,
	scripts: StyleNonceOptions = {},
): Promise<void> {
	const { style_src: src, style_id: id } = detail

	// An id already in the document means the sheet is loaded; v1 skipped the event here, v2 still fires it
	if (src && !(id && document.getElementById(id))) {
		// `?? undefined` only satisfies the types: the `src` guard means inject never returns null here
		detail.style_node =
			(await injectStyle(src, { id: id || undefined, nonce: scripts.nonce })) ?? undefined
	}

	dispatch(document, TdiEvents.style, detail)
}
