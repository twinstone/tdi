# TDI v2: Build A vs Build B — did we stray from a path that already works?

**Date:** 2026-11-06
**Build A:** `/home/centi/work/projects/internal/tdi/tdi2.js` — 794 lines, bundled ESM (`tdi.es.js`), labelled "TDI v2.0.0", built by the owner with a colleague, **tested in a real project**.
**Build B:** the `tdi2` branch — `src/` (23 TypeScript files), 341 tests (all passing, verified), `docs/migration-v1-to-v2.md`, `docs/superpowers/specs/2026-11-05-tdi2-rewrite-design.md`.
**v1 reference:** `git show 68fb379:src/tdi-ajax.js`, `git show 68fb379:src/tdi-tools.js`.

---

## 1. Summary

**No, we did not stray.** Build B's divergences from Build A are almost all covered by a numbered decision (D1–D11) or a resolution (R1–R9), and the migration guide independently documents eleven breaks with worked examples — including several that A simply never confronted. Where the two builds differ *silently*, B is usually the one matching v1: A quietly drops multi-select serialisation on the element path, drops the `Accept` header, never executes `<script>` elements found in `update`/`insert` content (the single largest silent breakage for a migrating CMS site), and narrows `start`/`end`/`*sDone`/`done` from v1's whole involved-element set to one element.

Five genuinely accidental divergences were found in B, all small; the largest is the loss of the request URL from every event payload (`detail.options.url` in v1, `detail.settings.url` in A, nothing in B). Build A is better on exactly three points, all cheap to adopt or already decided.

A's production exposure is real evidence, but of a narrower surface than it first appears: the pilot project evidently did not use multi-select triggers, content scripts, `Accept`-sensitive endpoints, or `*sDone` handlers on related elements, since all four are broken or absent in A.

**Counts:** 5 accidental divergences · 3 "A did it better" · 17 deliberate divergences confirmed.

---

## 2. Accidental divergences

Ordered by what they would cost a migrating site. None is anticipated by the design document or the migration guide.

### A1. `detail.options.url` is gone, and so is any other route to the request URL

**v1:** `TDI.Ajax.Request.send` mutates the caller's options object — `options.url = ajaxifyUrl(url)` (`tdi-ajax.js:497`) — and then passes *that same object* as `detail.options`. Every event payload in v1 therefore carries `options.url`. jQuery's `settings.url` was also on the `start` payload.

**A:** `options.url` is likewise absent (A builds a separate `settings` object rather than mutating), **but** A keeps v1's `tdi:ajax:start` detail shape `{ xhr, settings, options }`, and `settings.url` is the ajaxified URL (`tdi2.js:535-545`). A URL-reading handler still works after a one-word edit.

**B:** `StartDetail` is `{ options }` (`src/types.ts:112-114`), and `TdiRequestOptions` has no `url` field at all (`src/types.ts:15-25`). The URL is never put on any payload — not `start`, not `done`, not `error`. There is no replacement.

**Bucket:** accidental. Break 5 in the migration guide announces that `start` lost `xhr` and `settings` and tells the reader to use the `headers` option instead — it never mentions that the URL went with them. Worse, the guide's break-1 example opens with the v1 line `console.log(data.options.url)` and its "after" version silently becomes `console.log(data.options)`, demonstrating the loss without flagging it.

**Cost:** silent `undefined` in any handler that logs, branches on, or reports the request URL — analytics beacons, per-endpoint spinners, debug logging. The failure mode is a wrong value, not an exception, so it survives a smoke test. Minimal fix: add `url: string` to the `start` detail (the ajaxified URL is in hand at `src/net/request.ts:106`), or document the loss and tell consumers to capture the URL at the `sendElement`/`send` call site.

### A2. The `tdi:ajax:_start` / `_success` / `_error` / `_end` internal event bus is gone

