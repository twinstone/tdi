import type { ReloadDetail, TdiRequestOptions } from '../types'

export function buildReloadDetail(tag: Element, options: TdiRequestOptions): ReloadDetail {
  return { options, tag }
}

// No past-tense event: v1 fires none. reload() takes no argument (v1's `true` is ignored by browsers)
export function applyReload(_detail: ReloadDetail): void {
  window.location.reload()
}
