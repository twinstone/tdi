# TDI 2 — Design

**Date:** 2026-11-05
**Status:** approved for planning
**Branch:** `tdi2` (from `master`)

## Intent

TDI is Etnetera's library for server-driven partial page updates. A page marks links
and forms with a CSS class, TDI intercepts them, sends the request, and applies an XML
list of instructions the server returns. All application logic stays on the server.

v1 works, but it is ES5, built on jQuery, assembled by gulp into a single global bundle,
and carries support code for Internet Explorer 7. It cannot be imported as a module, has
no types, and its test suite loads QUnit 1.19 over plain HTTP from a CDN and runs under
PhantomJS.

v2 is a clean rewrite: TypeScript, no runtime dependencies, Vite and Vitest, ESM-first
with a global build for script-tag consumers. It speaks the same wire protocol and reads
the same HTML, so servers and CMS templates do not change.

### Why now

The jQuery dependency is the binding constraint. It forces every consuming site to ship
jQuery whether or not it otherwise needs it, and v1's extension mechanism is built on
`$.event.special[type]._default` — a jQuery internal — so the library cannot be ported
piecemeal. Native `CustomEvent` with `cancelable: true` provides the same
cancellable-default-action semantics with no library at all.

### Release and rollout

v2 ships as a new major version of the npm package. Nothing in the field changes on
release day; every existing site keeps running its own downloaded v1 bundle for as long
as it likes. Migration is opt-in. One or two small, low-traffic CMS projects will be
chosen as pilots after release.

There is therefore no forced-migration deadline and no need to preserve v1's JavaScript
API shape. Breaking changes are acceptable where they buy something real. They are not
free: each one is work someone does by hand on a pilot site.

## Prior art in this repository

A previous v2 attempt exists on `origin/TDI2-main` (version 2.0.12-beta, last commit
2025-10-07). It is TypeScript and jQuery-free, built with tsdx, with roughly 116 lines of
tests against ~2,400 lines of source. **That work is stalled and is not being carried
forward.** v2 starts clean from `master`.

It remains useful as reference. Its CHANGELOG records decisions reached independently
here — dropping the iframe upload path, making request headers configurable, executing
`<script>` tags found in `update` content — and a builder may read it for context. No
code is to be copied from it without review.

## Goals

1. Zero runtime dependencies. Standard browser APIs only.
2. TypeScript throughout, strict mode, with published types useful to consumers.
3. ESM-first package with a global-registering build for script-tag sites.
4. Byte-identical wire protocol to v1. Servers emit the same XML.
5. Identical HTML authoring surface. CMS templates do not change.
6. Vite for build, Vitest for tests, with test coverage meaningfully better than v1's.
7. A migration document good enough to decide and act on.

## Non-goals

- Changing the XML protocol. No JSON variant, no new instructions in v2.
- Supporting Internet Explorer or any non-evergreen browser.
- Rendering UI. TDI applies instructions; it does not own widgets, modals, or spinners.
- A jQuery compatibility bridge. Explicitly rejected (see Decisions).
- Server-side libraries. Out of scope for this repository.

## Anti-goals

Outcomes that would make this a failure even if it technically works:

- **A jQuery dependency re-entering by any route** — direct, peer, optional, or a shim.
- **Breaking the HTML contract.** If a CMS template needs editing to move to v2, the
  rewrite has failed at its main job.
- **A pure-ESM package.** Sites load TDI as a classic script and reach for `window.TDI`
  from inside their own ES modules. A package that cannot serve that pattern is unusable
  for the primary consumers.
- **Reinventing v1's hidden global state.** The accumulation bug described below must be
  impossible by construction, not merely fixed.
- **An API invented from one project's conventions.** v1 acquired warts that way.

## Constraints

### Frozen: the wire protocol

The response is an XML document. v2 must accept exactly what v1 accepted:

