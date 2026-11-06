# Infusing protocol - script

Download the external Javascript or invoke the inline Javascript or both.

* `<script>` tags are processed strictly in the order they appear in the TDI XML response. If the previous `<script>` tag is external (has `src` attribute), the next one waits until that script has **loaded and run**. A script that fails to load does not stall the chain.
* in case the `<script>` part contains both external and inline scripts, the inline script is invoked after the external one has loaded and run.
* `<script>` instructions run after all `update` and `insert` instructions of the response have been applied (and after any scripts embedded in their content).

> TDI 1 only guaranteed that the previous script had been *downloaded*, not executed (see [issue #15](https://github.com/twinstone/tdi/issues/15)), so scripts had to check for their dependencies themselves. TDI 2 waits for execution. Existing defensive checks are harmless.

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

* `tdi:ajax:beforeScript`
* `tdi:ajax:script`

# Examples

```xml
<script src="libs/calendar/calendar.js" id="calendar">
</script>
```

```xml
<script src="modules/message-panel.js">
    // at this point, message-panel.js has been loaded and executed
    showMessagePanel( 'An internal error occured.', 'ERROR' );
</script>
```
