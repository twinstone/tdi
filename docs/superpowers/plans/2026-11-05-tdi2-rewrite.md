# TDI 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite TDI as a dependency-free TypeScript library that speaks v1's exact wire protocol and reads v1's exact HTML, published as `twinstone-tdi@2.0.0`.

**Architecture:** One instance-based core (`createTdi`) with three entry points over it — ESM, ESM auto-start, and an IIFE that parks an instance on `window.TDI`. Requests go through `fetch`; responses are parsed with `DOMParser` and applied by an instruction registry where every built-in is registered through the same path `registerInstruction` writes to. Every event is a native `CustomEvent`; `before*` events are `cancelable` and their default action is the DOM work.

**Tech Stack:** TypeScript (strict), Vite library mode, Vitest + jsdom, Oxlint, Prettier, GitHub Actions. Zero runtime dependencies.

> **Amended during execution.** Two toolchain decisions changed after this plan was written. (1) ESLint + typescript-eslint were replaced by **Oxlint** — a user decision that unblocked TypeScript 7, which typescript-eslint caps out below. (2) The test DOM is **jsdom**, not happy-dom: happy-dom emits a `parsererror` for *any* CDATA, and every real TDI response wraps its HTML in CDATA. Both rulings are recorded in the SDD ledger. Task 1 and Task 3 steps below retain their original wording as a historical record.

**Spec:** `docs/superpowers/specs/2026-11-05-tdi2-rewrite-design.md`

## Global Constraints

- **Zero runtime dependencies.** Standard browser APIs only. No jQuery by any route — direct, peer, optional, or shim.
- **Browser floor:** last two majors of evergreen browsers, no IE. `fetch`, `AbortController`, `AbortSignal.timeout`, `replaceChildren`, `closest`, `DOMParser`, `URL`, `URLSearchParams`, `CustomEvent` all assumed. No polyfills, no feature detection.
- **TypeScript strict.** Published `.d.ts` must be useful to consumers.
- **Wire protocol frozen.** Request marking is `_infuse=1&_ts=<epoch-ms>`. Response XML as specified in the design doc's "Frozen: the wire protocol".
- **HTML surface frozen.** `.tdi` and `.infuse` on `a`, `form`, `form [type=submit]`, `select`, `input[type=checkbox|radio]`, `input[type=text]`. Attributes `href`, `action`, `method`, `data-ajax-url`, `data-ajax-method`, `data-ajax-credentials`, `data-related-element`, `data-related-ancestor`, `data-trigger-group`, `data-confirm`, plus `disabled` attribute / `disabled` class as suppressors.
- **Event names unchanged from v1**, including `before*`/past-tense pairs and the `tdi:ajax:<name>sDone` family.
- **Event `detail` key names unchanged from v1**, snake_case included. Only value types go native (spec R3).
- **Default request headers:** `Accept: application/xml, text/xml, */*`. No `X-Requested-With` (spec R1).
- **CSP:** TDI reads the `nonce` from its own script tag and propagates it to every injected `<script>` and `<style>`.
- **Removed, must not reappear:** sync XHR, iframe upload fallback, `rel` as related-element selector, `.ajaxlink`/`.ajaxform`/`.ajaxselect`, `data-ajax-xhr-fields`, `loading-target` class, `beforeStart`/`start`/`beforeEnd`/`end` option callbacks.
- **New dependencies:** check the latest published version before adding, per project convention.

## Review Focus

Inputs the spec implies but no task's happy path exercises. Each has its test pinned to the task that owns the code.

