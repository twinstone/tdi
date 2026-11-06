import { createTdi } from './index'
import type { TdiOptions } from './types'

// Configuration comes from TDI's own script tag; invalid values are validated and warned about by createTdi
function optionsFromScriptTag(script: Element | null): TdiOptions {
  const options: TdiOptions = {}
  const policy = script?.getAttribute('data-content-scripts')
  if (policy != null) options.contentScripts = policy as TdiOptions['contentScripts']
  const origins = script?.getAttribute('data-allowed-origins')
  if (origins != null) options.allowedOrigins = origins.split(',').map((o) => o.trim()).filter(Boolean)
  return options
}

const tdi = createTdi(optionsFromScriptTag(document.currentScript))
;(window as unknown as { TDI: unknown }).TDI = tdi
tdi.start()