```xml
<?xml version="1.0"?>
<response>
    <status>OK</status>
    <update target|selector [replace append prepend class-add class-remove]>html</update>
    <insert target|selector [position]>html</insert>
    <script [src] [id]>inline js</script>
    <style src [id]></style>
    <popup href [mode width height]></popup>
    <reload></reload>
    <redirect href></redirect>
    <!-- any unknown element is forwarded to the application -->
</response>
```

Semantics that must be preserved exactly:

- `status` other than `OK` (case-insensitive) is an error, but the response is still
  processed.
- `selector` takes precedence over `target` when both are present. `target` is an element
  id, not a selector.
- `update` with no `replace`/`append`/`prepend` replaces the target's *contents*; with
  `replace="true"` it replaces the *element*.
- An empty `update` body does not clear the target.
- `insert` defaults to `position="after"`.
- `script` instructions execute strictly in document order, each waiting for the previous
  to finish loading. An external `src` loads first, then the inline body runs.
- A `script` or `style` with an `id` already present in the document is not downloaded
  again.
- Unknown elements are forwarded with all their attributes as event detail.

### Frozen: the HTML authoring surface

Classes that activate TDI, on the elements v1 supports:

- `a.tdi`, `a.infuse`
- `form.tdi`, `form.infuse` (and their `[type=submit]` descendants)
- `select.tdi`, `select.infuse`
- `input[type=checkbox|radio].tdi`, `.infuse`
- `input[type=text].tdi`, `.infuse` (submits on Enter)

Attributes that must keep working: `href`, `action`, `method`, `data-ajax-url`,
`data-ajax-method`, `data-related-element`, `data-related-ancestor`, `data-trigger-group`,
`data-confirm`, and the `disabled` attribute / `disabled` class as suppressors.

Request marking stays `_infuse=1&_ts=<epoch-ms>` appended to the URL.

The `loading` class is still applied to the trigger and its related elements for the
duration of a request.

### Browser floor

The last two major versions of evergreen browsers. No Internet Explorer. `fetch`,
`AbortController`, `AbortSignal.timeout`, `replaceChildren`, `closest`, `DOMParser`,
`URL`, `URLSearchParams`, and `CustomEvent` are all assumed present. No polyfills, no
feature detection.

### Content Security Policy

CSP with nonces is live in production at consumer sites. TDI reads the `nonce` from its
own script tag and propagates it to every `<script>` and `<style>` element it injects.
This is load-bearing, not legacy.

## Decisions

These were settled during design. They are not open for the builder to revisit.

### D1 — Three entry points over one core

| Entry | Format | Behaviour |
|---|---|---|
| `tdi` | ESM | Exports `createTdi` and types. No side effects on import. `sideEffects: false`. |
| `tdi/auto` | ESM | `import 'tdi/auto'` creates a document-scoped instance and starts it. |
| `tdi/global` | IIFE | Classic `<script src>`. Sets `window.TDI` and auto-starts. |

```json
"exports": {
  ".":        { "types": "./dist/index.d.ts", "import": "./dist/tdi.js" },
  "./auto":   { "types": "./dist/auto.d.ts",  "import": "./dist/auto.js" },
  "./global": "./dist/tdi.global.js"
}
```

All three build from one source via Vite library mode in a single `vite build`.

The global build is not a "compatibility" build. It is a packaging format. It exposes the
same modern API as the ESM entry.

### D2 — Instance-based core

`createTdi({ root })` returns an instance. The global build parks one on `window`.

Two reasons. First, it makes v1's state-accumulation bug impossible: per-request state
lives on a request object, not in module scope. Second, `root` becomes configurable, so
TDI can be scoped to a subtree rather than always owning `document`.

`start()` attaches the delegated listeners; `stop()` removes them. v1's `unload` handler,
which unbinds on page hide and harms bfcache, is deleted outright.

### D3 — Native CustomEvent, no jQuery bridge

Every event becomes a `CustomEvent` with its payload in `detail`, dispatched with
`bubbles: true` (consumers listen on `document`) and `cancelable: true` for the `before*`
family.

