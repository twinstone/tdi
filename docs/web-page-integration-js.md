# Web Page Integration - Javascript API

In case it is not possible to use TDI elements the usual way or it is required to manage TDI directly from the javascript, you can use the Javascript API ([API reference](http://twinstone.github.io/tdi/docs/api/)).

API is separated into two parts:

* API methods
* API events

## API methods

* **[TDI.Ajax.send(elm, callbacks)](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.html#method_send)** - Simulates usual TDI behaviour - sending a request using TDI element
  * **`elm`** - HTML element, which contains TDI info (see. [Web Page Integration](web-page-integration.md))
  * `callbacks` - can contain different callback functions (see [API reference](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.html#method_send))
* **[TDI.Ajax.Request.send(url, options)](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Request.html#method_send)** - Sends a TDI request to the specified URL
  * **`url`** - target of a TDI request
  * `options` - can contain further setings (see [API reference](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Request.html#method_send))
* **[TDI.Ajax.Request.sendForm(form, options)](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Request.html#method_sendForm)** - Sends a TDI form using hidden `<iframe>` tag. Used when the browser does not support `FormData` and the form cannot be sent using `XHR`.
  * **`form`** - HTML form
  * `options` - can contain further setings (see [API reference](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Request.html#method_sendForm))
* **[TDI.Ajax.Request.ajaxifyUrl(url)](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Request.html#method_ajaxifyUrl)** - Marks the URL for TDI usage - a GET parameter `_infuse=1` is added to the request
  * **`url`** - The URL to mark

### Examples of usage

```javascript
TDI.Ajax.send($("#buy-link"), {
    end : function() {
        alert("Thank you.");  
    }
});
 
TDI.Ajax.Request.send("/path/to/action", {
    method : "POST"
});
````

## API events

TDI uses so-called Custom events for notifications about TDI process flow. Events in TDI can be separated into two groups:

* **process**  - informs about the flow and state of TDI process
  * [`tdi:ajax:beforeLinkClick`](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.html#event_tdi:ajax:beforeLinkClick) - allows suspending default action (sending a  TDI request)
  * [`tdi:ajax:beforeFormSubmit`](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.html#event_tdi:ajax:beforeFormSubmit) - allows suspending default action (sending a form)
  * [`tdi:ajax:start`](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Response.html#event_tdi:ajax:start)
  * [`tdi:ajax:error`](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Response.html#event_tdi:ajax:error)
  * [`tdi:ajax:end`](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Response.html#event_tdi:ajax:end)
  * [`tdi:ajax:done`](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Response.html#event_tdi:ajax:done)
* **protocol** - informs about separate server instructions (see [Infusing Protocol](infusing-protocol.md))
  * [all other events from TDI.Ajax.Response](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Response.html) - all before* actions allow suspending of the default action

### Events usage

```javascript
$(document).on("tdi:ajax:start", function(evt, data) {
    // evt - Event object
    // data - Additional data  
});
```

### Preventing of the default action

Some events allow preventing the default behaviour:

```javascript
$(document).on("tdi:ajax:beforeFormSubmit", function(evt, data) {
    // do something
    
    evt.preventDefault(); // prevent the default action, eg. submiting the form  
});
```
