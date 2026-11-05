import { dispatch } from '../events'
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

// Fires the cancelable before event; the handler is its default action
export async function runInstruction<D>(
  registry: InstructionRegistry,
  name: string,
  detail: D,
  dispatchTarget: EventTarget,
  beforeEventName: string,
): Promise<void> {
  if (!dispatch(dispatchTarget, beforeEventName, detail, true)) return
  await registry.resolve(name)?.(detail)
}

// Detail for an instruction without a handler: XML attributes are flattened onto it
export function unknownDetail(tag: Element, options: TdiRequestOptions): UnknownDetail {
  const detail: UnknownDetail = {
    _name: normalise(tag.tagName),
    contents: (tag.textContent ?? '').trim(),
    options,
    tag,
  }
  for (const attr of Array.from(tag.attributes)) detail[attr.name] = attr.value
  return detail
}
