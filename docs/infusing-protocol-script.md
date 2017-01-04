# Infusing protocol - script

Download the external Javascript or invoke the inline Javascript or both.

* `<script>` tags are processed in the order they appear in the TDI XML response. If the previous `<script>` tag is external (has `src` attribute), the next one waits for the external script to be **downloaded (not executed)**<sup>*</sup>.
* in case the `<script>` part contains both external and inline scripts, the inline script is going to be invoked after the external one is **downloaded (not executed)**<sup>*</sup>.

> \* TDI cannot guarantee that the previous script will be executed and ready for the next one (see [issue #15](https://github.com/twinstone/tdi/issues/15)). It only guarantees, that the script was downloaded before the next one is processed. When a script depends on some previous one, it should check whether it is already available itself.

## Syntax

```xml
<script src [id]>
    inline js code
</script>
```

## Attributes

### `src`

URL of the external Javascript.

* **Required**: yes
* **Value**: string
* **Default value**: _none_

### `id`

ID of the script. If there is another script on the page with the same name, the script will not be downloaded more than once.

* **Required**: no
* **Value**: string
* **Default value**: _none_

### `inline js code`

Inline Javascript code. It is invoked in the **window scope**!

* **Required**: no
* **Value**: string
* **Default value**: _none_

## Events - Javascript API

* [tdi:ajax:beforeScript](#)
* [tdi:ajax:script](#)

# Examples

```xml
<script src="libs/calendar/calendar.js" id="calendar">
</script>
```

```xml
<script src="modules/message-panel.js">
    // at this point, message-panel.js is guaranteed to be downloaded, but it might not have been executed yet
    showMessagePanel( 'An internal error occured.', 'ERROR' );
</script>
```
