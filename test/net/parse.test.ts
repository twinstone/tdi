import { describe, expect, test } from 'vitest'
import { parseResponse, TdiParseError } from '../../src/net/parse'

describe('parseResponse', () => {
	test('extracts status and instructions in document order', () => {
		const r = parseResponse(
			'<?xml version="1.0"?><response><update target="a">x</update><status>OK</status><script>y</script><redirect href="/z"/></response>',
		)
		expect(r.status).toBe('OK')
		expect(r.instructions.map((e) => e.tagName)).toEqual(['update', 'script', 'redirect'])
	})

	test('ok is false for non-OK status, case-insensitively', () => {
		expect(parseResponse('<response><status>ok</status></response>').ok).toBe(true)
		expect(parseResponse('<response><status>ERROR</status></response>').ok).toBe(false)
	})

	test('still returns instructions when status is not OK', () => {
		const r = parseResponse(
			'<response><status>ERROR</status><update target="a">x</update></response>',
		)
		expect(r.ok).toBe(false)
		expect(r.instructions).toHaveLength(1)
	})

	test('throws TdiParseError on a non-XML body', () => {
		const html = '<!DOCTYPE html><html><body><h1>502 Bad Gateway</h1><br></body></html>'
		expect(() => parseResponse(html)).toThrow(TdiParseError)
		expect(() => parseResponse('<html><body><p>Login</p></body></html>')).toThrow(TdiParseError)
		expect(() => parseResponse('Service unavailable')).toThrow(TdiParseError)
	})

	test('throws TdiParseError on an empty body', () => {
		expect(() => parseResponse('')).toThrow(TdiParseError)
		expect(() => parseResponse('   ')).toThrow(TdiParseError)
	})

	test('throws TdiParseError on a well-formed HTML page (root is not <response>)', () => {
		const html = '<!DOCTYPE html><html><body><h1>502 Bad Gateway</h1></body></html>'
		expect(
			new DOMParser()
				.parseFromString(html, 'application/xml')
				.getElementsByTagName('parsererror'),
		).toHaveLength(0)
		expect(() => parseResponse(html)).toThrow(TdiParseError)
	})

	test('preserves CDATA content verbatim', () => {
		const r = parseResponse(
			'<response><status>OK</status><update target="t"><![CDATA[<li>hi & bye</li>]]></update></response>',
		)
		expect(r.instructions[0]?.textContent).toBe('<li>hi & bye</li>')
	})
})
