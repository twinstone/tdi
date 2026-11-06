export interface ParsedResponse {
	status: string
	ok: boolean
	instructions: Element[]
}

export class TdiParseError extends Error {
	override name = 'TdiParseError'
}

export function parseResponse(xmlText: string): ParsedResponse {
	if (xmlText.trim() === '') throw new TdiParseError('Empty response body')

	// DOMParser does not throw on malformed XML; it embeds a <parsererror> element instead
	const doc = new DOMParser().parseFromString(xmlText, 'application/xml')
	const root = doc.documentElement
	if (doc.getElementsByTagName('parsererror').length > 0) {
		throw new TdiParseError('Malformed XML response')
	}
	if (root?.tagName !== 'response') {
		throw new TdiParseError('Response root element is not <response>')
	}

	const children = Array.from(root.children)
	const status = children.find((e) => e.tagName === 'status')?.textContent ?? ''
	return {
		status,
		ok: status.toLowerCase() === 'ok',
		instructions: children.filter((e) => e.tagName !== 'status'),
	}
}