1. **A non-XML response body** (proxy error page, HTML login redirect) must fire `tdi:ajax:error` and reject — never throw past the caller. → Task 3, Task 13.
2. **An instruction targeting a missing id or an empty selector** must be skipped silently, as v1 does, and must not abort the remaining instructions. → Task 8, Task 12.
3. **Two overlapping requests** must each see only their own `responses`; nothing accumulates across requests. This is the v1 bug D2 exists to prevent. → Task 12.
4. **A registered or built-in instruction handler that throws** must not prevent the remaining instructions, the `*sDone` events, or promise settlement. → Task 12.
5. **A `<script src>` that 404s** must settle the pipeline rather than hang it; `send()` must still resolve and `tdi:ajax:scriptsDone` must still fire. → Task 5, Task 10.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/index.ts` | Public ESM entry: `createTdi`, all public types |
| `src/auto.ts` | ESM auto-start entry |
| `src/global.ts` | IIFE entry; sets `window.TDI` |
| `src/types.ts` | Public types: options, event detail payloads, results |
| `src/events.ts` | `dispatch` helper, event-name constants, typed event map |
| `src/net/url.ts` | `ajaxifyUrl` |
| `src/net/parse.ts` | `DOMParser`, `parsererror` detection, instruction extraction |
| `src/net/request.ts` | `fetch` transport: headers, body encoding, abort, error semantics |
| `src/dom/assets.ts` | `<script>`/`<style>` injection: nonce, id dedupe, load promises |
| `src/dom/html.ts` | HTML fragment parsing, insertion, content-script execution |
| `src/dom/elements.ts` | Related/involved elements, `loading` class, trigger-group disabling |
| `src/dom/delegation.ts` | Delegated listeners; `start`/`stop` |
| `src/core/options.ts` | Element attributes → request options |
| `src/core/instance.ts` | `createTdi`: wiring, public methods |
| `src/core/pipeline.ts` | Applies a parsed response; collects `responses`; fires `*sDone`/`done` |
| `src/instructions/registry.ts` | `registerInstruction`, built-in registration, unknown forwarding |
| `src/instructions/{update,insert,script,style,popup,reload,redirect}.ts` | One built-in each |

Tests mirror the source tree under `test/`.

---

### Task 1: Scaffolding, build, CI

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `.prettierrc`, `.github/workflows/ci.yml`, `.size-limit.json`
- Create: `src/index.ts`, `src/global.ts`, `src/auto.ts`
- Delete: `gulpfile.js`, `.jshintrc`, `.jshintignore`, `.jscsrc`, `.travis.yml`, `package-lock.json`
- Test: `test/build.test.ts`

**Interfaces:**
- Produces: `createTdi(options?: TdiOptions): Tdi` (stub returning an object with a `version` string this task); the three entry points and the `exports` map from spec D1.

- [ ] **Step 1: Check latest versions** of `vite`, `vitest`, `typescript`, `happy-dom`, `eslint`, `typescript-eslint`, `prettier`, `size-limit`, `@size-limit/preset-small-lib` before writing `package.json`. Record any version pinned below its latest and why.

- [ ] **Step 2: Write `package.json`** with `"name": "twinstone-tdi"`, `"version": "2.0.0"`, `"type": "module"`, `"sideEffects": false`, no `dependencies`, and the exports map verbatim from spec D1 (`.`, `./auto`, `./global`).

- [ ] **Step 3: Write the failing test** `test/build.test.ts`:
  - `test('build emits all three entry points')` — asserts `dist/tdi.js`, `dist/auto.js`, `dist/tdi.global.js`, `dist/index.d.ts` all exist.
  - `test('global build assigns window.TDI')` — loads `dist/tdi.global.js` source, asserts it contains a `window.TDI` assignment.

- [ ] **Step 4: Run it and watch it fail.** Run: `npx vitest run test/build.test.ts`. Expected: FAIL, dist missing.

- [ ] **Step 5: Write the configs and stub entries.** `vite.config.ts` builds all three entries in one `vite build` (library mode, ESM for `.`/`./auto`, IIFE named `TDI` for `./global`, sourcemaps on). `tsconfig.json` strict. `vitest.config.ts` uses `jsdom` (amended — see header). `src/index.ts` exports a stub `createTdi` returning `{ version: '2.0.0' }`; `src/global.ts` assigns it to `window.TDI`; `src/auto.ts` creates an instance. The global entry emits both `dist/tdi.global.js` and a minified `dist/tdi.global.min.js` — the latter is what the size budget measures and what replaces v1's hand-downloaded `tdi-bundle.min.js`.

- [ ] **Step 6: Build, then run the test.** Run: `npx vite build && npx vitest run test/build.test.ts`. Expected: PASS.

- [ ] **Step 7: Add CI and size budget.** `.github/workflows/ci.yml` runs typecheck, lint, test, build, size on push and PR. `.size-limit.json` budgets `dist/tdi.global.min.js`; set the limit from v1's minified bundle size as the reference point.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "Scaffold TDI 2: Vite, Vitest, TypeScript, CI"
```

