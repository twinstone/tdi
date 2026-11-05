import { dispatch, TdiEvents } from '../events'
import type { PopupDetail, TdiRequestOptions } from '../types'

// Returns null without an href, so the caller skips the instruction
export function buildPopupDetail(tag: Element, options: TdiRequestOptions): PopupDetail | null {
  const href = tag.getAttribute('href')
  if (!href) return null
  return {
    href,
    mode: tag.getAttribute('mode') || 'popup',
    width: parseInt(tag.getAttribute('width') || '600', 10),
    height: parseInt(tag.getAttribute('height') || '500', 10),
    options,
    tag,
  }
}

// Plain window.open (spec D8). Popup blockers usually block it: it runs after an async response, without user activation
export function applyPopup(detail: PopupDetail): void {
  const features = detail.mode === 'dialog' ? `width=${detail.width}, height=${detail.height}` : ''
  detail.popup = window.open(detail.href, '_blank', features)
  dispatch(document, TdiEvents.popup, detail)
}
