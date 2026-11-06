# Changelog

## 2.0.0

A rewrite: TypeScript, no runtime dependencies (jQuery is gone), `fetch` instead of `XMLHttpRequest`, native `CustomEvent`s. The XML protocol and the HTML authoring surface are unchanged. See [docs/migration-v1-to-v2.md](docs/migration-v1-to-v2.md).

### Breaking

* Event handlers receive a native event: `(evt, data)` becomes `evt.detail`.
* `options.trigger` is a plain `Element`.
* Detail values are native: `target` is always `Element[]`, `tag` is the raw XML element, `script_node`/`script_node_inline`/`style_node` are `Element`, `inserted_node` is `Element[]` (elements only, no text nodes), `replace`/`append`/`prepend` are `string | null`. Key names are unchanged.
* The `beforeStart`/`start`/`beforeEnd`/`end` callbacks are removed; use the `headers` option, the returned promise and the events.
* `tdi:ajax:start` no longer carries `xhr`/`settings`; `tdi:ajax:error` carries `response`, `status`, `message` instead of `xhr`/`textStatus`.
* `tdi:ajax:style` / `stylesDone` fire after the stylesheet loads.
* Hyphenated custom instructions fire `tdi:ajax:beforeCartBadge`, not `tdi:ajax:beforeCart-badge`.
* Scripts in `update`/`insert` content run in `<head>`; the original node is removed; `type=module` ones run as modules (a `src` module is awaited, an inline one is not).
* Removed: synchronous requests, the hidden-iframe upload fallback, `rel` as a related-element selector, the `.ajaxlink`/`.ajaxform`/`.ajaxselect` classes, `data-ajax-xhr-fields`, the `loading-target` class (silently), IE support.
* API flattened: `TDI.Ajax.Request.send` is `TDI.send`, `TDI.Ajax.send` is `TDI.sendElement`, `TDI.Ajax.Request.sendForm` is `TDI.sendForm`, `TDI.Ajax.Request.ajaxifyUrl` is `TDI.ajaxifyUrl`; `TDI.Tools.*` is internal.

### Added

* Entry points `twinstone-tdi` (ESM), `twinstone-tdi/auto`, `twinstone-tdi/global`; `dist/tdi.global.min.js` replaces `tdi-bundle.min.js`.
* Every build is a single self-contained file; no entry imports another and no shared chunk is emitted, so one file can be deployed on its own.
* `TDI.start()`, `TDI.stop()`, `TDI.registerInstruction()`; `createTdi({ root, contentScripts, allowedOrigins, nonce })`. The classic-script build reads `data-content-scripts` and `data-allowed-origins` (comma-separated) from its own script tag; ESM consumers pass `nonce` explicitly.
* `send` returns a promise that resolves when every instruction, scripts included, has been applied.
* `data-ajax-credentials="omit|same-origin|include"`; the `signal` and other `RequestInit` options.
* `X-Requested-With: XMLHttpRequest` is sent on same-origin requests and omitted cross-origin (no CORS preflight either way); `Accept` is sent as before.
* `data-trigger-group` now works (it threw a `TypeError` in v1).
* `tdi:ajax:style` fires for a style deduped by id and for a `<style>` with no `src`; `tdi:ajax:script` fires for a deduped script.
* Preventing `tdi:ajax:beforeScript` skips only that script; v1 dropped the rest of the chain too.

### Fixed

* `<a class="tdi">` with no URL sends nothing instead of requesting the current page.
* A file input associated with a form through the `form` attribute is no longer sent as `[object File]` in a query string.
* A `<script id>` already on the page no longer hangs the response forever.
* `done` payloads no longer accumulate every earlier request's instructions.
* No `unload`/`pagehide` handler any more, so the back/forward cache works.
* `popup` parses `width`/`height` with a radix.

### Known limitations

No refcounting of the `loading` class across overlapping requests; no built-in timeout (use `AbortSignal.timeout`); `allowedOrigins` prevents a response being applied, not the request being sent; `tdi/auto` takes no options, so ESM consumers needing `'nonce-only'` or `allowedOrigins` must use `createTdi` and pass `nonce`. Details in the migration guide.

## 1.x

See the GitHub releases. The previous `changes.txt` is in git history.
