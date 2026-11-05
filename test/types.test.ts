import { describe, expect, test } from 'vitest'
import type {
  ErrorDetail,
  InsertDetail,
  PopupDetail,
  RedirectDetail,
  ScriptDetail,
  StyleDetail,
  UpdateDetail,
} from '../src/types'

const keys = (o: object) => Object.keys(o).sort()
const tag = document.createElement('update')
const el = document.createElement('div')

// Expected key lists are the R3 list from the design doc, not derived from src/types.ts
describe('detail payload key names (R3, v1 verbatim)', () => {
  test('UpdateDetail', () => {
    const d: UpdateDetail = {
      target_id: 'a', selector: null, target: [el], content: '', content_empty: true,
      replace: null, append: null, prepend: null, class_add: '', class_remove: '',
      options: {}, tag,
    }
    expect(keys(d)).toEqual(
      ['target_id', 'selector', 'target', 'content', 'content_empty', 'replace', 'append',
        'prepend', 'class_add', 'class_remove', 'options', 'tag'].sort(),
    )
  })

  test('InsertDetail', () => {
    const d: InsertDetail = {
      target_id: 'a', selector: null, target: [el], content: '', position: 'after',
      inserted_node: [el], options: {}, tag,
    }
    expect(keys(d)).toEqual(
      ['target_id', 'selector', 'target', 'content', 'position', 'inserted_node', 'options',
        'tag'].sort(),
    )
  })

  test('ScriptDetail', () => {
    const d: ScriptDetail = {
      script_src: null, script_data: '', script_id: null, script_node: el,
      script_node_inline: el, options: {}, tag,
    }
    expect(keys(d)).toEqual(
      ['script_src', 'script_data', 'script_id', 'script_node', 'script_node_inline', 'options',
        'tag'].sort(),
    )
  })

  test('StyleDetail', () => {
    const d: StyleDetail = { style_src: 'a', style_id: null, style_node: el, options: {}, tag }
    expect(keys(d)).toEqual(['style_src', 'style_id', 'style_node', 'options', 'tag'].sort())
  })

  test('RedirectDetail', () => {
    const d: RedirectDetail = { href: '/x', options: {}, tag }
    expect(keys(d)).toEqual(['href', 'options', 'tag'].sort())
  })

  test('PopupDetail', () => {
    const d: PopupDetail = { href: '/x', mode: 'popup', width: 600, height: 500, options: {}, tag }
    expect(keys(d)).toEqual(['href', 'mode', 'width', 'height', 'options', 'tag'].sort())
  })

  test('ErrorDetail', () => {
    const d: ErrorDetail = { response: null, status: 0, message: 'x', options: {} }
    expect(keys(d)).toEqual(['response', 'status', 'message', 'options'].sort())
  })
})
