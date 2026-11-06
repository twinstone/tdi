# Web Page Integration - Javascript API

In case it is not possible to use TDI elements the usual way or it is required to manage TDI directly from JavaScript, you can use the JavaScript API. It is the same for every entry point; only how you obtain the instance differs.

* **Classic script** (`dist/tdi.global.min.js`): the instance is `window.TDI`, already started.
* **ESM, one line:** `import 'twinstone-tdi/auto'` creates and starts an instance. Import `{ tdi }` from it if you need the object: `import { tdi } from 'twinstone-tdi/auto'`.
* **ESM, explicit:** `import { createTdi } from 'twinstone-tdi'`, then `const tdi = createTdi(options); tdi.start();`.

The classic-script build takes its options from its own script tag: `data-content-scripts`, `data-allowed-origins` (comma-separated) and `nonce`:

```html
<script src="/js/tdi.global.min.js" nonce="r4nd0m"
        data-content-scripts="nonce-only"
        data-allowed-origins="https://api.example.com"></script>
```

`tdi/auto` takes no options; use `createTdi` when you need them from ESM.

The examples below use `TDI`. TypeScript types ship with the package (`dist/index.d.ts`).

Upgrading from v1? See the [migration guide](../migration-v1-to-v2.md).

API is separated into two parts:

* API methods
* API events

## `createTdi(options)`

| Option | Meaning |
|---|---|
| `root` | `Document` or `Element` whose clicks and submits TDI intercepts. Default `document`. It scopes **event delegation only**; instruction targets resolve against the whole document. |
| `contentScripts` | `'all'` (default) or `'nonce-only'`: which scripts inside `update`/`insert` content are executed. An invalid value warns and falls back to `'nonce-only'`. |
| `nonce` | CSP nonce for scripts and styles TDI injects. Default: the nonce of TDI's own classic `<script>` tag. An ESM consumer has no such tag and must pass it. |
| `allowedOrigins` | Origins a response may come from (e.g. `['https://api.example.com']`). Undefined: no check. Same-origin always passes; `[]` means same-origin only. Checked before the request and against the final URL after redirects. It prevents the response being **applied**, not the request being **sent**. |

## API methods

* **`TDI.start()`** / **`TDI.stop()`** - Attach / remove the delegated listeners. `stop()` also aborts in-flight requests. It is the only teardown; there is no `unload` handling.
* **`TDI.sendElement(el, options)`** - Simulates usual TDI behaviour: sends a request using a TDI element
  * **`el`** - HTML element, which contains TDI info (see [Web Page Integration](README.md)). A form is sent with `sendForm`.
  * `options` - request options (below)
  * Resolves to `null` when nothing was sent (a `data-confirm` was declined, or the element is `disabled`).
* **`TDI.send(url, options)`** - Sends a TDI request to the specified URL
  * **`url`** - target of a TDI request
  * `options` - request options (below)
  * Resolves to `{ response, responses }` once every instruction has been applied, including scripts. Rejects on transport failure, malformed XML and abort. A non-`OK` `<status>` does not reject.
* **`TDI.sendForm(form, options)`** - Sends a TDI form using `FormData` and `fetch`. A form with a file input is sent as a `multipart/form-data` POST. Resolves to `null` like `sendElement`.
* **`TDI.ajaxifyUrl(url)`** - Marks the URL for TDI usage - a GET parameter `_infuse=1` (and `_ts`) is added to the request
* **`TDI.registerInstruction(name, handler)`** - Handle a custom server instruction (see below)

### Request options

| Option | Meaning |
|---|---|
| `method` | HTTP method. Default `GET` |
| `data` | String, plain object or `FormData`. Query string for GET, body otherwise |
| `trigger` | The DOM `Element` that is considered the source of the request |
| `headers` | Extra headers. Merged over the defaults (`Accept`; `Content-Type` for string/object bodies) |
| `credentials`, `mode`, `cache`, `redirect` | Passed to `fetch` unchanged. `credentials` defaults to `same-origin` |
| `signal` | An `AbortSignal` to cancel the request. There is no built-in timeout: use `AbortSignal.timeout(ms)` |

### Examples of usage