**v1:** `TDI.Ajax.Request` and `TDI.Ajax.Response` communicate over four `document`-level jQuery events (`tdi-ajax.js:513, 528, 543, 560` fire them; `786-800` consume them). They are underscore-prefixed internals but they are ordinary events on `document` and nothing stops a site binding them.

**A:** preserved exactly — A literally keeps the bus, wiring `document.addEventListener('tdi:ajax:_start', ...)` through `_end` (`tdi2.js:336-345`).

**B:** gone. The pipeline is direct function calls.

**Bucket:** accidental. Not mentioned in either document.

**Cost:** low in likelihood, total in effect. A site that hooked `tdi:ajax:_end` (the only one with any plausible use — it fires on `document` for *every* request, unlike `tdi:ajax:end` which fires on involved elements) gets nothing, with no error. If the pilot used one, the symptom is a global counter or spinner that never decrements. Worth one line in the guide's "Removed" table rather than any code change — `tdi:ajax:end` on `document` is the replacement and already bubbles there.

### A3. A form whose only file input is disabled or unnamed is no longer forced to POST multipart

**v1 / A:** `$form.find('input[type=file]').length > 0` → force `method = POST` and `enctype = multipart/form-data`, regardless of whether the input would contribute an entry (`tdi-ajax.js:629-642`; `tdi2.js:604-605`).

**B:** `[...fd.values()].some(v => v instanceof Blob)` (`src/core/instance.ts:139`) — the decision is made from the actual `FormData`, so a disabled, unnamed, or `form=""`-detached file input produces no entry and the form is sent as GET or urlencoded POST, following its own `method` attribute.

**Bucket:** accidental. The design document's "minor items settled" covers the `submit-action` input but says nothing about file detection.

**Cost:** a server endpoint that only accepts `POST multipart` now receives a GET. Narrow — it needs a form carrying a file input that contributes nothing *and* a `method` other than POST — but when it hits, it is a hard 405/400, not a silent wrong value. B's rule is the more defensible one; it just needs a line in the guide.

### A4. The `tdi:ajax:error` message text for a non-`OK` `<status>` changed shape

**v1 / A:** `message` is the `<status>` element's own text, verbatim — `_error(xhr, textStatus, status.text(), options)` (`tdi-ajax.js:998`; `tdi2.js:359`). A server sending `<status>SESSION_EXPIRED</status>` produced `detail.message === 'SESSION_EXPIRED'`.

**B:** `fail(response, \`Response status: ${parsed.status}\`)` (`src/net/request.ts:117`) — `detail.message === 'Response status: SESSION_EXPIRED'`.

**Bucket:** accidental. Break 6 documents the *shape* change of the error detail (`xhr`/`textStatus` out, `response`/`status`/`message` in) but not that `message` is now a wrapped string rather than the raw status.

**Cost:** any handler doing `if (data.message === 'SESSION_EXPIRED')` — a natural thing to write against a protocol that lets the server pick the status string — stops matching, silently. Cheapest fix is to pass `parsed.status` through unwrapped (restoring v1 exactly) or to add `status_text` to `ErrorDetail`; second-cheapest is a line in break 6.

### A5. A bare `<button>` inside a TDI form now contributes its name and value

**v1 / A:** the submit-button capture is bound to the selector `form.tdi [type=submit]` (`tdi-ajax.js:59-63`; `tdi2.js:659-663`), which requires an explicit `type="submit"` attribute. A `<button name="action" value="save">` with no `type` attribute submits the form but was *not* captured, so `action=save` never reached the server.

**B:** uses `SubmitEvent.submitter` + `new FormData(form, submitter)` (`src/core/instance.ts:129-141`), which follows the HTML spec — a bare `<button>` is a submit button and its name/value are included.

**Bucket:** accidental. The "minor items settled" note sanctions `new FormData(form, submitter)` as producing "the same bytes on the wire"; for this markup it does not — it produces strictly more.

