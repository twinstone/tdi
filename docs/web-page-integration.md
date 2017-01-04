# Web Page Integration

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
