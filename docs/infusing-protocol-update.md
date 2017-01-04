# Infusing protocol - update

Update some HTML element content on the page.

## Syntax

```xml
<update (target|selector) [replace append prepend class-add class-remove]>
<![CDATA[
    html/text contents
]]>
</update>
```

## Attributes

| Attribute  | Value | Default value | Description | 
| ------------- | ------------- | ------------- | ------------- |
| **target**<sup>*</sup>  | string value  |   | HTML element ID for selecting the target element, which content is going to be updated.  |
| **selector**<sup>*</sup>  | string value  |   | A CSS selector for selecting the target element.  |
| replace  | `true` or `false`  | false  | Indicates, whether the content of the HTML element should be refreshed (false) or if the new content should replace the target HTML element.  |
| append  | `true` or `false`  | false  | Indicates, whether the new content should be appended to the targer HTML element.  |
| prepend  | `true` or `false`  | false  | Indicates, whether the new content should be prepended to the targer HTML element.  |
| class-add  | string value (CSS class)  |  | CSS class (or whitespace separated CSS class list), which should be added to the target HTML element.  |
| class-remove  | string value (CSS class)  |  | CSS class (or whitespace separated CSS class list), which should be removed from the target HTML element.  |
| **html/text contents**  | string value  |  | The new content, which is going to be used for the target HTML element update. The content should be escaped or wrapped in CDATA block.  |

<sup>\*</sup> Both `target` and `selector` attributes are used to select the target element of this instruction. Only one of them is **required**. When both are present, attribute `selector` has precedence.

## Events - Javascript API

* [tdi:ajax:beforeUpdate](#)
* [tdi:ajax:update](#)
