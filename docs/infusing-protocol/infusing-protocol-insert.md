# Infusing protocol - insert

Insert some new content to the page.

## Syntax

```xml
<insert (target|selector) [position]>
<![CDATA[
    html/text contents
]]>
</insert>
```

## Attributes

### `target`<sup>*</sup>

HTML element ID for selecting the target element, which content is going to be updated.

* **Required**: yes
* **Value**: string
* **Default value**: _none_

### `selector`<sup>*</sup>

A CSS selector for selecting the target element.

* **Required**: yes
* **Value**: string
* **Default value**: _none_

> \* Both `target` and `selector` attributes are used to select the target element of this instruction. Only one of them is **required**. When both are present, attribute `selector` has precedence.

### `position`

Indicates, whether the new content should be inserted before or after the target element.

* **Required**: no
* **Value**: `before` or `after`
* **Default value**: `after`

### `html/text contents`

The new content, which is going to be used for the target HTML element update. The content should be escaped or wrapped in CDATA block.

* **Required**: yes
* **Value**: string
* **Default value**: _none_

## Events - Javascript API

* [tdi:ajax:beforeInsert](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Response.html#event_tdi:ajax:beforeInsert)
* [tdi:ajax:insert](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Response.html#event_tdi:ajax:insert)

# Examples

```html
<!-- Source markup -->
<a href="/path/to/create/todolist" class="tdi" id="create-todolist-button">
    Vytvořit ToDo seznam 
</a>
```

```xml
<insert target="create-todolist-button" position="before">
<![CDATA[
    <h2>New ToDo list</h2>
    <ul>
        <li>Take out trash</li>
        <li>Remember the milk</li>
        <li>Visit grandma</li>
    </ul>
]]>
</insert>
```
