# Infusing protocol - style

Download external CSS styles.

## Syntax

```xml
<style src [id]></style>
```

## Attributes

### `src`

URL of the external CSS stylesheet.

* **Required**: yes
* **Value**: string
* **Default value**: _none_

### `id`

ID of the stylesheet. In case there is another stylesheet with the same ID on the page, it will be downloaded only once.

* **Required**: no
* **Value**: string
* **Default value**: _none_

## Events - Javascript API

* [tdi:ajax:beforeStyle](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Response.html#event_tdi:ajax:beforeStyle)
* [tdi:ajax:style](http://twinstone.github.io/tdi/docs/api/classes/TDI.Ajax.Response.html#event_tdi:ajax:style)

# Examples

```xml
<style src="libs/calendar/calendar.css" id="calendar-css">
</style>
```