---

### Task 2: `ajaxifyUrl`

**Files:**
- Create: `src/net/url.ts`
- Test: `test/net/url.test.ts`

**Interfaces:**
- Produces: `ajaxifyUrl(url: string): string`

- [ ] **Step 1: Write the failing tests** covering v1's four cases plus relative URLs, asserting `_infuse=1` and a numeric `_ts` are present and that the fragment stays last:
  - `'/a'` → `/a?_infuse=1&_ts=<n>`
  - `'/a?x=1'` → keeps `x=1`
  - `'/a#frag'` → params before `#frag`
  - `'/a?#frag'` and `'/a?x=1&#frag'` → no empty or doubled separators
  - `'https://other.example/a?x=1'` → host and path unchanged
  - a URL already carrying `_infuse=1` → not duplicated

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/net/url.test.ts`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement `ajaxifyUrl(url: string): string`** in `src/net/url.ts` using `URL` with `document.baseURI` as base and `URLSearchParams`, returning a relative string when the input was relative and the origin is unchanged.

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/net/url.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/net/url.ts test/net/url.test.ts && git commit -m "Add URL marking for TDI requests"
```

---

### Task 3: XML response parsing

**Files:**
- Create: `src/net/parse.ts`
- Test: `test/net/parse.test.ts`

**Interfaces:**
- Produces:
  - `interface ParsedResponse { status: string; ok: boolean; instructions: Element[] }`
  - `parseResponse(xmlText: string): ParsedResponse`
  - `class TdiParseError extends Error`

- [ ] **Step 1: Write the failing tests:**
  - `test('extracts status and instructions in document order')` — asserts `instructions.map(e => e.tagName)` equals the source order and excludes `<status>`.
  - `test('ok is false for non-OK status, case-insensitively')` — `<status>ok</status>` → `ok === true`; `<status>ERROR</status>` → `false`.
  - `test('throws TdiParseError on a non-XML body')` — an HTML error page throws `TdiParseError`. *(Review Focus 1)*
  - `test('throws TdiParseError on an empty body')`
  - `test('preserves CDATA content verbatim')` — markup inside `<update>` survives as text.

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/net/parse.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `parseResponse`** in `src/net/parse.ts`. Use `DOMParser().parseFromString(text, 'application/xml')` and detect failure by querying for a `parsererror` element — jsdom and browsers both signal malformed XML that way rather than throwing. Note a `parsererror` check alone is NOT sufficient: a *well-formed* HTML page (a 502 or a session-expiry login page) parses cleanly as XML and yields zero instructions, so also reject a root element that is not `<response>`.

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/net/parse.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/net/parse.ts test/net/parse.test.ts && git commit -m "Parse TDI XML responses with DOMParser"
```

---

### Task 4: Event dispatch core

**Files:**
- Create: `src/events.ts`, `src/types.ts`
- Test: `test/events.test.ts`

**Interfaces:**
- Produces:
  - `dispatch<T>(target: EventTarget, name: string, detail: T, cancelable?: boolean): boolean` — returns `false` when prevented.
  - Event-name constants for every v1 event.
  - `src/types.ts`: every detail payload type from spec R3, with v1's key names verbatim, plus `TdiOptions`, `TdiRequestOptions`, `TdiResponses` (the six grouped arrays carried by `tdi:ajax:done`) and `TdiResult` (`{ response: Response; responses: TdiResponses }`).

- [ ] **Step 1: Write the failing tests:**
  - `test('dispatched events bubble to document')`
  - `test('cancelable dispatch returns false when a listener calls preventDefault')`
  - `test('non-cancelable dispatch always returns true')`
  - `test('detail is carried on evt.detail')`

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/events.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `dispatch`** in `src/events.ts` over `CustomEvent` with `bubbles: true`, and write the detail payload types into `src/types.ts`. Copy key names from the design doc's R3 list exactly — `target_id`, `content_empty`, `class_add`, `class_remove`, `script_src`, `script_data`, `script_id`, `script_node`, `script_node_inline`, `style_src`, `style_id`, `style_node`, `inserted_node`, and the rest. `target` is typed `Element[]`.

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/events.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/events.ts src/types.ts test/events.test.ts && git commit -m "Add native CustomEvent dispatch and public detail types"
```

