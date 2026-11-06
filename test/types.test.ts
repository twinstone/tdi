import { describe, expect, test } from 'vitest'
import type {
	DoneDetail,
	EndDetail,
	ErrorDetail,
	FormSubmitDetail,
	InsertDetail,
	InsertsDoneDetail,
	LinkClickDetail,
	PopupDetail,
	PopupsDoneDetail,
	RedirectDetail,
	ReloadDetail,
	ScriptDetail,
	ScriptsDoneDetail,
	StartDetail,
	StyleDetail,
	StylesDoneDetail,
	UnknownDetail,
	UnknownsDoneDetail,
	UpdateDetail,
	UpdatesDoneDetail,
} from '../src/types'

const keys = (o: object) => Object.keys(o).sort()
const tag = document.createElement('update')
const el = document.createElement('div')

// Expected key lists are the R3 list from the design doc, not derived from src/types.ts
describe('detail payload key names (R3, v1 verbatim)', () => {
	test('UpdateDetail', () => {
		const d: UpdateDetail = {
			target_id: 'a',
			selector: null,
			target: [el],
			content: '',
			content_empty: true,
			replace: null,
			append: null,
			prepend: null,
			class_add: '',
			class_remove: '',
			options: {},
			tag,
		}
		expect(keys(d)).toEqual(
			[
				'target_id',
				'selector',
				'target',
				'content',
				'content_empty',
				'replace',
				'append',
				'prepend',
				'class_add',
				'class_remove',
				'options',
				'tag',
			].sort(),
		)
	})

	test('InsertDetail', () => {
		const d: InsertDetail = {
			target_id: 'a',
			selector: null,
			target: [el],
			content: '',
			position: 'after',
			inserted_node: [el],
			options: {},
			tag,
		}
		expect(keys(d)).toEqual(
			[
				'target_id',
				'selector',
				'target',
				'content',
				'position',
				'inserted_node',
				'options',
				'tag',
			].sort(),
		)
	})

	test('ScriptDetail', () => {
		const d: ScriptDetail = {
			script_src: null,
			script_data: '',
			script_id: null,
			script_node: el,
			script_node_inline: el,
			options: {},
			tag,
		}
		expect(keys(d)).toEqual(
			[
				'script_src',
				'script_data',
				'script_id',
				'script_node',
				'script_node_inline',
				'options',
				'tag',
			].sort(),
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
		const d: PopupDetail = {
			href: '/x',
			mode: 'popup',
			width: 600,
			height: 500,
			popup: null,
			options: {},
			tag,
		}
		expect(keys(d)).toEqual(
			['href', 'mode', 'width', 'height', 'popup', 'options', 'tag'].sort(),
		)
	})

	test('ErrorDetail', () => {
		const d: ErrorDetail = { response: null, status: 0, message: 'x', options: {} }
		expect(keys(d)).toEqual(['response', 'status', 'message', 'options'].sort())
	})

	test('ReloadDetail', () => {
		const d: ReloadDetail = { options: {}, tag }
		expect(keys(d)).toEqual(['options', 'tag'].sort())
	})

	test('UnknownDetail', () => {
		const d: UnknownDetail = { _name: 'foo', contents: '', options: {}, tag }
		expect(keys(d)).toEqual(['_name', 'contents', 'options', 'tag'].sort())
	})

	test('LinkClickDetail', () => {
		const d: LinkClickDetail = { link: el }
		expect(keys(d)).toEqual(['link'])
	})

	test('FormSubmitDetail', () => {
		const d: FormSubmitDetail = { form: document.createElement('form') }
		expect(keys(d)).toEqual(['form'])
	})

	test('StartDetail', () => {
		const d: StartDetail = { options: {} }
		expect(keys(d)).toEqual(['options'])
	})

	test('EndDetail', () => {
		const d: EndDetail = { options: {} }
		expect(keys(d)).toEqual(['options'])
	})

	test('DoneDetail', () => {
		const d: DoneDetail = {
			responses: {
				updates: [],
				inserts: [],
				scripts: [],
				styles: [],
				popups: [],
				unknowns: [],
			},
			options: {},
		}
		expect(keys(d)).toEqual(['responses', 'options'].sort())
		expect(keys(d.responses)).toEqual(
			['updates', 'inserts', 'scripts', 'styles', 'popups', 'unknowns'].sort(),
		)
	})

	test('UpdatesDoneDetail', () => {
		const d: UpdatesDoneDetail = { updates: [], options: {} }
		expect(keys(d)).toEqual(['updates', 'options'].sort())
	})

	test('InsertsDoneDetail', () => {
		const d: InsertsDoneDetail = { inserts: [], options: {} }
		expect(keys(d)).toEqual(['inserts', 'options'].sort())
	})

	test('ScriptsDoneDetail', () => {
		const d: ScriptsDoneDetail = { scripts: [], options: {} }
		expect(keys(d)).toEqual(['scripts', 'options'].sort())
	})

	test('StylesDoneDetail', () => {
		const d: StylesDoneDetail = { styles: [], options: {} }
		expect(keys(d)).toEqual(['styles', 'options'].sort())
	})

	test('PopupsDoneDetail', () => {
		const d: PopupsDoneDetail = { popups: [], options: {} }
		expect(keys(d)).toEqual(['popups', 'options'].sort())
	})

	test('UnknownsDoneDetail', () => {
		const d: UnknownsDoneDetail = { unknowns: [], options: {} }
		expect(keys(d)).toEqual(['unknowns', 'options'].sort())
	})
})
