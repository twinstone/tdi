// Returns false when a cancelable event was prevented by a listener
export function dispatch<T>(
  target: EventTarget,
  name: string,
  detail: T,
  cancelable = false,
): boolean {
  return target.dispatchEvent(new CustomEvent<T>(name, { detail, bubbles: true, cancelable }))
}

export const TdiEvents = {
  beforeLinkClick: 'tdi:ajax:beforeLinkClick',
  beforeFormSubmit: 'tdi:ajax:beforeFormSubmit',
  start: 'tdi:ajax:start',
  end: 'tdi:ajax:end',
  error: 'tdi:ajax:error',
  done: 'tdi:ajax:done',
  beforeUpdate: 'tdi:ajax:beforeUpdate',
  update: 'tdi:ajax:update',
  beforeInsert: 'tdi:ajax:beforeInsert',
  insert: 'tdi:ajax:insert',
  beforeScript: 'tdi:ajax:beforeScript',
  script: 'tdi:ajax:script',
  beforeStyle: 'tdi:ajax:beforeStyle',
  style: 'tdi:ajax:style',
  beforeReload: 'tdi:ajax:beforeReload',
  beforeRedirect: 'tdi:ajax:beforeRedirect',
  beforePopup: 'tdi:ajax:beforePopup',
  popup: 'tdi:ajax:popup',
  updatesDone: 'tdi:ajax:updatesDone',
  insertsDone: 'tdi:ajax:insertsDone',
  scriptsDone: 'tdi:ajax:scriptsDone',
  stylesDone: 'tdi:ajax:stylesDone',
  popupsDone: 'tdi:ajax:popupsDone',
  unknownsDone: 'tdi:ajax:unknownsDone',
} as const

// Unknown instructions fire `tdi:ajax:before<Name>`; each hyphen segment is capitalized (cart-badge -> CartBadge)
export const unknownEventName = (instruction: string): string =>
  `tdi:ajax:before${instruction
    .toLowerCase()
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')}`

// Past-tense form fired after an unknown instruction's default action: `tdi:ajax:<name>`
export const unknownDoneEventName = (instruction: string): string => `tdi:ajax:${instruction.toLowerCase()}`