---

### Task 5: Asset injection

**Files:**
- Create: `src/dom/assets.ts`
- Test: `test/dom/assets.test.ts`

**Interfaces:**
- Produces:
  - `injectScript(src: string, opts: { id?: string; nonce?: string }): Promise<HTMLScriptElement>`
  - `injectInlineScript(code: string, opts: { id?: string; nonce?: string }): HTMLScriptElement`
  - `injectStyle(src: string, opts: { id?: string; nonce?: string; media?: string }): Promise<HTMLLinkElement>`

- [ ] **Step 1: Write the failing tests:**
  - `test('injectScript appends to head and resolves on load')`
  - `test('injectScript sets the nonce attribute and property')`
  - `test('injectScript resolves rather than hanging when the script fails to load')` — simulate `error`; the promise must settle. *(Review Focus 5)*
  - `test('injectInlineScript suffixes the id with _inline')` — v1 behaviour.
  - `test('injectStyle appends a link with media defaulting to screen')`

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/dom/assets.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement the three functions** in `src/dom/assets.ts`. Resolve on `load`, and on `error` resolve rather than reject so a 404 cannot stall the response pipeline. Set `nonce` as both attribute and property, as v1 does.

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/dom/assets.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/dom/assets.ts test/dom/assets.test.ts && git commit -m "Add nonce-aware script and style injection"
```

---

### Task 6: Content insertion and content scripts

**Files:**
- Create: `src/dom/html.ts`
- Test: `test/dom/html.test.ts`

**Interfaces:**
- Consumes: `injectScript`, `injectInlineScript` from Task 5.
- Produces:
  - `parseFragment(html: string): DocumentFragment`
  - `runContentScripts(root: ParentNode, nonce?: string): Promise<void>`

- [ ] **Step 1: Write the failing tests:**
  - `test('parseFragment preserves table rows')` — a bare `<tr>` survives; `<template>`-based parsing is required for this, `innerHTML` on a `div` is not enough.
  - `test('runContentScripts executes inline scripts in document order')` — two inline scripts pushing to a global array assert order.
  - `test('runContentScripts awaits src scripts before resolving')`
  - `test('runContentScripts propagates the nonce')`
  - `test('scripts inserted via innerHTML do not self-execute')` — pins the native behaviour this function exists to compensate for (spec D10).

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/dom/html.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement both functions** in `src/dom/html.ts`. `parseFragment` uses `<template>.innerHTML`. `runContentScripts` collects `script` elements in document order and replays each through Task 5's injectors, awaiting `src` scripts before continuing to the next.

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/dom/html.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/dom/html.ts test/dom/html.test.ts && git commit -m "Add fragment parsing and content script execution"
```

---

### Task 7: Instruction registry

**Files:**
- Create: `src/instructions/registry.ts`
- Test: `test/instructions/registry.test.ts`

**Interfaces:**
- Consumes: `dispatch` from Task 4.
- Produces:
  - `type InstructionHandler<D> = (detail: D) => void | Promise<void>`
  - `class InstructionRegistry { register(name: string, handler: InstructionHandler<any>): void; resolve(name: string): InstructionHandler<any> | undefined }`
  - `runInstruction(registry, name, detail, dispatchTarget, beforeEventName): Promise<void>` — fires the cancelable `before*` event, runs the handler only if not prevented.

