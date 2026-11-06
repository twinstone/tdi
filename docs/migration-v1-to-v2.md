# Migrating from TDI 1 to TDI 2

This guide is for someone holding a working v1 site and deciding whether to move.

**What did not change.** The wire protocol (the XML your server sends), the HTML authoring surface (`class="tdi"`, `href`, `action`, `data-ajax-url`, `data-related-element`, `data-confirm`, ...), the request marking (`_infuse=1&_ts=...`), the event names, and the `loading` class. Your server and your CMS templates do not change.

**What did change.** TDI 2 is TypeScript with zero runtime dependencies (no jQuery) and uses native `fetch` and `CustomEvent`. Everything that touched jQuery in v1 now touches the platform. In practice that means your JavaScript that *listens to TDI events or calls the TDI API* needs edits. Markup and server code do not.

**Rollout.** v2 is a new major version. Nothing changes on a site until it opts in: a site keeps running its own downloaded v1 bundle for as long as it likes.

**Browsers.** Current evergreen browsers (last two major versions). Internet Explorer and every other non-evergreen browser are gone.

## Checklist

1. Replace the script tags (jQuery is no longer needed by TDI): see [Packaging](#packaging).
2. Search your JS for `tdi:ajax:` and rewrite every handler: [break 1](#1-handler-signature-evt-data--evtdetail).
3. Search for `.trigger`, `target`, `inserted_node`, `script_node`, `style_node`, `.tag`: [breaks 2 and 3](#2-optionstrigger-is-a-plain-element).
4. Search for `beforeStart`, `start:`, `beforeEnd`, `end:` passed to `TDI.Ajax.send`: [break 4](#4-the-beforestart--start--beforeend--end-callbacks-are-gone).
5. Search your **CSS** for `.loading-target`: [it fails silently](#loading-target-is-gone-and-nothing-will-tell-you).
6. Search for `.ajaxlink`, `.ajaxform`, `.ajaxselect`, `rel=`, `data-ajax-xhr-fields`: [removed](#removed).
7. Rename API calls: [API table](#api-flattening).

---

## The breaks

### 1. Handler signature: `(evt, data)` becomes `evt.detail`

jQuery passed the payload as a second argument. A native event carries it in `evt.detail`.

Before (v1):

```javascript
$(document).on('tdi:ajax:start', function (evt, data) {
    console.log(data.options.url);
});

// delegated, with a selector filter
$(document).on('tdi:ajax:beforeLinkClick', 'a', function (evt, data) {
    /* ... */
});
```

After (v2):

```javascript
document.addEventListener('tdi:ajax:start', (evt) => {
    const data = evt.detail;
    console.log(data.options);
});

// delegated, with a selector filter
document.addEventListener('tdi:ajax:beforeLinkClick', (evt) => {
    if (!(evt.target instanceof Element) || !evt.target.closest('a')) return;
    /* ... */
});
```

Events still bubble, and `before*` events are still cancelable with `evt.preventDefault()`. Each event is still dispatched on the same element as in v1 (the target element for `update`/`insert`, the involved elements for `start`/`end`/`done`, `document` for the rest), so `evt.target` is what you are used to.

### 2. `options.trigger` is a plain `Element`

In v1 `options.trigger` was a jQuery object. In v2 it is a DOM `Element`. If you use jQuery on the page, wrap it yourself.

Before:

```javascript
$(document).on('tdi:ajax:start', function (evt, data) {
    data.options.trigger.addClass('busy');
});
```

After:

```javascript
document.addEventListener('tdi:ajax:start', (evt) => {
    evt.detail.options.trigger?.classList.add('busy');
    // with jQuery still on the page:
    // $(evt.detail.options.trigger).addClass('busy');
});
```

### 3. Detail value types went native

**Key names are unchanged**, snake_case and all (`target_id`, `class_add`, `script_node_inline`, `inserted_node`, ...). Only the *types of the values* changed. This is the main reassurance: you do not need to learn new names, only check what you do with the values.

| Key | v1 | v2 |
|---|---|---|
| `detail.target` (update, insert) | jQuery set | **always** `Element[]`, never a single element (a `selector` may match many) |
| `detail.tag` | jQuery-wrapped XML node | the raw XML `Element` |
| `script_node`, `script_node_inline`, `style_node` | jQuery object | `Element` |
| `inserted_node` | jQuery set (elements **and** top-level text nodes) | `Element[]` (**elements only**) |
| `replace`, `append`, `prepend` | `string \| undefined` | `string \| null` (native `getAttribute`) |

Before:

```javascript
$(document).on('tdi:ajax:update', function (evt, data) {
    data.target.addClass('updated');
    if (data.replace === undefined) { /* ... */ }
});

$(document).on('tdi:ajax:insert', function (evt, data) {
    data.inserted_node.addClass('fresh');   // also matched text nodes, harmlessly
});
```

After:

```javascript
document.addEventListener('tdi:ajax:update', (evt) => {
    const data = evt.detail;
    data.target.forEach((el) => el.classList.add('updated'));
    if (data.replace == null) { /* ... */ }   // null, and loose-equality also covers undefined
});

document.addEventListener('tdi:ajax:insert', (evt) => {
    evt.detail.inserted_node.forEach((el) => el.classList.add('fresh'));
});
```

Things to watch:

* Code that indexed `detail.target[0]` keeps working. Code that treated `detail.target` as a single jQuery-wrapped element has to iterate or index.
* If you relied on top-level **text nodes** being in `inserted_node` (for example to read the text of an inserted plain-text fragment), they are no longer there. Read `detail.content` instead.
* Compare `replace`/`append`/`prepend` with `== null` (or truthiness), not `=== undefined`.

`tdi:ajax:error` also changed shape: see [break 6](#6-tdiajaxerror-detail-lost-xhr-and-textstatus).

### 4. The `beforeStart` / `start` / `beforeEnd` / `end` callbacks are gone

v1 let you pass callbacks to `TDI.Ajax.send`. v2 has none of them. What they were used for is covered elsewhere:

* **Custom headers:** the `headers` option. (The only example in the old JS integration doc used `beforeStart` to set a header.)
* **Cancelling:** simply do not call `send`, or pass a `signal`.
* **Completion:** the returned promise, or the `tdi:ajax:end` / `tdi:ajax:done` events.

Before:

```javascript
$(document).on('tdi:ajax:beforeLinkClick', 'a', function (evt, data) {
    evt.preventDefault();

    TDI.Ajax.send(evt.target, {
        beforeStart : function (xhr, settings, ajaxOptions) {
            xhr.setRequestHeader('X-Foo', 'Bar');
            return true;
        },
        end : function () {
            alert('Thank you.');
        }
    });
});
```

After:

```javascript
document.addEventListener('tdi:ajax:beforeLinkClick', (evt) => {
    evt.preventDefault();

    TDI.sendElement(evt.detail.link, { headers: { 'X-Foo': 'Bar' } })
        .then(() => alert('Thank you.'));
});
```

The `loading` class, trigger-group disabling and form cleanup that v1 hung off those callbacks are internal in v2.

### 5. `tdi:ajax:start` detail no longer carries `xhr` or `settings`

There is no `XMLHttpRequest` any more. The detail is `{ options }` (the request options). To set headers, use the `headers` option ([break 4](#4-the-beforestart--start--beforeend--end-callbacks-are-gone)); to abort, pass a `signal`.

Before:

```javascript
$(document).on('tdi:ajax:start', function (evt, data) {
    data.xhr.setRequestHeader('X-Foo', 'Bar');
});
```

After: set it up front.

```javascript
TDI.send('/path', { headers: { 'X-Foo': 'Bar' } });
```

### 6. `tdi:ajax:error` detail lost `xhr` and `textStatus`

It now carries `response: Response | null`, `status: number` (0 when there is no response) and `message: string`. It still fires on `document` (except a refusal by `allowedOrigins` before the request is sent, which fires on the trigger element and has `response: null`).

Before:

```javascript
$(document).on('tdi:ajax:error', function (evt, data) {
    console.log(data.xhr.status, data.textStatus);
});
```

After:

```javascript
document.addEventListener('tdi:ajax:error', (evt) => {
    const { response, status, message } = evt.detail;
    console.log(status, message, response);   // response is null on network failure
});
```

It fires for: a transport failure, a response that is not parseable XML (including an HTTP error page, such as a 404 with an HTML body, reported as `Malformed XML response` with `status` 404), a `<status>` other than `OK` (the response is *still processed*, as in v1), and a refused origin (see `allowedOrigins`). An aborted request fires `tdi:ajax:end` but not `tdi:ajax:error`.

### 7. Style event timing

`tdi:ajax:style` and `tdi:ajax:stylesDone` now fire **after the stylesheet has loaded** (or failed to). v1 fired them immediately on appending the `<link>`. If your handler measured layout that depends on the stylesheet, it now sees the right answer; if you relied on the event arriving "instantly", it arrives later.

### 8. New events where v1 fired none

**Style deduped by id.** A `<style src id>` whose `id` is already in the document is not downloaded again. v1 fired nothing in that case. v2 fires `tdi:ajax:style`, with `style_node` **undefined**. Guard before dereferencing:

```javascript
document.addEventListener('tdi:ajax:style', (evt) => {
    const node = evt.detail.style_node;
    if (!node) return;           // deduped: the sheet was already on the page
    node.dataset.fromTdi = '1';
});
```

**Script deduped by id.** A `<script src id>` whose `id` is already present was a genuine v1 bug: the response **hung forever** and fired nothing at all, not even `scriptsDone` or `done`, so any later instruction was never applied. v2 skips the download, runs the inline body if there is one, and fires `tdi:ajax:script`. There is nothing to migrate; if you worked around the hang, you can remove the workaround.

### 9. Hyphenated custom instructions

Unknown instructions are still forwarded as events. For a hyphenated element name the event name changed:

| Instruction | v1 | v2 |
|---|---|---|
| `<cart-badge>` | `tdi:ajax:beforeCart-badge` (malformed) | `tdi:ajax:beforeCartBadge` |

Anyone who bound the old name must update it.

```javascript
// Before
$(document).on('tdi:ajax:beforeCart-badge', function (evt, data) { /* ... */ });

// After
document.addEventListener('tdi:ajax:beforeCartBadge', (evt) => { /* evt.detail.count ... */ });
```

v2 also adds a first-class way to handle one, with no event needed:

```javascript
TDI.registerInstruction('cart-badge', (detail) => {
    document.getElementById('badge').textContent = detail.count;
});
```

The handler becomes the default action. It is still preceded by the cancelable `before*` event, so `preventDefault()` still suppresses it. The XML attributes are available on `detail` as strings.

### 10. Content scripts execute in `<head>`, and the original node is removed

See also [scripts in `update` content still execute](#scripts-inside-update--insert-content-still-execute). When TDI runs a `<script>` found in `update`/`insert` content it creates a fresh element, appends it to `document.head`, and **removes the original node**. Consequences:

* The script runs in `<head>`, not at its position in the inserted markup. `document.currentScript.parentNode` is `HEAD`.
* After the update, `#target.querySelector('script')` finds nothing.
* Only `src`, `id`, `nonce`, `integrity`, `crossorigin`, `referrerpolicy` and `data-*` attributes are carried to the new element. Anything else (`defer`, `async`, `class`, ...) is not.
* `type="module"` content scripts are **not executed**. Modules are always deferred, which would break the ordering guarantee. A console warning names the skipped script. Scripts with a non-JavaScript type (`application/json`, templates) are left alone in place.

Before (v1 with jQuery `.html()`, script ran where it sat):

```xml
<update target="panel"><![CDATA[
    <div id="chart"></div>
    <script>drawChart(document.getElementById('chart'));</script>
]]></update>
```

After: the same markup works. If your script located itself through its position (`document.currentScript.previousElementSibling`, `$('script:last').prev()`), give the element an id and look it up by id instead.

---

## `loading-target` is gone, and nothing will tell you

> **This is the single most likely thing to go unnoticed.**

In v1, TDI added the class `loading-target` (deprecated, but still applied) to the *related elements* of a request, in addition to `loading` (which the trigger and the related elements both carried). In v2 it is not applied at all. Only `loading` remains, still on the trigger **and** its related elements.

Removal is **silent**. A site that styles `.loading-target` loses that styling, with no error in the console or anywhere else. The page simply stops showing a spinner.

Find it:

```sh
grep -rn "loading-target" your-css-and-templates/
```

Before:

```css
.loading-target { opacity: .5; }
a.tdi.loading { background: url(spinner.gif) no-repeat; }
```

After: style `.loading` instead. Related elements carried it in v1 too, so a rule for `.loading` now also matches what `.loading-target` used to.

```css
.loading { opacity: .5; }
a.tdi.loading { background: url(spinner.gif) no-repeat; }
```

If the trigger and the related element must look different, scope by element: `a.tdi.loading { ... }` and `#basket.loading { ... }`.

---

## Removed

| Removed | Use instead |
|---|---|
| Synchronous XHR (the `sync` option) | Nothing: requests are always async. `send` returns a promise. |
| Hidden-iframe upload fallback | `FormData` + `fetch`. File uploads work in every supported browser. |
| The `rel` attribute as a related-element selector | `data-related-element` |
| `.ajaxlink`, `.ajaxform`, `.ajaxselect` class aliases | `.tdi` or `.infuse` |
| `data-ajax-xhr-fields` | `data-ajax-credentials`, below |
| The `currentScript` polyfill and all Internet Explorer support | Evergreen browsers |

Before and after for the markup ones:

```html
<!-- Before -->
<a href="/buy" class="ajaxlink" rel="#basket">Buy</a>
<a href="/x" class="tdi" data-ajax-xhr-fields='{"withCredentials": true}'>X</a>

<!-- After -->
<a href="/buy" class="tdi" data-related-element="#basket">Buy</a>
<a href="/x" class="tdi" data-ajax-credentials="include">X</a>
```

### New: `data-ajax-credentials`

`data-ajax-credentials="omit | same-origin | include"`. The default is `same-origin`, which matches v1's effective XHR behaviour, so nothing changes for anyone who never used the attribute. An invalid value logs a console warning and falls back to the default. From JavaScript, pass `credentials` in the options.

---

## Preserved, but surprising

Readers tend to assume these changed. They did not.

### Scripts inside `update` / `insert` content still execute

jQuery's `.html()` executed `<script>` elements found in inserted markup; native `innerHTML` does not. A straight port to `innerHTML` would have silently broken every site relying on it. v2 therefore re-executes them deliberately, on every content path (plain contents, `replace`, `append`, `prepend`, `insert`).

Worked example. Server response:

```xml
<response>
    <status>OK</status>
    <update target="calendar-box"><![CDATA[
        <div id="cal"></div>
        <script src="/js/calendar.js"></script>
        <script>Calendar.mount(document.getElementById('cal'));</script>
    ]]></update>
</response>
```

Result: `#cal` is in the page, `calendar.js` loads, then the inline script runs, in document order, after the content is in the DOM. The script elements carry the page's CSP nonce. `send()`'s promise and `tdi:ajax:scriptsDone` wait for them. They do **not** fire `tdi:ajax:script` and are **not** in the `scripts` array of the `done` payload, because those belong to `<script>` protocol instructions; content scripts are content. See also [break 10](#10-content-scripts-execute-in-head-and-the-original-node-is-removed) for where they run and what is carried across.

Content scripts run before the response's own `<script>` instructions, as in v1.

### An empty `<update>` still clears its target

```xml
<update target="results"></update>
```

empties `#results`. v1's changelog (1.5.3) claims an empty update is ignored, and v1 computes a `content_empty` flag it never uses, but v1's shipped code clears unconditionally. Shipped behaviour won: v2 clears too. `content_empty` is still in the event detail for anyone who reads it; no default action branches on it.

---

## New options

Both go to `createTdi`; the global build creates its instance with defaults.

### `contentScripts: 'all' | 'nonce-only'`

Controls which scripts found in `update`/`insert` content are replayed.

* `'all'` (default): v1 parity.
* `'nonce-only'`: only scripts that already carry the page nonce are replayed; others are skipped silently.
* **Any other value logs a warning and falls back to `'nonce-only'`.** This is fail-closed on purpose: nobody types `'all'` by mistake (it is the free default), so a bad value is far more likely a typo of a restrictive setting, and widening the policy on a typo would be the unsafe way to fail.

### `allowedOrigins: string[]`

Restricts which origins a response may come from. Undefined by default: no check, v1 parity.

```javascript
import { createTdi } from 'twinstone-tdi';
const tdi = createTdi({ allowedOrigins: ['https://api.example.com'] });
tdi.start();
```

* Entries are origins with a scheme (`https://api.example.com`). An entry that is not a valid origin warns and never matches.
* Same-origin always passes without being listed. `[]` means same-origin only.
* Checked **before** the request, and again against the **final URL after redirects**. A refusal fires `tdi:ajax:error` and rejects.

**Limitation, stated plainly.** The allowlist prevents the response from being **applied**. It does **not** prevent the request from being **sent**. If a same-origin endpoint redirects to a disallowed origin, the browser still contacts that origin, with whatever referrer and cookies that implies, and only then is the response discarded. Preventing the contact would need `redirect: 'manual'`, which would break legitimate redirects, so v2 does not do it. Do not treat `allowedOrigins` as a network firewall.

---

## Known limitations

* **No refcounting.** If two overlapping requests share an element (the same trigger, or an overlapping related element), the first to finish removes `loading` while the second is still in flight, and a trigger-group restore can re-enable elements early. v1 behaved the same way.
* **No timeout.** A stalled connection hangs the promise. Pass a signal: `TDI.send(url, { signal: AbortSignal.timeout(10000) })`. v1 had none either.
* **`data-trigger-group` now works.** It was broken in v1: it threw a `TypeError` whenever its selector matched anything, so nobody could have depended on it. In v2 it disables every element matched by the selector for the duration of the request, and re-enables only those it actually changed (including on error and abort). This is new behaviour, not a regression.
* **ESM consumers and the nonce.** TDI reads the CSP nonce from `document.currentScript` at load time. A `type="module"` script has a null `currentScript`, so the nonce is undefined and an ESM consumer cannot currently supply one. That makes `contentScripts: 'nonce-only'` unusable from the ESM entry points (nothing carries a matching nonce, so every content script is skipped). The global build does read the nonce, but it creates its instance with default options, so it always uses `'all'`. Today, therefore, no shipped entry point can run with `'nonce-only'` and a working nonce at the same time; treat the option as not yet usable.
* **`popup` is a plain `window.open`.** It runs from the response handler, long after the click lost user activation, so popup blockers will usually block it. This is inherent to doing it asynchronously.

---

## Packaging

| Entry | Format | Use |
|---|---|---|
| `twinstone-tdi` | ESM | Exports `createTdi` and types. No side effects on import: you call `createTdi()` and `start()` yourself. |
| `twinstone-tdi/auto` | ESM | `import 'twinstone-tdi/auto'`: creates an instance and starts it. One line. |
| `twinstone-tdi/global` | classic script | Sets `window.TDI` and starts it. |

The npm package name is unchanged (`twinstone-tdi`); v2 is a new major version of it.

**`dist/tdi.global.min.js` is what replaces v1's hand-downloaded `tdi-bundle.min.js`.** An unminified `dist/tdi.global.js` ships beside it.

Before:

```html
<script src="jquery.js"></script>
<script src="tdi-bundle.min.js"></script>
```

After (jQuery only if *your own* code still uses it):

```html
<script src="tdi.global.min.js"></script>
<script>
    TDI.registerInstruction('cart-badge', (d) => { /* ... */ });
</script>
```

ESM:

```javascript
import { createTdi } from 'twinstone-tdi';

const tdi = createTdi({ root: document.querySelector('#app') });
tdi.start();
```

`root` scopes **event delegation only**: which clicks and submits TDI intercepts. Instruction targets still resolve against the whole `document`, so a response may update a region outside `root`.

---

## API flattening

| v1 | v2 |
|---|---|
| `TDI.Ajax.Request.send(url, options)` | `TDI.send(url, options)` |
| `TDI.Ajax.send(elm, callbacks)` | `TDI.sendElement(el, options)` |
| `TDI.Ajax.Request.sendForm(form, options)` | `TDI.sendForm(form, options)` |
| `TDI.Ajax.Request.ajaxifyUrl(url)` | `TDI.ajaxifyUrl(url)` |
| `TDI.Tools.getScript`, `TDI.Tools.getStyle` | internal (they only served the `script` and `style` instructions) |
| (none) | `TDI.start()`, `TDI.stop()`, `TDI.registerInstruction(name, handler)` |

`options` is a pass-through subset of `RequestInit` (`credentials`, `headers`, `mode`, `cache`, `redirect`, `signal`) plus `method`, `data` (string, plain object or `FormData`, as in v1) and `trigger`. It replaces v1's vague "jQuery.ajax() settings".

Request headers: v2 sends `Accept: application/xml, text/xml, */*` but **not** `X-Requested-With`. `$.ajax` added that one silently, `fetch` does not, and omitting it avoids newly triggering CORS preflights. The server identifies a TDI request by `_infuse=1`, which is unchanged. If your server checks `X-Requested-With`, add it: `headers: { 'X-Requested-With': 'XMLHttpRequest' }`. A POST with string or object `data` is sent as `application/x-www-form-urlencoded; charset=UTF-8`, as in v1.

### Promises

* `send` returns a promise that resolves, with `{ response, responses }`, **once every instruction has been applied, including scripts loading and running in order**. v1 could not express this. The events still fire as before, so nothing requires you to use the promise.
* It rejects on transport failure, an unparseable response, and abort. A `<status>` other than `OK` does **not** reject.
* `sendElement` and `sendForm` resolve to `null` when nothing was sent: a `data-confirm` was declined, or the element is suppressed (`disabled` attribute or class).
* Intercepted clicks and submits attach their own catch, so failed requests do not create unhandled rejections.

```javascript
const result = await TDI.sendElement(document.querySelector('#buy'));
if (result === null) return;          // declined or suppressed
console.log(result.responses.updates.length);
```

### Teardown

`stop()` is the only teardown. It removes the delegated listeners and aborts in-flight requests. There is **no** `unload`/`pagehide` unbinding any more: v1's handler for it is what broke the back/forward cache. `start()` after `stop()` re-attaches.

---

## Quick reference: things that stayed

`tdi` / `infuse` classes on `a`, `form`, `select`, checkbox, radio and text inputs (Enter submits); `href`, `action`, `method`, `data-ajax-url`, `data-ajax-method`, `data-related-element`, `data-related-ancestor`, `data-confirm`; `disabled` attribute and class as suppressors; the `loading` class; the `_infuse=1&_ts=` request marker; every event name; the whole XML protocol; `window.TDI` for classic-script sites.
