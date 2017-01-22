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

### `replace`

Indicates, whether the content of the HTML element should be refreshed (false) or if the new content should replace the target HTML element.

* **Required**: no
* **Value**: boolean
* **Default value**: `false`

### `append`

Indicates, whether the new content should be appended to the targer HTML element.

* **Required**: no
* **Value**: boolean
* **Default value**: `false`

### `prepend`

Indicates, whether the new content should be prepended to the targer HTML element.

* **Required**: no
* **Value**: boolean
* **Default value**: `false`

### `class-add`

CSS class (or whitespace separated CSS class list), which should be added to the target HTML element.

* **Required**: no
* **Value**: string
* **Default value**: _none_

### `class-remove`

CSS class (or whitespace separated CSS class list), which should be removed from the target HTML element.

* **Required**: no
* **Value**: string
* **Default value**: _none_

### `html/text contents`

The new content, which is going to be used for the target HTML element update. The content should be escaped or wrapped in CDATA block.

* **Required**: yes
* **Value**: string
* **Default value**: _none_

## Events - Javascript API

* [tdi:ajax:beforeUpdate](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Response.html#.event:tdi:ajax:beforeUpdate)
* [tdi:ajax:update](http://twinstone.github.io/tdi/docs/api/TDI.Ajax.Response.html#.event:tdi:ajax:update)

# Examples

```html
<!-- Source markup -->
<ul id="todo-list">
</ul>
```

```xml
<update target="todo-list" class-add="highlight">
<![CDATA[
    <li>Take out trash</li>
    <li>Remember the milk</li>
    <li>Visit grandma</li>
]]>
</update>
```

```xml
<update target="todo-list" append="true">
<![CDATA[
    <li>Complete the TODO list</li>
]]>
</update>
```

```xml
<update target="todo-list" replace="true">
<![CDATA[
    <p>Hooray! Nothing to do.</p>
]]>
</update>
```