- [ ] **Step 1: Write the failing tests:**
  - `test('a registered handler runs as the default action')`
  - `test('preventDefault on the before event suppresses the handler')`
  - `test('register overrides a built-in of the same name')` — built-ins and custom instructions share one path, no privileged registration.
  - `test('an unknown instruction name still fires its before event')` — `<cart-badge>` → `tdi:ajax:beforeCartBadge`, with the v1 capitalisation rule.
  - `test('unknown instruction attributes are copied onto detail')`

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/instructions/registry.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement the registry and `runInstruction`** in `src/instructions/registry.ts`. The `before*` event name is built from the instruction name with the first character upper-cased, matching v1's `_onBeforeUnknown`; hyphenated names upper-case each segment (`cart-badge` → `CartBadge`).

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/instructions/registry.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/instructions/registry.ts test/instructions/registry.test.ts && git commit -m "Add instruction registry with cancelable default actions"
```

---

### Task 8: `update` instruction

**Files:**
- Create: `src/instructions/update.ts`
- Test: `test/instructions/update.test.ts`

**Interfaces:**
- Consumes: `parseFragment`, `runContentScripts` (Task 6); registry types (Task 7).
- Produces: `buildUpdateDetail(tag: Element, options: TdiRequestOptions): UpdateDetail | null`, `applyUpdate(detail: UpdateDetail): Promise<void>`

- [ ] **Step 1: Write the failing tests:**
  - `test('replaces target contents by default')`
  - `test('replace="true" replaces the element itself')`
  - `test('append="true" and prepend="true" place content correctly')`
  - `test('class-add and class-remove apply to the target')`
  - `test('selector takes precedence over target')`
  - `test('selector matching many elements updates all of them')`
  - `test('an empty body clears the target')` — spec R2, the shipped v1 behaviour.
  - `test('a missing target id is skipped without throwing')` — returns `null`, no event. *(Review Focus 2)*
  - `test('scripts in update content execute')` — spec D10.
  - `test('fires tdi:ajax:update on the target after applying')`

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/instructions/update.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement both functions** in `src/instructions/update.ts`. `target` resolves against `document` (spec R9): `selector` via `querySelectorAll`, otherwise `target` via `getElementById`. `detail.target` is always an `Element[]`. `content_empty` is computed and carried but no branch reads it.

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/instructions/update.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/instructions/update.ts test/instructions/update.test.ts && git commit -m "Add update instruction"
```

---

### Task 9: `insert` instruction

**Files:**
- Create: `src/instructions/insert.ts`
- Test: `test/instructions/insert.test.ts`

**Interfaces:**
- Consumes: Task 6, Task 7.
- Produces: `buildInsertDetail(tag, options): InsertDetail | null`, `applyInsert(detail): Promise<void>`

- [ ] **Step 1: Write the failing tests:**
  - `test('inserts after the target by default')`
  - `test('position="before" inserts before the target')`
  - `test('inserted_node carries the inserted elements')`
  - `test('a missing target is skipped without throwing')`
  - `test('scripts in insert content execute')`
  - `test('fires tdi:ajax:insert on the target')`

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/instructions/insert.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement both functions** in `src/instructions/insert.ts` using `before`/`after`, capturing the inserted elements into `detail.inserted_node` before they are adopted.

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/instructions/insert.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/instructions/insert.ts test/instructions/insert.test.ts && git commit -m "Add insert instruction"
```

---

### Task 10: `script` and `style` instructions

**Files:**
- Create: `src/instructions/script.ts`, `src/instructions/style.ts`
- Test: `test/instructions/script.test.ts`, `test/instructions/style.test.ts`

**Interfaces:**
- Consumes: Task 5.
- Produces: `applyScript(detail: ScriptDetail): Promise<void>`, `applyStyle(detail: StyleDetail): Promise<void>`

- [ ] **Step 1: Write the failing tests:**
  - `test('src loads before the inline body runs')`
  - `test('an id already present in the document is not downloaded again')` — v1 dedupe, for both script and style.
  - `test('a failing src still settles and fires tdi:ajax:script')` *(Review Focus 5)*
  - `test('script_node and script_node_inline are set on detail')`
  - `test('style injection sets style_node and fires tdi:ajax:style')`

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/instructions/script.test.ts test/instructions/style.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement both handlers.** Ordering across multiple `script` instructions is the pipeline's job (Task 12), not these handlers'; each handler sequences only its own `src`-then-inline pair.

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/instructions/script.test.ts test/instructions/style.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/instructions/script.ts src/instructions/style.ts test/instructions/ && git commit -m "Add script and style instructions"
```

---

### Task 11: `popup`, `reload`, `redirect` instructions

**Files:**
- Create: `src/instructions/popup.ts`, `src/instructions/reload.ts`, `src/instructions/redirect.ts`
- Test: `test/instructions/navigation.test.ts`

**Interfaces:**
- Produces: `applyPopup(detail)`, `applyReload(detail)`, `applyRedirect(detail)`