The cancellable-default-action pattern maps directly:

```ts
const ev = new CustomEvent('tdi:ajax:beforeUpdate', { detail, bubbles: true, cancelable: true })
if (target.dispatchEvent(ev)) applyUpdate(detail)   // not prevented → run default
```

**A jQuery compatibility layer was considered and rejected.** The requirement is TDI-level
compatibility — same classes, same attributes, same protocol, same `window.TDI` — not
jQuery-level. Consumers rewrite their event handlers.

The two concrete breaks, both documented with worked examples in the migration guide:

- `function (evt, data)` becomes `(evt) => evt.detail`.
- `detail.options.trigger` is a plain `Element`, not a jQuery object. jQuery-using
  consumers wrap it themselves.

Event names are unchanged from v1, including the `before*` / past-tense pairs and the
`tdi:ajax:<name>sDone` family.

### D4 — Flattened API, promise-returning

```ts
TDI.start(options?)
TDI.stop()
TDI.send(url, options?)          // was TDI.Ajax.Request.send
TDI.sendElement(el, options?)    // was TDI.Ajax.send
TDI.sendForm(form, options?)     // was TDI.Ajax.Request.sendForm
TDI.ajaxifyUrl(url)
TDI.registerInstruction(name, handler)
```

`TDI.Tools.getScript` and `getStyle` become internal. They exist only to serve the
`script` and `style` instructions.

`send` resolves once every instruction in the response has been applied, including scripts
having loaded and run in order. v1 could not express this, which is why it polled
`_scriptsDone` on a 100ms interval. Events still fire exactly as before, so nothing is
required to use the promise.

`options` accepts a pass-through subset of `RequestInit`: `credentials`, `headers`,
`mode`, `cache`, `redirect`, `signal`. This replaces v1's vague "jQuery.ajax() settings"
passthrough with something that has a specification behind it.

`data` accepts a string, a plain object, or `FormData`, as v1 did. Both string and object
forms are in live use and must keep working.

### D5 — fetch, with cancellation

`fetch` replaces `XMLHttpRequest`. Every request gets an `AbortController`, so a trigger
group can abort an in-flight request rather than race it — something v1 had no answer for.
The response is parsed with `DOMParser`, with explicit `parsererror` detection rather than
v1's silent reliance on jQuery's XML handling.

`ajaxifyUrl` is rebuilt on `URL` + `URLSearchParams`, replacing v1's four-case
`indexOf`/`replace` string surgery.

### D6 — Dropped from v1

- **Synchronous XHR.** The `sync` option is gone.
- **The hidden-iframe upload fallback.** Uploads use `FormData` + `fetch`. This removes
  roughly 100 lines, the `documentMode <= 8` branch, and the XHR2/FormData feature
  detection.
- **The `rel` attribute** as a related-element selector. Already deprecated in v1's docs;
  `data-related-element` replaces it.
- **The `.ajaxlink` / `.ajaxform` / `.ajaxselect` class aliases.** `.tdi` and `.infuse`
  remain.
- **`data-ajax-xhr-fields`.** See D7.
- **The `currentScript` polyfill** and all IE support code.
- **The `loading-target` class**, deprecated in v1. Only `loading` remains. This one is
  silent — a site styling `.loading-target` loses that styling with no error — so it needs
  prominent placement in the migration guide.

If a real compatibility problem emerges in a pilot, a small adapter may be written then.
None is written on spec.

### D7 — `data-ajax-credentials` replaces `data-ajax-xhr-fields`

v1 took a JSON blob in an attribute whose only real payload was `withCredentials: true`.

- Markup: `data-ajax-credentials="include | same-origin | omit"`, default `same-origin`.
- JS: `credentials` in the `RequestInit` subset.

The default matches v1's effective XHR behaviour, so nothing changes for anyone who never
used the attribute.

### D8 — `popup` stays `window.open`

