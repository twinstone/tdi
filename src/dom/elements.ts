type Disableable = Element & { disabled: boolean }

const isDisabled = (el: Element): boolean =>
	el.classList.contains('disabled') || el.hasAttribute('disabled')
const canDisable = (el: Element): el is Disableable => 'disabled' in el

function queryAll(selector: string | null): Element[] {
	if (!selector) return []
	return [...document.querySelectorAll(selector)]
}

export function relatedElements(el: Element): Element[] {
	const related: Element[] = []
	const ancestor = el.getAttribute('data-related-ancestor')
	const found = ancestor ? el.closest(ancestor) : null
	if (found) related.push(found)
	for (const e of queryAll(el.getAttribute('data-related-element')))
		if (!related.includes(e)) related.push(e)
	return related
}

export function involvedElements(el: Element): Element[] {
	return [el, ...relatedElements(el).filter((e) => e !== el)]
}

export function setLoading(els: Element[], on: boolean): void {
	for (const el of els) el.classList.toggle('loading', on)
}

// Disables the trigger group; the undo re-enables only what this call disabled
export function disableTriggerGroup(el: Element): () => void {
	const changed: Element[] = []
	for (const e of queryAll(el.getAttribute('data-trigger-group'))) {
		if (isDisabled(e)) continue
		e.classList.add('disabled')
		if (canDisable(e)) e.disabled = true
		changed.push(e)
	}
	return () => {
		for (const e of changed.splice(0)) {
			e.classList.remove('disabled')
			if (canDisable(e)) e.disabled = false
		}
	}
}
