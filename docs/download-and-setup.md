# Download and Setup

TDI 2 has no dependencies. Coming from TDI 1? Read the [migration guide](migration-v1-to-v2.md) first.

## Download

* **npm:** `npm install twinstone-tdi`
* **Classic script:** take `dist/tdi.global.min.js` from the npm package, or load it from a CDN that serves npm, e.g. `https://unpkg.com/twinstone-tdi` or `https://cdn.jsdelivr.net/npm/twinstone-tdi` (both resolve to that file). It replaces v1's `tdi-bundle.min.js`.

## Setup

Classic script (sets `window.TDI` and starts TDI):

```html
<script src="tdi.global.min.js"></script>
```

ES module, one line:

```javascript
import 'twinstone-tdi/auto';
```

ES module, explicit:

```javascript
import { createTdi } from 'twinstone-tdi';

const tdi = createTdi();
tdi.start();
```

See [Javascript API](web-page-integration/web-page-integration-js.md) for the options.

## Basic Usage


1. Mark the HTML element, which is supposed to be serviced by TDI, by `tdi` CSS class:

```html
<a href="path/to/buy" class="tdi">Buy</a>
```

2. As a response to the request, send instructions from the server on what should be done with the current page:

```xml
<?xml version="1.0"?>
<response>
    <status>OK</status>
    <update target="basket-element-id">
    <![CDATA[
        <li class="product">
            ... 
        </li>
    ]]>  
    </update>   
</response>  
```
