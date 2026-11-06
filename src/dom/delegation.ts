import { dispatch, TdiEvents } from '../events'
import type { Senders } from '../core/instance'

const LINK = 'a.tdi, a.infuse'
const FORM = 'form.tdi, form.infuse'
const CHANGE = [
	'select.tdi',
	'select.infuse',
	'input[type=checkbox].tdi',
	'input[type=checkbox].infuse',
	'input[type=radio].tdi',
	'input[type=radio].infuse',
].join(',')
const TEXT = 'input[type=text].tdi, input[type=text].infuse'

// An abort is a deliberate stop(); everything else is reported once, never left unhandled
function report(error: unknown): void {
	if ((error as Error | null)?.name === 'AbortError') return // not instanceof: DOMException differs across realms
	console.error('TDI: request failed', error)
}

/** Binds one delegated listener per event type on root; returns the function that removes them all. */
export function bindDelegation(
	root: Document | Element,
	{ sendElement, sendForm }: Senders,
): () => void {
	const match = (evt: Event, selector: string): Element | null => {
		const hit = evt.target instanceof Element ? evt.target.closest(selector) : null
		return hit && root.contains(hit) ? hit : null
	}

	function submitForm(form: HTMLFormElement, submitter?: HTMLElement | null): void {
		if (!dispatch(form, TdiEvents.beforeFormSubmit, { form }, true)) return
		sendForm(form, submitter ? { trigger: submitter } : {}).catch(report)
	}

	// A field with its own URL sends itself; otherwise it stands in for its form
	function sendField(field: Element): void {
		if (field.getAttribute('data-ajax-url')) sendElement(field).catch(report)
		else if ((field as HTMLInputElement).form) submitForm((field as HTMLInputElement).form!)
	}

	const onClick = (evt: Event): void => {
		const e = evt as MouseEvent
		const link = match(e, LINK)
		if (!link) return
		if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return // the browser opens a new tab or window
		e.preventDefault()
		if (!dispatch(link, TdiEvents.beforeLinkClick, { link }, true)) return
		sendElement(link).catch(report)
	}

	const onSubmit = (evt: Event): void => {
		const form = match(evt, FORM)
		if (!form) return
		evt.preventDefault()
		submitForm(form as HTMLFormElement, (evt as SubmitEvent).submitter)
	}

	const onChange = (evt: Event): void => {
		const field = match(evt, CHANGE)
		if (field) sendField(field)
	}

	const onKeydown = (evt: Event): void => {
		const e = evt as KeyboardEvent
		const field = match(e, TEXT)
		if (!field || e.key !== 'Enter' || e.isComposing) return
		e.preventDefault()
		sendField(field)
	}

	const listeners: [string, (evt: Event) => void][] = [
		['click', onClick],
		['submit', onSubmit],
		['change', onChange],
		['keydown', onKeydown],
	]
	for (const [type, fn] of listeners) root.addEventListener(type, fn)
	return () => {
		for (const [type, fn] of listeners) root.removeEventListener(type, fn)
	}
}