- [ ] **Step 1: Write the failing tests** with `window.open`, `location.reload` and `location.assign` stubbed:
  - `test('popup opens _blank with no features in popup mode')`
  - `test('popup in dialog mode passes width and height features')` — defaults 600×500, parsed with an explicit radix.
  - `test('popup without href is skipped')`
  - `test('reload calls location.reload')`
  - `test('redirect calls location.assign with href')`
  - `test('redirect without href is skipped')`

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/instructions/navigation.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement the three handlers.** `popup` stays a plain `window.open` per spec D8 — no in-page `<dialog>`.

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/instructions/navigation.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/instructions/popup.ts src/instructions/reload.ts src/instructions/redirect.ts test/instructions/navigation.test.ts && git commit -m "Add popup, reload and redirect instructions"
```

---

### Task 12: Response pipeline

**Files:**
- Create: `src/core/pipeline.ts`
- Test: `test/core/pipeline.test.ts`

**Interfaces:**
- Consumes: Tasks 3, 4, 7–11.
- Produces: `applyResponse(parsed: ParsedResponse, options: TdiRequestOptions, registry, involved: Element[]): Promise<TdiResponses>`

This task owns ordering, per-request state, and the `*sDone`/`done` events. It is where spec D2's "accumulation impossible by construction" is proven.

- [ ] **Step 1: Write the failing tests:**
  - `test('instructions apply in document order')`
  - `test('script instructions run after updates and inserts, in order')` — matches v1, which defers collected scripts to the end.
  - `test('responses are scoped to one request')` — run `applyResponse` twice; the second result contains only its own updates. *(Review Focus 3)*
  - `test('a handler that throws does not stop later instructions')` — a throwing `update` still lets a following `insert` apply, `done` still fires, the promise still settles. *(Review Focus 4)*
  - `test('a missing target does not abort the response')` *(Review Focus 2)*
  - `test('fires updatesDone, insertsDone, stylesDone, popupsDone, unknownsDone, scriptsDone then done')` — asserts the order.
  - `test('done fires on document when involved elements have left the DOM')` — v1 issue #6 fallback.
  - `test('a non-OK status still applies instructions')` — spec R4.

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/core/pipeline.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `applyResponse`** in `src/core/pipeline.ts`. All collection state is local to the call — no module-level arrays. Scripts are collected during the walk and run sequentially after the other instructions. Handler errors are caught per instruction and reported via `console.error`, never rethrown. Dispatch targets follow the table in spec R5.

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/core/pipeline.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/pipeline.ts test/core/pipeline.test.ts && git commit -m "Add response pipeline with per-request state"
```

---

### Task 13: Request layer

**Files:**
- Create: `src/net/request.ts`
- Test: `test/net/request.test.ts`

**Interfaces:**
- Consumes: Tasks 2, 3, 12.
- Produces: `sendRequest(url: string, options: TdiRequestOptions, registry: InstructionRegistry, involved: Element[]): Promise<TdiResult>`

- [ ] **Step 1: Write the failing tests** against a stubbed `fetch`:
  - `test('sends Accept but not X-Requested-With')` — spec R1.
  - `test('a string body sets urlencoded Content-Type')` — `application/x-www-form-urlencoded; charset=UTF-8`.
  - `test('an object body is serialised to urlencoded')`
  - `test('a FormData body sets no explicit Content-Type')` — the browser must supply the multipart boundary.
  - `test('GET puts data in the query string, not the body')`
  - `test('the headers option overrides defaults')`
  - `test('credentials defaults to same-origin and data-ajax-credentials overrides it')` — spec D7.
  - `test('fires start then end on the involved elements')`
  - `test('rejects and fires tdi:ajax:error on a non-XML body')` *(Review Focus 1)*
  - `test('rejects on network failure and fires tdi:ajax:error')`
  - `test('a non-OK status fires error but resolves')` — spec R4.
  - `test('abort rejects, fires end, and does not fire error')` — spec R4.
  - `test('resolves with response and responses')`

