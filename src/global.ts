import { createTdi } from './index'

const tdi = createTdi()
;(window as unknown as { TDI: unknown }).TDI = tdi
tdi.start()
