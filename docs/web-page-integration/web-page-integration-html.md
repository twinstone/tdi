# Web Page Integration - HTML

## TDI-fication of HTML elements

HTML elements, which should be served by TDI, must be marked with `tdi` CSS class.
 
```html
<a href="path/to/buy" class="tdi">Buy</a> 

<form action="path/to/login" method="post" class="tdi">
    <input type="text" name="name" placeholder="Username">
    <input type="password" name="password" placeholder="Password">
    <input type="submit" value="Log In">
</form>
```

### Supported HTML elements

* **links**
* **forms**
* **form elements** - text input, select, checkbox and radio button

## Setting the target URL for an AJAX request

The target of the HTML element will be used as a target for AJAX request by default. That means using **href** value for links and **action** value for forms.

In case another target for an AJAX request should be used (or in case an element has no target, i.e. form elements), it is possible to set the AJAX request target using **data-ajax-url** attribute. This attribute always has higher priority than element target (href, action).

```html
<a href="path/to/buy" class="tdi" data-ajax-url="buy-ajax.html">Buy</a> 

<select name="city" class="tdi" data-ajax-url="/filter/by/city">  
    <option value="">(select a city)</option>
    <option value="JFK">New York</option>  
    <option value="LHR">London</option> 
    <option value="PRG">Prague</option> 
</select>
```

## Related elements

An HTML element, which has invoked TDI action (TDI source element) is informed about the TDI process flow, the state of the requests and responses. This information can be used for example for [applying css style to the element (spinning pinwheel)](web-page-integration-css.md).

If it is required to inform other elements about the TDI process flow, it is possible to use the following HTML attributes on the source element:

* **data-related-element** - CSS selector (mostly ID selector) for setting related elements. The selector is applied to the whole document. For example, `data-related-element="#basket-container"`
* **data-related-ancestor** - CSS selector for finding the TDI source element ancestor. The closest ancestor, which suits the CSS selector, is found. For example, `data-related-element="tr"`

All related elements are informed about the TDI process flow the same way as TDI source element is.

## Behaviour attributes

These attributes go on the TDI source element (the link, form or field marked `tdi`).

* **data-confirm** - a message shown in `window.confirm` before the request. If the user declines, nothing is sent. For example, `data-confirm="Really delete?"`
* **data-ajax-method** - the HTTP method for the request, e.g. `post`. It has higher priority than the `method` attribute of a form. A form containing a file input is always sent as a `multipart/form-data` POST.
* **data-ajax-credentials** - `omit`, `same-origin` (the default) or `include`; passed to `fetch` as `credentials`. Use `include` for a cross-origin request that needs cookies. Any other value is ignored with a console warning.
* **data-trigger-group** - CSS selector (applied to the whole document) of elements that are disabled while the request is in flight, typically the sibling buttons of the source element, so the user cannot fire a second request. Each matched element gets the `disabled` CSS class, and the `disabled` property if it has one. When the request ends, successfully or not, only the elements TDI itself disabled are enabled again; an element that was already disabled stays disabled. For example, `data-trigger-group=".basket-actions button"`

```html
<a href="/basket/clear" class="tdi" data-confirm="Empty the basket?" data-trigger-group=".basket-actions .tdi">Clear</a>
```

### Disabling an element

An element with the `disabled` attribute or the `disabled` CSS class is inert: TDI sends nothing for it, and `data-confirm` is not shown. `TDI.sendElement` resolves to `null` for it.

### Fields in a form

A text input, select, checkbox or radio button marked `tdi` that has no `data-ajax-url` stands in for its form on change (Enter, for a text input). If the form is itself marked `tdi`, the form is submitted by AJAX. If it is not, the form is submitted natively, as in v1. A `<select multiple>` sends every selected option under its name.