- [ ] **Step 2: Run and watch it fail.** Run: `npx vitest run test/net/request.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `sendRequest`** in `src/net/request.ts`. Mark the URL with Task 2, build the `RequestInit` from the pass-through subset (`credentials`, `headers`, `mode`, `cache`, `redirect`, `signal`), create an `AbortController` per request and link any caller `signal`, then hand the parsed response to Task 12.

- [ ] **Step 4: Run and watch it pass.** Run: `npx vitest run test/net/request.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/net/request.ts test/net/request.test.ts && git commit -m "Add fetch-based request layer"
```

---

### Task 14: Element options and element state

**Files:**
- Create: `src/core/options.ts`, `src/dom/elements.ts`
- Test: `test/core/options.test.ts`, `test/dom/elements.test.ts`

**Interfaces:**
- Produces:
  - `optionsFromElement(el: Element): TdiRequestOptions & { url: string; confirm?: string; suppressed: boolean }`
  - `relatedElements(el: Element): Element[]`, `involvedElements(el: Element): Element[]`
  - `setLoading(els: Element[], on: boolean): void`
  - `disableTriggerGroup(el: Element): () => void` — returns the undo function

- [ ] **Step 1: Write the failing tests:**
  - `test('url prefers data-ajax-url over href and action')`
  - `test('method prefers data-ajax-method over the method attribute')`
  - `test('an unchecked checkbox sends 0 for its name')` — v1 behaviour.
  - `test('an element with no url falls back to its value')`
  - `test('the disabled attribute and the disabled class both suppress')`
  - `test('data-ajax-credentials maps to credentials')`
  - `test('rel is ignored')` — spec D6; it must not resolve related elements.
  - `test('related elements come from data-related-element and data-related-ancestor')`
  - `test('setLoading toggles only the loading class')` — `loading-target` must never appear. *(spec D6)*
  - `test('disableTriggerGroup disables every matched element and the undo restores only what it disabled')` — spec R6; an element already disabled before the request stays disabled afterwards.

- [ ] **Step 2: Run and watch them fail.** Run: `npx vitest run test/core/options.test.ts test/dom/elements.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement both modules.** `disableTriggerGroup` records which elements it actually changed so the undo cannot enable something the page had disabled for its own reasons.

- [ ] **Step 4: Run and watch them pass.** Run: `npx vitest run test/core/options.test.ts test/dom/elements.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/options.ts src/dom/elements.ts test/core/options.test.ts test/dom/elements.test.ts && git commit -m "Add element option reading and request-state helpers"
```

---

### Task 15: `sendElement` and `sendForm`

**Files:**
- Modify: `src/core/instance.ts`
- Test: `test/core/send.test.ts`

**Interfaces:**
- Consumes: Tasks 13, 14.
- Produces: `sendElement(el: Element, options?: TdiRequestOptions): Promise<TdiResult>`, `sendForm(form: HTMLFormElement, options?: TdiRequestOptions): Promise<TdiResult>`

- [ ] **Step 1: Write the failing tests:**
  - `test('sendElement applies the loading class for the request duration')`
  - `test('sendElement disables the trigger group and restores it afterwards')`
  - `test('sendElement honours data-confirm and sends nothing when declined')`
  - `test('sendElement sends nothing when the element is suppressed')`
  - `test('sendForm serialises fields with URLSearchParams for GET')`
  - `test('sendForm uses FormData when the form contains a file input')` — and forces POST.
  - `test('sendForm includes the clicked submit button name and value')` — via `new FormData(form, submitter)`, with no hidden field left in the DOM afterwards. *(spec: minor items settled)*
  - `test('loading class is removed when the request fails')`

