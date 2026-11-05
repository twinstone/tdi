import type { TdiOptions } from './types'

export type { TdiOptions }

export interface Tdi {
  version: string
}

export function createTdi(_options?: TdiOptions): Tdi {
  return { version: '2.0.0' }
}
