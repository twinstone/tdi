import { describe, expect, test } from 'vitest'
import { ajaxifyUrl } from '../../src/net/url'

const parse = (url: string) => new URL(url, document.baseURI)

describe('ajaxifyUrl', () => {
  test('adds params to a bare path and keeps it relative', () => {
    const out = ajaxifyUrl('/a')
    expect(out).toMatch(/^\/a\?_infuse=1&_ts=\d+$/)
  })

  test('keeps existing params', () => {
    const out = ajaxifyUrl('/a?x=1')
    expect(out).toMatch(/^\/a\?/)
    const u = parse(out)
    expect(u.searchParams.get('x')).toBe('1')
    expect(u.searchParams.get('_infuse')).toBe('1')
    expect(u.searchParams.get('_ts')).toMatch(/^\d+$/)
  })

  test('puts params before the fragment', () => {
    expect(ajaxifyUrl('/a#frag')).toMatch(/^\/a\?_infuse=1&_ts=\d+#frag$/)
  })

  test('handles an empty query before the fragment', () => {
    expect(ajaxifyUrl('/a?#frag')).toMatch(/^\/a\?_infuse=1&_ts=\d+#frag$/)
  })

  test('handles a trailing ampersand before the fragment', () => {
    const out = ajaxifyUrl('/a?x=1&#frag')
    expect(out).toMatch(/^\/a\?x=1&_infuse=1&_ts=\d+#frag$/)
  })

  test('leaves other origins absolute and untouched apart from params', () => {
    const out = ajaxifyUrl('https://other.example/a?x=1')
    const u = new URL(out)
    expect(out.startsWith('https://other.example/a?')).toBe(true)
    expect(u.searchParams.get('x')).toBe('1')
    expect(u.searchParams.get('_infuse')).toBe('1')
  })

  test('keeps a same-origin absolute URL absolute', () => {
    const out = ajaxifyUrl(`${parse('/').origin}/a`)
    expect(out.startsWith(parse('/').origin + '/a?')).toBe(true)
  })

  test('does not duplicate _infuse or _ts', () => {
    const out = ajaxifyUrl('/a?_infuse=1&_ts=5')
    const u = parse(out)
    expect(u.searchParams.getAll('_infuse')).toEqual(['1'])
    expect(u.searchParams.getAll('_ts')).toHaveLength(1)
    expect(u.searchParams.get('_ts')).not.toBe('5')
  })
})
