import { dispatch, TdiEvents } from '../events'
import { injectInlineScript, injectScript } from '../dom/assets'
import type { ScriptDetail, TdiRequestOptions } from '../types'

export interface ScriptNonceOptions {
	nonce?: string
}

export function buildScriptDetail(tag: Element, options: TdiRequestOptions): ScriptDetail {
	return {
		script_src: tag.getAttribute('src'),
		script_data: (tag.textContent ?? '').trim(),
		script_id: tag.getAttribute('id'),
		options,
		tag,
	}
}

// Sequences only its own src-then-inline pair; ordering across instructions is the pipeline's job
export async function applyScript(
	detail: ScriptDetail,
	scripts: ScriptNonceOptions = {},
): Promise<void> {
	const { script_src: src, script_data: code, script_id: id } = detail
	const opts = { id: id || undefined, nonce: scripts.nonce }

	// An id already in the document means the script is loaded: skip the download but carry on (v1 stalled here)
	if (src && !(id && document.getElementById(id))) {
		// `?? undefined` only satisfies the types: the `src` guard means inject never returns null here
		detail.script_node = (await injectScript(src, opts)) ?? undefined // resolves on error too
	}
	if (code) detail.script_node_inline = injectInlineScript(code, opts)

	dispatch(document, TdiEvents.script, detail)
}