```javascript
// Send the request of an existing TDI element
TDI.sendElement(document.querySelector('#buy-link'), { headers: { 'X-Foo': 'Bar' } })
    .then((result) => {
        if (result) alert('Thank you.');   // null when confirm was declined
    });

// Send a request directly
await TDI.send('/path/to/action', {
    method: 'POST',
    data: { id: 42 },
    signal: AbortSignal.timeout(10000),
});
```

### Custom instructions

An unknown XML element in the response is forwarded as a `tdi:ajax:before<Name>` event (`<cart-badge>` becomes `tdi:ajax:beforeCartBadge`). To handle it directly:

```javascript
TDI.registerInstruction('cart-badge', (detail) => {
    // detail.count and the other XML attributes are strings
    document.querySelector('#badge').textContent = detail.count;
});
```

The handler becomes the default action. It is still preceded by the cancelable `before*` event.

## API events

TDI uses native `CustomEvent`s for notifications about TDI process flow. The payload is in `evt.detail`. All events bubble, so listen on `document`. Events in TDI can be separated into two groups:

* **process**  - informs about the flow and state of TDI process
  * `tdi:ajax:beforeLinkClick` - allows suspending default action (sending a TDI request). `detail`: `{ link }`
  * `tdi:ajax:beforeFormSubmit` - allows suspending default action (sending a form). `detail`: `{ form }`
  * `tdi:ajax:start` - `detail`: `{ options }`
  * `tdi:ajax:error` - `detail`: `{ response: Response | null, status: number, message: string, options }`
  * `tdi:ajax:end` - always fires, also after an error or an abort
  * `tdi:ajax:done` - `detail`: `{ responses, options }`
* **protocol** - informs about separate server instructions (see [Infusing Protocol](../infusing-protocol/README.md))
  * `tdi:ajax:beforeUpdate`, `update`, `beforeInsert`, `insert`, `beforeScript`, `script`, `beforeStyle`, `style`, `beforePopup`, `popup`, `beforeReload`, `beforeRedirect` - all `before*` events are cancelable and allow suspending of the default action
  * `tdi:ajax:updatesDone`, `insertsDone`, `scriptsDone`, `stylesDone`, `popupsDone`, `unknownsDone` - once per response, after all instructions of that kind

Detail keys are snake_case (`target_id`, `class_add`, `script_node`, ...). `detail.target` is always an `Element[]`; `tag` is the raw XML `Element`; `inserted_node` is an `Element[]`; `script_node`, `script_node_inline` and `style_node` are `Element`s. `tdi:ajax:style` fires with `style_node` undefined when the stylesheet was already on the page. `detail.options.trigger` is a plain `Element`.

### Events usage

```javascript
document.addEventListener('tdi:ajax:start', (evt) => {
    // evt - CustomEvent
    // evt.detail - Additional data
    console.log(evt.detail.options);
});

// react to every update, whichever element it targets
document.addEventListener('tdi:ajax:update', (evt) => {
    evt.detail.target.forEach((el) => el.classList.add('updated'));
});
```

For a delegated handler that only cares about some elements, filter on `evt.target`:

```javascript
document.addEventListener('tdi:ajax:beforeLinkClick', (evt) => {
    if (!evt.target.closest('a.special')) return;
    /* ... */
});
```

### Preventing of the default action

Some events allow preventing the default behaviour:

```javascript
document.addEventListener('tdi:ajax:beforeLinkClick', (evt) => {
    evt.preventDefault();

    // Set custom HTTP headers and then send the request manually
    TDI.sendElement(evt.detail.link, { headers: { 'X-Foo': 'Bar' } });
});
```

```javascript
document.addEventListener('tdi:ajax:beforeFormSubmit', (evt) => {
    evt.preventDefault(); // prevent the default action, eg. submiting the form

    // process form data
    // set http headers
    // send form some other way, e.g. TDI.sendForm(evt.detail.form, { ... })
    // ...
});
```

Note that `preventDefault()` on `beforeLinkClick` stops TDI only; the link itself has already been kept from navigating.

### Cancelling and timeouts

```javascript
const controller = new AbortController();
TDI.send('/slow', { signal: controller.signal });
controller.abort();        // fires tdi:ajax:end, not tdi:ajax:error
```

Two overlapping requests that share an element are not refcounted: the first to finish removes the `loading` class.
