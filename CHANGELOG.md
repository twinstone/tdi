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
* Scripts in `update`/`insert` content run in `<head>`; the original node is removed; `type=module` ones are skipped with a warning.
* Removed: synchronous requests, the hidden-iframe upload fallback, `rel` as a related-element selector, the `.ajaxlink`/`.ajaxform`/`.ajaxselect` classes, `data-ajax-xhr-fields`, the `loading-target` class (silently), IE support.
* API flattened: `TDI.Ajax.Request.send` is `TDI.send`, `TDI.Ajax.send` is `TDI.sendElement`, `TDI.Ajax.Request.sendForm` is `TDI.sendForm`, `TDI.Ajax.Request.ajaxifyUrl` is `TDI.ajaxifyUrl`; `TDI.Tools.*` is internal.
* `X-Requested-With` is no longer sent.

### Added

* Entry points `twinstone-tdi` (ESM), `twinstone-tdi/auto`, `twinstone-tdi/global`; `dist/tdi.global.min.js` replaces `tdi-bundle.min.js`.
* `TDI.start()`, `TDI.stop()`, `TDI.registerInstruction()`; `createTdi({ root, contentScripts, allowedOrigins })`.
* `send` returns a promise that resolves when every instruction, scripts included, has been applied.
* `data-ajax-credentials="omit|same-origin|include"`; the `signal` and other `RequestInit` options.
* `data-trigger-group` now works (it threw a `TypeError` in v1).
* `tdi:ajax:style` fires for a style deduped by id; `tdi:ajax:script` fires for a deduped script.

### Fixed

* A `<script id>` already on the page no longer hangs the response forever.
* `done` payloads no longer accumulate every earlier request's instructions.
* No `unload`/`pagehide` handler any more, so the back/forward cache works.
* `popup` parses `width`/`height` with a radix.

### Known limitations

No refcounting of the `loading` class across overlapping requests; no built-in timeout (use `AbortSignal.timeout`); `allowedOrigins` prevents a response being applied, not the request being sent; ESM consumers cannot supply a CSP nonce, and the global build cannot be given options, so `contentScripts: 'nonce-only'` is not reachable with a nonce from any shipped entry point. Details in the migration guide.

## 1.x

See the GitHub releases. The previous `changes.txt` is in git history.