The instruction is kept with its current semantics and is *not* redefined as an in-page
`<dialog>`.

Builders should know why it looks broken: `window.open` is called from the response
handler, long after the originating click has lost transient activation, so popup blockers
block it by default. This is a real limitation, inherent to doing it asynchronously, and
it is documented rather than worked around. Rendering an in-page dialog instead would drag
UI into a library that has never rendered anything of its own.

### D9 — `registerInstruction`

v1's forwarding of unknown instructions as `tdi:ajax:before<Name>` events stays — it is
protocol-level and servers depend on it.

v2 adds a deliberate way in:

```ts
TDI.registerInstruction('cart-badge', (detail) => { /* becomes the default action */ })
```

A registered handler becomes the real default action for that element name, still
preceded by a cancellable `before*` event, and carries types. Projects do define their own
instructions, so this is a first-class extension point, not a convenience.

Built-in instructions are registered through the same registry the public method writes
to. There is no privileged path.

### D10 — Scripts in `update` / `insert` content execute

jQuery's `.html()` executed `<script>` elements found in inserted markup. Native
`innerHTML` does not. v2 therefore re-executes them deliberately: a naive port to
`innerHTML` would silently break every site that relies on this, with no error anywhere.

Injected scripts carry the TDI nonce. This needs a worked example in the migration guide
even though behaviour is *preserved*, because it is the kind of thing a reader will assume
changed.

### D11 — Tooling

- **Vite** library mode, all three entries from one config. Sourcemaps published.
- **Vitest** for unit and integration tests, DOM-backed.
- **TypeScript** strict.
- **ESLint** flat config plus Prettier, replacing jshint and jscs.
- **GitHub Actions** replacing Travis.
- **A size budget** checked in CI. v1's minified bundle is the reference point.

Any new dev dependency is checked for its latest version at the time of adding, per
project convention.

## v1 bugs to fix, not port

1. **State accumulation.** `_responses` and `_scriptTags` (`src/tdi-ajax.js:814-825`) are
   module-level and never reset between requests. Every `tdi:ajax:done` payload carries
   every update, insert, style and popup from every prior request in the page's lifetime.
   D2 makes this structurally impossible.
2. **`setInterval` polling** at 100ms to detect script completion. Replaced by promises.
3. **`window[evt.type] = true`** in `_unbindUI` — meaningless leftover assigning to a
   global named `pagehide`.
4. **The `unload` handler** that unbinds all listeners, harming bfcache. Deleted; `stop()`
   is explicit.
5. **`parseInt` without a radix** in the `popup` handler.
6. **`$(iframe).load()`**, removed in jQuery 3, in a code path v1 can still reach.

## Deliverables

1. The rewritten library on branch `tdi2`.
2. A test suite with meaningful coverage of the protocol and the DOM instructions.
3. **`docs/migration-v1-to-v2.md`** — its own document, not a README section, written for
   someone holding a working v1 site and deciding whether to move. It must cover every
   break in D3, D6 and D7, the preserved-but-surprising behaviour in D10, and the
   `loading-target` removal, each with before/after code.
4. Updated `docs/web-page-integration/web-page-integration-js.md`, whose examples are
   entirely jQuery today.
5. A demo page exercising each instruction, replacing `example/`.
6. CI: typecheck, lint, test, build, size budget.

The protocol documents under `docs/infusing-protocol/` describe the wire format, which is
frozen, and should need no changes. Any change there is a signal that something has
drifted from this design.

## Left to the builder

- Internal module layout and file boundaries.
- The DOM environment for Vitest (jsdom vs happy-dom) and which behaviours, if any, need a
  real browser instead.
- How the instruction registry is structured internally.
- Error and warning message wording.
- Whether `createTdi` takes further options beyond `root`.
- Test file organisation and naming.
- Whether the generated JSDoc API site under `docs/api/` is regenerated, replaced with
  something driven by the TypeScript types, or dropped in favour of the hand-written docs.
