# TDI - Javascript API

## Parts

* **[TDI.Ajax](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.html)**
* **[TDI.Ajax.Request](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Request.html)**
* **[TDI.Ajax.Response](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Response.html)**
* **[TDI.Tools](http://twinstone.github.io/tdi/docs/api/TDI.Tools.html)**

## API methods

* **[TDI.Ajax.send(elm, callbacks)](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.html#.send__anchor)** - Simulates usual TDI behaviour - sending a request using TDI element
  * **`elm`** - HTML element, which contains TDI info (see. [Web Page Integration](README.md))
  * `callbacks` - can contain different callback functions
* **[TDI.Ajax.Request.send(url, options)](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Request.html#.send__anchor)** - Sends a TDI request to the specified URL
  * **`url`** - target of a TDI request
  * `options` - can contain further setings
* **[TDI.Ajax.Request.sendForm(form, options)](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Request.html#.sendForm__anchor)** - Sends a TDI form using hidden `<iframe>` tag. Used when the browser does not support `FormData` and the form cannot be sent using `XHR`.
  * **`form`** - HTML form
  * `options` - can contain further setings
* **[TDI.Ajax.Request.ajaxifyUrl(url)](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Request.html#.ajaxifyUrl__anchor)** - Marks the URL for TDI usage - a GET parameter `_infuse=1` is added to the request
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
  * [`tdi:ajax:beforeLinkClick`](http://twinstone.github.io/tdi/docs/api/TDI.html#.event:tdi:ajax:beforeLinkClick) - allows suspending default action (sending a  TDI request)
  * [`tdi:ajax:beforeFormSubmit`](http://twinstone.github.io/tdi/docs/api/TDI.html#.event:tdi:ajax:beforeFormSubmit) - allows suspending default action (sending a form)
  * [`tdi:ajax:start`](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Request.html#.event:tdi:ajax:start)
  * [`tdi:ajax:error`](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Request.html#.event:tdi:ajax:error)
  * [`tdi:ajax:end`](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Request.html#.event:tdi:ajax:end)
  * [`tdi:ajax:done`](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Response.html#.event:tdi:ajax:done)
* **protocol** - informs about separate server instructions (see [Infusing Protocol](../infusing-protocol/README.md))
  * [all other events from TDI.Ajax.Response](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Response.html#toc2__anchor) - all before* actions allow suspending of the default action

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
$(document).on('tdi:ajax:beforeLinkClick', 'a',  function(evt, data) {
    evt.preventDefault();

    // Set custom HTTP headers and then send the request manually
    TDI.Ajax.send(evt.target, {
        beforeStart : function(xhr, settings, ajaxOptions) {
            xhr.setRequestHeader('X-Foo', 'Bar');
            return true; // allow the TDI sending process to go on
        }
    });
});
```

```javascript
$(document).on("tdi:ajax:beforeFormSubmit", function(evt, data) {
    evt.preventDefault(); // prevent the default action, eg. submiting the form
    
    // process form data
    // set http headers
    // send form some other way
    // ...
});
```
