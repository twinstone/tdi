# Web Page Integration - CSS

TDI doesn't influence how the page looks.

All TDI elements and their related elements (see [Web Page Integration](web-page-integration.md)) are informed about the TDI process flow (starting a request, receiving a response) using CSS class `loading`. This CSS class can be used for uses notification (spinning pinwheel and so on).
 
Example usage of the `loading` CSS class:

```css
a.tdi.loading {
    padding-left: 20px;
    background-image: url("../images/loading.gif");
    background-position: 0 50%;
    background-repeat: no-repeat;    
}
```
