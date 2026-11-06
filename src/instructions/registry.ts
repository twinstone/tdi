import { dispatch, unknownDoneEventName } from '../events'
import type { TdiRequestOptions, UnknownDetail } from '../types'

export type InstructionHandler<D = any> = (detail: D) => void | Promise<void>

// Instruction names are case-insensitive (v1 lowercased tag names)
const normalise = (name: string): string => name.toLowerCase()

export class InstructionRegistry {
	private handlers = new Map<string, InstructionHandler>()

	// Last registration wins; built-ins and custom instructions use this same path
	register(name: string, handler: InstructionHandler): void {
		this.handlers.set(normalise(name), handler)
	}

	resolve(name: string): InstructionHandler | undefined {
		return this.handlers.get(normalise(name))
	}
}

// Handler errors propagate; the caller must isolate each instruction.
// Fires the cancelable before event; the default action is the handler, or for
// an unhandled instruction the past-tense `tdi:ajax:<name>` event
export async function runInstruction<D>(
	registry: InstructionRegistry,
	name: string,
	detail: D,
	dispatchTarget: EventTarget,
	beforeEventName: string,
): Promise<void> {
	if (!dispatch(dispatchTarget, beforeEventName, detail, true)) return
	const handler = registry.resolve(name)
	if (handler) await handler(detail)
	else dispatch(dispatchTarget, unknownDoneEventName(normalise(name)), detail)
}

// Detail for an instruction without a handler: XML attributes are flattened onto it
export function unknownDetail(tag: Element, options: TdiRequestOptions): UnknownDetail {
	const detail: UnknownDetail = {} as UnknownDetail
	// Attributes first so structural keys always win (deliberate divergence from v1)
	for (const attr of Array.from(tag.attributes)) detail[attr.name] = attr.value
	detail._name = normalise(tag.tagName)
	detail.contents = (tag.textContent ?? '').trim()
	detail.options = options
	detail.tag = tag
	return detail
}
