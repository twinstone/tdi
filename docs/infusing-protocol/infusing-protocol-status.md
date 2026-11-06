# Infusing protocol - status

Contains aplpication status of the TDI response. **It is not a HTTP status.**

The default value is `OK`. At this time, this is the only value recognised as success by TDI (compared case-insensitively). Any other value is treated as an error: the `tdi:ajax:error` event is fired, but the rest of the response is still processed. Nothing is displayed to the user by TDI itself.

## Syntax

```xml
<status>OK</status>
```