**Cost:** a new parameter arrives at an endpoint that never saw it. Harmless for most servers, a validation failure for a strict one. B's behaviour is correct and v1's was a bug; this needs a sentence, not a change.

---

## 3. Build A did it better

### B1. A sends `X-Requested-With: XMLHttpRequest`, conditionally on same-origin

**A:** `tdi2.js:520-533` — adds the header only when the target URL resolves to the page's own origin, so it can never trigger a CORS preflight on a cross-origin endpoint. **B** sends it never (R1, an owner decision, reasoning: `_infuse=1` identifies the request and the header would newly trigger preflights).

A's conditional form gets both halves of R1's reasoning: no preflight risk, and no server-side break. The header is the single most common way a Java/PHP CMS back end distinguishes an AJAX request, and A's production exposure means its pilot server plausibly needed it.

**To adopt:** six lines in `src/net/request.ts` — resolve `url` against `document.baseURI`, compare origins, set the header when they match. It does not reopen R1's decision (no preflight is ever triggered); it only removes the migration cost R1 accepted. The migration guide already tells sites to add the header by hand, which is the thing that would become unnecessary.

### B2. A's `inserted_node` / `target` are plain Elements for the single-target case

**A:** `update` detail carries both `target` (a single `Element`, the first) and a new `targets` array; `insert` carries `inserted_node` (single) and `inserted_nodes`. **B:** `target` and `inserted_node` are always `Element[]` (R3, deliberate).

B's choice is the correct one — `selector` can match many elements and a single-element type would be a lie — and R3 states it. But A's dual-key shape is strictly cheaper to migrate to: `data.target.classList.add(...)` works unchanged on A for the overwhelmingly common single-target case, whereas on B it is a silent no-op (`Element[]` has no `classList`; the property is `undefined` and the method call throws, which at least surfaces). A's `inserted_nodes` is also broken for multi-element content (A keeps only `firstElementChild`, `tdi2.js:88-93`), so only half of A's idea is worth anything.

**To adopt:** if the pilot's handler churn turns out to be dominated by `detail.target`, add a non-breaking `target_first?: Element` alias. Not recommended on spec — R3 is sound, and two names for one thing is how v1 acquired its warts.

### B3. A keeps v1's `TDI.Ajax.*` namespace, which is near drop-in

Quantified in §7. This is the owner's explicit flattening request, so it is deliberate — but A's shape means a v1 site's *API call sites* need zero edits, while B's need a mechanical rename at every one. See §7 for the measured difference.

---

## 4. Deliberate divergences (confirmed, no defence needed)

