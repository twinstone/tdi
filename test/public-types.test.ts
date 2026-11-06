import { describe, expect, expectTypeOf, test } from 'vitest'
import type {
	InstructionHandler,
	Tdi,
	TdiOptions,
	TdiRequestOptions,
	TdiResult,
	UpdateDetail,
} from '../src/index'
import { createTdi } from '../src/index'

// Guards the public entry: consumers must be able to name these from 'twinstone-tdi'
describe('public entry types', () => {
	test('handler and listener payloads can be typed from the entry', () => {
		const handler: InstructionHandler<{ count: string }> = (d) => void d.count
		const listener = (e: Event): void => void (e as CustomEvent<UpdateDetail>).detail.target_id
		const opts: TdiRequestOptions = { method: 'POST' }
		const tdi: Tdi = createTdi({} satisfies TdiOptions)
		tdi.registerInstruction('x', handler)
		expectTypeOf(tdi.send).returns.resolves.toEqualTypeOf<TdiResult>()
		expect([listener, opts]).toHaveLength(2)
	})
})
