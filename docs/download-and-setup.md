# Download and Setup

## Dependencies and Download

TDI library depends on [jQuery](http://jquery.com/download/). The minimum supported version of jQuery is 1.10.2 (see issues [TDI#8](#8) and [jQuery#13936](https://bugs.jquery.com/ticket/13936)).

You can download the [latest release](https://github.com/twinstone/tdi/releases/latest) here on GitHub.

## Setup

Now include both jQuery and TDI scripts to your page.

```html
<script src="your-jquery.js"></script>
<script src="tdi-bundle.min.js"></script>
```

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
