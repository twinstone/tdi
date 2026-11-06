import type { TdiRequestOptions } from '../types'

export type ElementOptions = TdiRequestOptions & {
	url: string
	confirm?: string
	suppressed: boolean
}

const CREDENTIALS = ['omit', 'same-origin', 'include']

export function optionsFromElement(el: Element): ElementOptions {
	const attr = (name: string): string | null => el.getAttribute(name)
	const name = attr('name')
	const value = 'value' in el && typeof el.value === 'string' ? el.value : ''

	// v1 precedence; an empty attribute falls through, and a bare value is the last resort
	const url = attr('data-ajax-url') || attr('href') || attr('action') || value
	const method = attr('data-ajax-method') || attr('method') || undefined

	const data: Record<string, unknown> = {}
	if (name && value) {
		// v1 quirk: an unchecked checkbox sends 0
		data[name] =
			el instanceof HTMLInputElement && el.type === 'checkbox' && !el.checked ? 0 : value
	}

	const options: ElementOptions = {
		url,
		data,
		trigger: el,
		suppressed: el.hasAttribute('disabled') || el.classList.contains('disabled'),
	}
	if (method) options.method = method
	const confirm = attr('data-confirm')
	if (confirm) options.confirm = confirm
	const credentials = attr('data-ajax-credentials')
	if (credentials) {
		if (CREDENTIALS.includes(credentials))
			options.credentials = credentials as RequestCredentials
		else
			console.warn(
				`TDI: invalid data-ajax-credentials "${credentials}" ignored (use omit, same-origin or include)`,
			)
	}
	return options
}
