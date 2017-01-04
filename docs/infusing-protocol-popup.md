# Infusing protocol - popup

Open URL in a popup window.

## Syntax

```xml
<popup href [mode width height]></popup>
```

## Attributes

### `href`

URL of the page, which is going to be displayed in a popup.

* **Required**: yes
* **Value**: string
* **Default value**: _none_

### `mode`

Defines the popup window mode. The following settings could be used only when in dialog mode.

* **Required**: no
* **Value**: `dialog` or `popup`
* **Default value**: `popup`

### `width`

Popup window width (only when in `dialog` mode).

* **Required**: no
* **Value**: number
* **Default value**: `600`

### `height`

Popup window height (only when in `dialog` mode).

* **Required**: no
* **Value**: number
* **Default value**: `500`

## Events - Javascript API

* [tdi:ajax:beforePopup](#)
* [tdi:ajax:popup](#)

# Examples

```xml
<popup href="about.html">
</popup>
```

```xml
<popup href="feedback.html" mode="dialog" width="500" height="300">
</popup>
```