| # | A | B | Covered by |
|---|---|---|---|
| 1 | `TDI.Ajax` / `TDI.Ajax.Request` / `TDI.Ajax.Response` / `TDI.Tools` | `TDI.send` / `sendElement` / `sendForm` / `start` / `stop` / `ajaxifyUrl` / `registerInstruction` | D4, plus the owner's explicit request |
| 2 | `getScript` / `getStyle` exported publicly | internal (`src/dom/assets.ts`) | D4 |
| 3 | `sync` option kept (with a deprecation `console.warn`) and a full synchronous XHR path (`tdi2.js:580-596`) | dropped; always async | D6 |
| 4 | `rel` attribute as a related-element selector (`tdi2.js:728-729`) | dropped | D6 |
| 5 | `.ajaxlink` / `.ajaxform` / `.ajaxselect` aliases bound | only `.tdi` / `.infuse` | D6 |
| 6 | `loading-target` applied to related elements (`tdi2.js:743, 749`) | not applied | D6 (and the guide's loudest warning) |
| 7 | `data-ajax-xhr-fields` JSON blob → `withCredentials` | `data-ajax-credentials="omit\|same-origin\|include"` | D7 |
| 8 | `beforeStart` / `start` / `beforeEnd` / `end` option callbacks are the public plumbing | dropped; internal | R7 |
| 9 | injects `input.submit-action` into the live form, removes it on `end` | `new FormData(form, submitter)`, form untouched | "minor items settled" |
| 10 | `pagehide` handler unbinds all delegated listeners (`tdi2.js:677, 679-681`) | no unbinding; `stop()` is explicit | D2, v1 bug list #4 |
| 11 | no `start()` / `stop()`; auto-binds on `DOMContentLoaded` | instance-based `createTdi({root})` with `start()`/`stop()` | D1, D2 |
| 12 | no extension point for custom instructions | `registerInstruction(name, handler)` | D9 |
| 13 | `tdi:ajax:beforeCart-badge` for `<cart-badge>` (v1-faithful, malformed) | `tdi:ajax:beforeCartBadge` | guide break 9 |
| 14 | unknown-instruction attributes overwrite `_name` / `contents` / `options` / `tag` (v1-faithful) | structural keys win | guide break 9 |
| 15 | `<style>` with no `src`, or deduped by `id`, fires nothing (v1-faithful) | fires `tdi:ajax:style` with `style_node` undefined | guide break 8 |
| 16 | `preventDefault()` on `beforeScript` kills the whole remaining chain (v1-faithful) | skips one script, the rest run | guide break 11 |
| 17 | `error` detail `{ status, message, xhr, textStatus, options }` (v1-faithful) | `{ response, status, message, options }` | R3, guide break 6 |

Also deliberate and ratified: B's `ajaxifyUrl` is byte-preserving string surgery that *strips* any pre-existing `_infuse`/`_ts` and appends its own at the end of the query, where v1 and A insert them immediately after the `?`. The design document's D5 deviation note sanctions the approach; the resulting parameter *ordering* difference is not spelled out, but no server can depend on query-parameter order, and B's de-duplication is a strict improvement over v1/A appending `_infuse=1` twice.

### Things A kept that B also kept (no divergence)

v1's `TDI.Ajax.Response` namespace is literally `return {};` (`tdi-ajax.js:1902`) — an empty object. A reproduces it faithfully as `k = {}`. B dropping it loses nothing that ever existed.

---

## 5. API surface comparison

| Surface | v1 | Build A | Build B |
|---|---|---|---|
| Global | `window.TDI` | `window.TDI` (set unconditionally, even from the ESM artifact — `tdi2.js:791`) | `window.TDI` from the global build only |
| Element sender | `TDI.Ajax.send(elm, callbacks)` | `TDI.Ajax.send(elm, callbacks)`, also `export send` | `TDI.sendElement(el, options)` → `Promise<TdiResult \| null>` |
| URL sender | `TDI.Ajax.Request.send(url, options)` | same, also `export Request` | `TDI.send(url, options)` → `Promise<TdiResult>` |
| Form sender | `TDI.Ajax.Request.sendForm(form, options)` | same | `TDI.sendForm(form, options)` → `Promise<TdiResult \| null>` |
| URL marker | `TDI.Ajax.Request.ajaxifyUrl(url)` | same, also `export ajaxifyUrl` | `TDI.ajaxifyUrl(url)` |
| Asset loaders | `TDI.Tools.getScript/getStyle` | `TDI.Tools.getScript/getStyle`, also top-level exports | internal only |
| Lifecycle | none (auto-binds; unbinds on unload) | none (auto-binds on `DOMContentLoaded`; unbinds on `pagehide`) | `start()` / `stop()` |
| Extension | prevent `before*` + do it yourself | same | `registerInstruction(name, handler)` + `before*` |
| Construction | n/a | n/a | `createTdi({ root, contentScripts, allowedOrigins, nonce })` |
| Return value | `jqXHR` | `Promise<xhr-like \| null>` | `Promise<{ response, responses }>` |
| Error type | none | `TDIError extends Error` — **exported but never constructed or thrown anywhere in the bundle** | none (internal `TdiParseError`, not exported) |
| Types | none | none published (plain `.js` artifact) | `dist/index.d.ts`, `export type * from './types'` |
| Event names | — | identical to v1 including `beforeCart-badge` | identical to v1 except hyphenated unknowns (break 9) |
| `start` detail | `{ xhr, settings, options }` | `{ xhr: null, settings, options }` | `{ options }` ← **A1** |
| `end` detail | `{ options }` | `{ options }` | `{ options }` |
| `error` detail | `{ status, message, xhr, textStatus, options }` | identical | `{ response, status, message, options }` |
| `update` detail | `target_id, selector, target(jQuery), content, content_empty, replace, append, prepend, class_add, class_remove, options, tag` | same keys + `targets`; `target` is a single `Element` | same keys, `target: Element[]` |
| `insert` detail | `… inserted_node (jQuery set, incl. text nodes)` | `inserted_node: Element \| null` + `inserted_nodes: Element[]` | `inserted_node: Element[]` |
| `script` detail | `script_src, script_data, script_id, script_node, script_node_inline` | same + a non-v1 `script_type` key | same, v1 keys only |
| snake_case keys | — | preserved | preserved (R3) |

**On `TDIError`:** A declares it (`tdi2.js:773-777`) with `name`, `status` and `xhr` fields and exports it, but no code path in the 794 lines constructs or throws it. It is a vestigial export. **Its absence from B loses nothing.** B's rejections carry plain `Error` / `DOMException`; a consumer distinguishing a parse failure does so by `err.name === 'TdiParseError'`, which works today but is not a published type. If anything is worth doing here it is exporting `TdiParseError` as a value from `src/index.ts` — a two-line change, not a gap A exposed.

**On `getScript` / `getStyle`:** v1 documented them as general-purpose utilities ("so the loaded javascript file is debuggable in Firebug"), so a site *could* be calling `TDI.Tools.getScript(url, { complete })` to lazy-load its own assets. Nothing in this repository does. Judgement: **the risk is low and re-exporting them would not help anyway** — B's `injectStyle` resolves on the stylesheet's `load` event, while v1's and A's `getStyle` call `complete` synchronously on append (`tdi-tools.js:120-124`; `tdi2.js:192`). A re-export would be a same-named function with different timing, which is worse than an honest removal. If a pilot turns one up, six lines of site code replace it.

---

## 6. Wire-protocol behaviour comparison

| Aspect | v1 | Build A | Build B |
|---|---|---|---|
| Root element | tolerant (`find('response > *')`) | requires `<response>`; else error + no instructions | requires `<response>` as the document element; else `TdiParseError`, error event, reject |
| `<status>` lookup | `$xml.find('status')` (anywhere) | `querySelector('status')` (anywhere) | direct child of `<response>` only |
| Missing `<status>` | `'' !== 'ok'` → error fired | no `<status>` element → **no error fired, proceeds silently** | `status: ''` → error fired (**matches v1**) |
| non-`OK` status | error fired, response **still processed** | same | same |
| `selector` vs `target` | `selector` wins; `target` is an id | same | same |
| No target match | instruction skipped silently | same | same |
| Invalid `selector` | jQuery throws → the rest of the response is lost | throws → uncaught, the rest of the response is lost | caught per instruction, logged, the rest applied |
| `update` default | `.html()` (contents replaced) | `innerHTML =` | `replaceChildren(fragment)` |
| `update replace` | `replaceWith`, `detail.target` becomes the new content | same, per target | same; `target` filtered to connected elements |
| `update append/prepend` | `.append()` / `.prepend()` | `insertAdjacentHTML` | fragment `append()` / `prepend()` |
| Empty `<update>` | clears the target | clears | clears (R2) |
| `<tr>` / table fragments | jQuery context-aware parsing | `<template>` parsing | `<template>` parsing |
| **Scripts in update/insert content** | **executed** (jQuery `.html()`) | **not executed at all** | **executed**, in order, fresh element in `<head>`, original removed (D10/R8) |
| `update` event target | first target | first target, falling back to `document` if detached | first target; not fired if a replace produced none |
| `insert` event target | **every** target | **first target only** | **every** target (**matches v1**) |
| `insert` multi-element content | whole jQuery set in `inserted_node` | **only `firstElementChild`** | all connected top-level elements |
| `<script>` ordering | collected, deferred to after the five `*sDone` events, chained | same | same |
| `<script src>` + existing `id` | **hangs forever** — chain stalls, `scriptsDone`/`done` never fire | **fixed**: skips the download, continues the chain, fires `tdi:ajax:script` | **fixed**: skips the download, runs any inline body, fires `tdi:ajax:script` |
| `<script type>` | ignored; always `text/javascript` | honoured, with an executable-type check and a `script_type` detail key (a protocol extension) | not read; injected as a classic script |
| `<style>` no `src` / deduped | fires nothing | fires nothing (**v1-faithful**) | fires `style` with `style_node` undefined (break 8) |
| `<style>` event timing | on append | on append | on `load` (break 7) |
| `beforeScript` prevented | whole chain dropped; `scriptsDone`/`done` still fire | same (**v1-faithful**) | only that script skipped (break 11) |
| `<popup>` | `parseInt` without radix | radix 10 | radix 10 |
| `<reload>` | `location.reload(true)` | `location.reload()` | `location.reload()` |
| `<redirect>` | `location.assign` | `location.assign` | `location.assign` |
| Unknown before-event | `beforeCart-badge` | `beforeCart-badge` | `beforeCartBadge` (break 9) |
| Unknown past-tense | `tdi:ajax:cart-badge` on `document` | same | same |
| Unknown attribute precedence | attributes overwrite structural keys | same | structural keys win (break 9) |
| `start` / `end` / `*sDone` / `done` target | **all** involved elements (`*sDone`/`done` filtered for liveness, `start`/`end` not) | **first** involved element only (`end`/`*sDone`/`done` filtered for liveness) | **all** live involved elements, `document` fallback (**matches v1**) |
| Per-request state | module-level, never reset — every `done` carries every prior request's instructions | per-request `WeakMap` keyed on `options` | local to the call (D2) |
| Multi-select, element path | `m[]=a&m[]=c` (`$.param`) | **`m=a` — only the first selected option** (`HTMLSelectElement.value`) | `m[]=a&m[]=c` (**matches v1**) |
| Multi-select, form path | `m=a&m=c` (`.serialize()`) | `m=a&m=c` | `m=a&m=c` |
| Unchecked checkbox | sends `0` | sends `0` | sends `0` |
| `Accept` header | `application/xml, text/xml, */*` (jQuery `dataType:'xml'`) | **none** | `application/xml, text/xml, */*` (**matches v1**, R1) |
| `X-Requested-With` | sent | sent, same-origin only | not sent (R1) |
| POST `Content-Type` | `application/x-www-form-urlencoded; charset=UTF-8` | same | same (R1 author's call) |
| `enctype` on the form element | **mutated** in the DOM | **mutated** in the DOM | never touched |
| `_infuse` / `_ts` placement | immediately after `?` | immediately after `?` | appended at the end; pre-existing `_infuse`/`_ts` stripped |
| Origin / content-script policy | none | **none** | `allowedOrigins`, `contentScripts: 'all' \| 'nonce-only'` |
| CSP nonce | from `document.currentScript` | from `document.currentScript` (**null in the ESM artifact we hold** — see §7) | from its own classic script tag, or the `nonce` option |

### CSS classes and `data-*` attributes

| | Build A | Build B |
|---|---|---|
| Activation classes | `.tdi`, `.infuse`, **plus** `.ajaxlink` / `.ajaxform` / `.ajaxselect` | `.tdi`, `.infuse` |
| Also binds | `form.X [type=submit]` click (submit-button capture) | nothing extra (uses `SubmitEvent.submitter`) |
| Classes applied | `loading`, **`loading-target`**, `disabled`, **`submit-action`** (on an injected input) | `loading`, `disabled` |
| Suppressors | `[disabled]`, `.disabled` | `[disabled]`, `.disabled` |
| Attributes read | `href`, `action`, `method`, `data-ajax-url`, `data-ajax-method`, `data-related-element`, `data-related-ancestor`, `data-trigger-group`, `data-confirm`, **`rel`**, **`data-ajax-xhr-fields`** | the same minus `rel` and `data-ajax-xhr-fields`, plus `data-ajax-credentials`; and on its own script tag `data-content-scripts`, `data-allowed-origins` |
| `data-trigger-group` | implemented (v1's `TypeError` fixed) | implemented (R6) |
| Enter-to-submit | `keyCode === 13` | `key === 'Enter'` with an `isComposing` guard |

---

## 7. Packaging comparison

| | Build A | Build B |
|---|---|---|
| Artifact in hand | one 23 KB unminified ESM file (`tdi.es.js`, per its sourcemap comment) | `dist/tdi.js` (ESM), `dist/auto.js`, `dist/tdi.global.js`, `dist/tdi.global.min.js` (15.7 KB; ~5 KB brotli against a 6 KB CI budget) |
| Entry points | one | three (D1): `twinstone-tdi`, `/auto`, `/global` |
| Side effects on import | **yes** — auto-starts on `DOMContentLoaded` and sets `window.TDI` unconditionally | none from the main entry; `/auto` and `/global` start themselves |
| Global | always `window.TDI` | `window.TDI` from `/global` only |
| Types published | no | yes (`dist/index.d.ts`, `dist/types.d.ts`) |
| `package.json` wiring | not present in this artifact | `exports`, `main`, `unpkg`, `jsdelivr`, `types`, `sideEffects` |
| Configuration | none | script-tag `data-*` or `createTdi(options)` |
| Load pattern | `<script type="module" src="tdi2.js">` — the file is ESM, so a classic `<script src>` is a syntax error | `<script src="tdi.global.min.js">` (classic, as v1), or `import { createTdi }` |

**A caveat on A's packaging, from the artifact we hold.** A reads its CSP nonce from `document.currentScript` (`tdi2.js:780-783`), which is `null` inside a `type="module"` script. The copy we have is the ESM build, and an ESM build can only be loaded as a module — so *in this artifact*, nonce propagation to injected `<script>` and `<style>` elements silently does not work. A presumably also ships an IIFE/UMD sibling where it does; we cannot see it. This is not a mark against A's design, only a limit on what can be concluded from the one file. The design document calls out CSP nonces as "load-bearing, not legacy", and B's anti-goal list names a pure-ESM package as a failure condition — both builds agree on the requirement.

**Migration cost, measured.**

*A's shape:* a v1 site changes `<script src="jquery.js">` + `<script src="tdi-bundle.min.js">` to a single tag (module or global, depending on the build), and **every `TDI.Ajax.*` call site keeps working unchanged**. What still has to change is the event handlers — A is native `CustomEvent` too, so `function (evt, data)` → `evt.detail` is just as mandatory in A as in B, and A's `detail.target` is an `Element` rather than a jQuery object exactly as B's is an `Element[]`. A's error payload is drop-in; A's `start` payload is near drop-in.

*B's shape:* the same script-tag swap, the same handler rewrite, plus a mechanical rename at each API call site (`TDI.Ajax.send` → `TDI.sendElement`, `TDI.Ajax.Request.send` → `TDI.send`, `TDI.Ajax.Request.sendForm` → `TDI.sendForm`, `TDI.Ajax.Request.ajaxifyUrl` → `TDI.ajaxifyUrl`), plus the eleven documented breaks, plus a CSS sweep for `.loading-target`.

**The honest size of the gap is smaller than the namespace change makes it look.** The expensive, unavoidable work — rewriting every `tdi:ajax:*` handler from `(evt, data)` to `evt.detail`, and re-typing `detail.target` / `detail.tag` / `inserted_node` from jQuery to DOM — is identical in both builds, because both dropped jQuery. The flattening adds a `sed`-able rename over a countable set of call sites; the real additional cost in B is the eleven breaks, and of those only three are silent (`loading-target`, `options.url` per A1, and the error `message` per A4). The namespace is the cheapest line item in the migration, not the dearest.

---

## 8. Does A contain the colleague's `end`-event fix?

**Yes.** The evidence is in the dispatch-target helpers.

v1 has the asymmetry the colleague found. `_success` filters the involved elements for liveness before firing the `*sDone` family:

```js
var $involvedElms = $(options.involvedElms).filter(function (i, elm) {
    return document.body ? document.body.contains(elm) : document.contains(elm);
});
if ($involvedElms.length === 0) { $involvedElms = $(document); }
```
(`tdi-ajax.js:1026-1032`)

while `_end` does not:

```js
function _end(xhr, textStatus, options) {
    $(options.involvedElms || document).trigger('tdi:ajax:end', [{ options: options }]);
}
```
(`tdi-ajax.js:1095-1099`)

**A has two helpers, and routes `end` through the filtering one.** `tdi2.js:484-490`:

```js
function O(e) {
    if (e.involvedElms) {
        let t = (Array.isArray(e.involvedElms) ? e.involvedElms : [e.involvedElms])
            .filter((e) => document.body?.contains(e) ?? document.contains(e));
        if (t.length > 0) return t[0];
    }
    return document;
}
```

and `tdi2.js:407-409`:

```js
function be(e, t, n) {
    i(O(n), "tdi:ajax:end", { options: n });
}
```

`be` is A's `_end`. It calls `O`, the same helper the `*sDone` and `done` events use (`tdi2.js:369-396`). The liveness check is therefore present on the `end` path, and the `document` fallback is present too — so a response that removes its own trigger still delivers `tdi:ajax:end` to `document`, and a global spinner does not hang. The "surviving `data-related-element`" case is covered as well: `O` filters the whole involved set and returns the first survivor, which may be a related element rather than the trigger.

**A's copy postdates the colleague's fix.** The asymmetry is gone, deliberately, by factoring both paths through one helper — not a shape that arises by accident from a straight port of v1.

**Two caveats, both in B's favour.**

1. A's `_start` path does *not* filter. `tdi2.js:477-483`:

```js
function ke(e) {
    if (e.involvedElms) {
        if (Array.isArray(e.involvedElms) && e.involvedElms.length > 0) return e.involvedElms[0] ?? document;
        if (e.involvedElms instanceof Element) return e.involvedElms;
    }
    return document;
}
```

This is harmless in practice — nothing has been removed from the DOM at request-start time — but it means A fixed one half of v1's asymmetry rather than normalising both. B's `targetsOf` (`src/net/request.ts:38-41`) is used for `start` and `end` alike:

```js
function targetsOf(involved: Element[]): EventTarget[] {
    const live = involved.filter((el) => el.isConnected)
    return live.length ? live : [document]
}
```

2. **A narrowed the fan-out while fixing the liveness bug, and that is a regression against v1.** Both of A's helpers return a *single* element (`t[0]`, `involvedElms[0]`), whereas v1's `$involvedElms.trigger(...)` fires on the whole jQuery set — the trigger *and* every related element. In A, a `data-related-element` listening for `tdi:ajax:end` or `tdi:ajax:done` on itself never hears it unless it happens to be first in the involved list. B fires on every live involved element and matches v1. This is one of the places where A's production exposure proves less than it appears: the pilot evidently did not bind those events on related elements.

B's implementation also uses `el.isConnected` rather than `document.body.contains(el)`. The two agree for elements in the body; `isConnected` additionally counts elements in `<head>` or in a shadow tree as live, which is the more correct reading of "still in the document".
