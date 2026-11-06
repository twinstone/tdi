import { describe, expect, test } from 'vitest'
import { ajaxifyUrl } from '../../src/net/url'

const OWN = /_infuse=1&_ts=\d+/

describe('ajaxifyUrl', () => {
	test('adds params to a bare path', () => {
		expect(ajaxifyUrl('/a')).toMatch(/^\/a\?_infuse=1&_ts=\d+$/)
	})

	test('keeps existing params first', () => {
		expect(ajaxifyUrl('/a?x=1')).toMatch(/^\/a\?x=1&_infuse=1&_ts=\d+$/)
	})

	test('puts params before the fragment', () => {
		expect(ajaxifyUrl('/a#frag')).toMatch(/^\/a\?_infuse=1&_ts=\d+#frag$/)
	})

	test('handles an empty query before the fragment', () => {
		expect(ajaxifyUrl('/a?#frag')).toMatch(/^\/a\?_infuse=1&_ts=\d+#frag$/)
	})

	test('handles a trailing ampersand before the fragment', () => {
		expect(ajaxifyUrl('/a?x=1&#frag')).toMatch(/^\/a\?x=1&_infuse=1&_ts=\d+#frag$/)
	})

	test('handles a trailing question mark', () => {
		expect(ajaxifyUrl('/a?')).toMatch(/^\/a\?_infuse=1&_ts=\d+$/)
	})

	test('cross-origin absolute URL keeps host, path, query and fragment last', () => {
		expect(ajaxifyUrl('https://other.example/a?x=1#f')).toMatch(
			/^https:\/\/other\.example\/a\?x=1&_infuse=1&_ts=\d+#f$/,
		)
	})

	test('same-origin absolute URL stays absolute', () => {
		expect(ajaxifyUrl(`${location.origin}/a#f`)).toMatch(
			new RegExp(`^${location.origin.replace(/\./g, '\\.')}/a\\?_infuse=1&_ts=\\d+#f$`),
		)
	})

	test('protocol-relative URL stays protocol-relative', () => {
		expect(ajaxifyUrl('//host.example/a?x=1')).toMatch(
			/^\/\/host\.example\/a\?x=1&_infuse=1&_ts=\d+$/,
		)
	})

	test('empty string and bare relative forms', () => {
		expect(ajaxifyUrl('')).toMatch(/^\?_infuse=1&_ts=\d+$/)
		expect(ajaxifyUrl('foo')).toMatch(/^foo\?_infuse=1&_ts=\d+$/)
		expect(ajaxifyUrl('?x=1')).toMatch(/^\?x=1&_infuse=1&_ts=\d+$/)
	})

	test('replaces existing _infuse and _ts without duplicating, fragment last', () => {
		const out = ajaxifyUrl('/a?_infuse=1&x=1&_ts=5&_infuse#frag')
		expect(out).toMatch(/^\/a\?x=1&_infuse=1&_ts=\d+#frag$/)
		expect(out.match(/_infuse/g)).toHaveLength(1)
		expect(out.match(/_ts=/g)).toHaveLength(1)
	})

	test('does not strip params that merely start with the same letters', () => {
		expect(ajaxifyUrl('/a?_tsx=1&_infused=2')).toContain('_tsx=1&_infused=2&')
	})

	test.each([
		['non-UTF-8 escape', '/a?x=%E9'],
		['malformed escape', '/a?x=%zz'],
		['flag-only param', '/a?flag'],
		['reserved characters', '/a?q=a[]=1'],
		['encoded space', '/a?q=hello%20world'],
		['semicolon and punctuation', "/a?a=1;b=2&c=:,'()!~"],
	])('preserves query bytes: %s', (_name, input) => {
		const query = input.slice(input.indexOf('?') + 1)
		const out = ajaxifyUrl(`${input}#f`)
		expect(out.startsWith(`/a?${query}&`)).toBe(true)
		expect(out).toMatch(new RegExp(`&${OWN.source}#f$`))
	})

	test('never emits && or ?&', () => {
		for (const input of ['/a', '/a?', '/a?&', '/a?&&x=1&&', '/a?x=1&#f', '/a?_ts=1', '']) {
			const out = ajaxifyUrl(input)
			expect(out).not.toMatch(/&&|\?&/)
		}
	})
})