- [ ] **Step 2: Run and watch them fail.** Run: `npx vitest run test/core/send.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement both methods** on the instance. State restoration goes in a `finally` so a rejected request cannot leave `loading` or a disabled trigger group behind.

- [ ] **Step 4: Run and watch them pass.** Run: `npx vitest run test/core/send.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/instance.ts test/core/send.test.ts && git commit -m "Add sendElement and sendForm"
```

---

### Task 16: Delegation, `start`/`stop`, entry points

**Files:**
- Create: `src/dom/delegation.ts`
- Modify: `src/core/instance.ts`, `src/index.ts`, `src/auto.ts`, `src/global.ts`
- Test: `test/dom/delegation.test.ts`, `test/core/instance.test.ts`

**Interfaces:**
- Consumes: Tasks 14, 15.
- Produces: the complete `Tdi` surface from spec D4 — `start`, `stop`, `send`, `sendElement`, `sendForm`, `ajaxifyUrl`, `registerInstruction`.

- [ ] **Step 1: Write the failing tests:**
  - `test('a click on a.tdi sends and prevents default')`
  - `test('ctrl, meta, shift and middle clicks are ignored')` — v1 behaviour; the browser handles them.
  - `test('preventDefault on tdi:ajax:beforeLinkClick suppresses the request')`
  - `test('submit on form.infuse sends and prevents default')`
  - `test('preventDefault on tdi:ajax:beforeFormSubmit suppresses the request')`
  - `test('change on select.tdi submits its form when it has no data-ajax-url')`
  - `test('Enter in input[type=text].tdi sends')`
  - `test('.ajaxlink, .ajaxform and .ajaxselect are not bound')` — spec D6.
  - `test('stop removes every listener')` — a click after `stop()` sends nothing.
  - `test('start is idempotent')` — calling twice does not double-send.
  - `test('root scopes delegation but instructions still target document')` — spec R9.
  - `test('registerInstruction on the instance reaches the pipeline')`
  - `test('the global entry sets window.TDI and auto-starts')`

- [ ] **Step 2: Run and watch them fail.** Run: `npx vitest run test/dom/delegation.test.ts test/core/instance.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement delegation and finish the instance.** One listener per event type on `root`, matching via `closest`. There is no `unload`/`pagehide` unbinding — `stop()` is the only teardown (spec D2). Read the nonce once from `document.currentScript` at module initialisation.

- [ ] **Step 4: Run and watch them pass.** Run: `npx vitest run`. Expected: PASS, whole suite.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Add event delegation, start/stop and entry points"
```

---

### Task 17: Documentation and demo

**Files:**
- Create: `docs/migration-v1-to-v2.md`, `demo/index.html`, `demo/responses/*.xml`
- Modify: `README.md`, `docs/web-page-integration/web-page-integration-js.md`, `docs/web-page-integration/web-page-integration-css.md`, `docs/download-and-setup.md`, `CHANGELOG.md`
- Delete: `example/`, `src/` (v1 JavaScript), `tests/` (v1 QUnit), `banner.txt`, `README-jsdoc.md`, `changes.txt`

- [ ] **Step 1: Write `docs/migration-v1-to-v2.md`** for someone holding a working v1 site. Every entry carries before/after code. It must cover, at minimum:
  - the four breaks: handler signature `(evt, data)` → `evt.detail`; `options.trigger` as `Element`; the R3 value-type changes including `detail.target` as `Element[]`; the removal of the `beforeStart`/`start`/`beforeEnd`/`end` callbacks.
  - the removals from D6, with `loading-target` given prominence — it degrades **silently**, breaking CSS with no error anywhere.
  - `data-ajax-xhr-fields` → `data-ajax-credentials`.
  - the API flattening table, v1 name → v2 name.
  - the packaging change: ESM, `tdi/auto`, `tdi/global`, and which one replaces `tdi-bundle.min.js`.
  - **preserved but surprising:** scripts inside `update`/`insert` content still execute (spec D10), and an empty `<update>` still clears its target (spec R2). Readers will assume both changed.

- [ ] **Step 2: Rewrite `docs/web-page-integration/web-page-integration-js.md`** — every example there is jQuery today. Remove the `loading-target` paragraph from the CSS doc.

- [ ] **Step 3: Verify the protocol docs need no change.** Read `docs/infusing-protocol/*.md` against the implementation. Any required change there means something has drifted from the design — stop and report it rather than editing. Fix only the one known doc-vs-code conflict: `infusing-protocol-status.md` claims a non-OK status is shown via `alert()`, which no version has ever done.

- [ ] **Step 4: Build the demo.** `demo/index.html` exercises every instruction against static XML files, loading the global build.

- [ ] **Step 5: Verify the whole thing.** Run: `npx vitest run && npx vite build && npx tsc --noEmit && npx eslint . && npx size-limit`. Expected: all pass. Open the demo and confirm each instruction visibly works.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Add migration guide, update docs, replace example with demo"
```
