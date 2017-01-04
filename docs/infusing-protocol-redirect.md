# Infusing protocol - redirect

Redirect to the specified URL.

> If present, this instruction should be the last in the instructions list. No further instruction will be executed.

## Syntax

```xml
<redirect href></redirect>
```

## Attributes

### `href`

URL where to redirect to.

* **Required**: yes
* **Value**: string
* **Default value**: _none_


## Events - Javascript API

* [tdi:ajax:beforeRedirect](#)

# Examples

```xml
<redirect href="login.html"></redirect>
```
