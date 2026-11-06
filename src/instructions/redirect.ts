import type { RedirectDetail, TdiRequestOptions } from '../types'

// Returns null without an href, so the caller skips the instruction
export function buildRedirectDetail(
	tag: Element,
	options: TdiRequestOptions,
): RedirectDetail | null {
	const href = tag.getAttribute('href')
	return href ? { href, options, tag } : null
}

// No past-tense event: v1 fires none
export function applyRedirect(detail: RedirectDetail): void {
	window.location.assign(detail.href)
}
