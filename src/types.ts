// Event detail key names are v1's, snake_case included (design R3); only value types are native.

// 'nonce-only' replays only scripts that already carry the page nonce
export type ContentScriptPolicy = 'all' | 'nonce-only'

export interface TdiOptions {
	root?: Document | Element
	contentScripts?: ContentScriptPolicy
	// Undefined means no check; same-origin is always allowed
	allowedOrigins?: string[]
	// CSP nonce for injected scripts and styles; defaults to the one on TDI's own classic script tag
	nonce?: string
}

export interface TdiRequestOptions {
	method?: string
	data?: string | Record<string, unknown> | FormData
	trigger?: Element
	credentials?: RequestCredentials
	headers?: HeadersInit
	mode?: RequestMode
	cache?: RequestCache
	redirect?: RequestRedirect
	signal?: AbortSignal
	// Set by TDI, read on event details: the marked URL actually requested (with _infuse and _ts).
	// A value passed by a caller is ignored.
	url?: string
	// Set by TDI, read on event details: the trigger, its related elements and the clicked submitter.
	// A value passed by a caller is ignored.
	involvedElms?: Element[]
}

export interface UpdateDetail {
	target_id: string | null
	selector: string | null
	target: Element[]
	content: string
	content_empty: boolean
	replace: string | null
	append: string | null
	prepend: string | null
	class_add: string
	class_remove: string
	options: TdiRequestOptions
	tag: Element
}

export interface InsertDetail {
	target_id: string | null
	selector: string | null
	target: Element[]
	content: string
	position: string
	// Absent on tdi:ajax:beforeInsert, set once inserted
	inserted_node?: Element[]
	options: TdiRequestOptions
	tag: Element
}

export interface ScriptDetail {
	script_src: string | null
	script_data: string
	script_id: string | null
	// Absent on tdi:ajax:beforeScript, set once inserted
	script_node?: Element
	script_node_inline?: Element
	options: TdiRequestOptions
	tag: Element
}

export interface StyleDetail {
	style_src: string | null
	style_id: string | null
	// Absent on tdi:ajax:beforeStyle, set once inserted
	style_node?: Element
	options: TdiRequestOptions
	tag: Element
}

export interface ReloadDetail {
	options: TdiRequestOptions
	tag: Element
}

export interface RedirectDetail {
	href: string
	options: TdiRequestOptions
	tag: Element
}

export interface PopupDetail {
	href: string
	mode: string
	width: number
	height: number
	options: TdiRequestOptions
	tag: Element
	popup?: Window | null
}

// Other instruction: its XML attributes are spread as extra keys (values are strings)
export interface UnknownDetail {
	_name: string
	contents: string
	options: TdiRequestOptions
	tag: Element
	[attribute: string]: unknown
}

export interface LinkClickDetail {
	link: Element
}

export interface FormSubmitDetail {
	form: HTMLFormElement
}

export interface StartDetail {
	options: TdiRequestOptions
}

export interface EndDetail {
	options: TdiRequestOptions
}

export interface ErrorDetail {
	response: Response | null
	// 0 when there is no response
	status: number
	message: string
	options: TdiRequestOptions
}

export interface TdiResponses {
	updates: UpdateDetail[]
	inserts: InsertDetail[]
	scripts: ScriptDetail[]
	styles: StyleDetail[]
	popups: PopupDetail[]
	unknowns: UnknownDetail[]
}

export interface DoneDetail {
	responses: TdiResponses
	options: TdiRequestOptions
}

export interface UpdatesDoneDetail {
	updates: UpdateDetail[]
	options: TdiRequestOptions
}
export interface InsertsDoneDetail {
	inserts: InsertDetail[]
	options: TdiRequestOptions
}
export interface ScriptsDoneDetail {
	scripts: ScriptDetail[]
	options: TdiRequestOptions
}
export interface StylesDoneDetail {
	styles: StyleDetail[]
	options: TdiRequestOptions
}
export interface PopupsDoneDetail {
	popups: PopupDetail[]
	options: TdiRequestOptions
}
export interface UnknownsDoneDetail {
	unknowns: UnknownDetail[]
	options: TdiRequestOptions
}

export interface TdiResult {
	response: Response
	responses: TdiResponses
}
