# Changelog

## 2.0.11-beta UNRELEASED

- Demo with responses added to TDI
- App version and build date added automaticaly during build

### Breaking changes in 2.0.11-beta

- New builder (tsdx) and typescript support
- Helper methods extracted into `tools.ts` and typed

## 2.0.10-beta 2025-08-15

- [CTO-361](https://etnetera.atlassian.net/browse/CTO-361) execute `<script>` tag in update

## 2.0.9-beta 2025-08-11

- [CTO-370](https://etnetera.atlassian.net/browse/CTO-370) - headers can be configured
- fixed: headers for file upload and form post

## 2.0.8-alpha 2025-07-28

- Fix proper header settings - content type for POST requests

## 2.0.7-alpha 2025-07-12

- Set trigger to `document.body` when calling TDI.Request.send

## 2.0.6-alpha 2025-03-31

- Remove old logic for file upload

## 2.0.5-alpha 2025-03-24

- Error checks and propper selector/target

## 2.0.0-alpha 2024-10-08

- dropped support for older browsers and IE < 11, jQuery methods changed to native vanila
- Insert content, parsing tweaks, function docs

### Breaking changes in 2.0.0-alpha

- Error response object changed to
  - {string} message
  - {Object} response

## 1.9.5

- Added support for FormData data using `TDI.Ajax.Request.send()` ([#35](https://github.com/your-repo/issues/35))
- Added `nonce` attribute support ([#37](https://github.com/your-repo/issues/37))
- Added support for the `pagehide` window event ([#38](https://github.com/your-repo/issues/38))

## 1.9.3

- Update events work with `replace=true` ([#36](https://github.com/your-repo/issues/36))

## 1.9.2

- Do not use FormData for all forms, only for those with file inputs ([#34](https://github.com/your-repo/issues/34))

## 1.9.1

- Replace deprecated jQuery method `andSelf()` ([#33](https://github.com/your-repo/issues/33))

## 1.8.2

- Do not trigger the error event on involved elements ([#7](https://github.com/your-repo/issues/7))
- Allow passing `jQuery.ajax()` settings ([#9](https://github.com/your-repo/issues/9))
- Ignore link clicks with ctrl/meta key ([#10](https://github.com/your-repo/issues/10))
- Trigger events correctly, even if involved elements were removed from DOM ([#6](https://github.com/your-repo/issues/6))
- Send forms using XHR2 FormData if possible ([#11](https://github.com/your-repo/issues/11))
- Treat update/insert target attribute as ID ([#14](https://github.com/your-repo/issues/14))
- Replace deprecated event methods with `on`/`off` methods ([#18](https://github.com/your-repo/issues/18))
- Do not use FormData with GET forms ([#25](https://github.com/your-repo/issues/25))
- Use style guides ([#24](https://github.com/your-repo/issues/24))
- Sequential script instructions ([#15](https://github.com/your-repo/issues/15))

## 1.7.8

- Trigger custom events on related elements ([#TDI-25](https://github.com/your-repo/issues/TDI-25))

## 1.7.7

- Allow specifying request method for all elements ([#TDI-21](https://github.com/your-repo/issues/TDI-21))
- Allow updating multiple targets (based on CSS selector) ([#TDI-20](https://github.com/your-repo/issues/TDI-20))
- Fixed relative URL problems in `ajaxifyUrl()`

## 1.7.5

- Clear "submit-action" hidden element every time after a form is submitted ([#TDI-18](https://github.com/your-repo/issues/TDI-18))

## 1.7.4

- Allow passing `xhrFields` object to `$.ajax()` using `data-ajax-xhr-fields='{JSON}'` attribute
- Added `xhr` and xhr settings to the `tdi:ajax:start` event

## 1.7.3

- Generating of event name fails in IE7 ([#TDI-16](https://github.com/your-repo/issues/TDI-16))

## 1.6.1

- Removed jQuery from repository. Use your own copy of jQuery.
- Removed the tdi-bundle-all (with jQuery included) bundle. Use your own copy of jQuery.
- Added general support for unknown instructions. All unknown instructions will be recognized and their custom events will be triggered with all their attributes.
- Removed the direct support for Message and Dialog instructions. Replaced with general support for "unknown" instructions.
- Removed the `clear` attribute of `<update>` instruction.
- Changed the bundle name from `tdi-bundle-min.js` to `tdi-bundle.min.js`
- Added `script_node_inline` property to `tdi:ajax:script` custom event
- Added `sync` property to `TDI.Ajax.Request.send` method. It controls whether the AJAX request will be synchronous or not. Defaults to false.
- Fixed URL generating when only the search part (#whatever) is provided ([#TDI-14](https://github.com/your-repo/issues/TDI-14))

## 1.5.3

- `<update>` instruction with empty body will not clear the target contents (use `clear="true"` option instead)

## 1.5.1

- Changed the way of collecting XML instructions to allow HtmlUnit testing

## 1.5.0

- Added support for dialog ID attribute
- Fixed form serialization problem ([TDI-6](http://bugs.twinstone.org/browse/TDI-6))
- Fixed browser check, was not working correctly in IE10

## 1.4.1

- Added support for `<dialog>` XML protocol tag
- Fixed problems with `<iframe>` in IE8/7
- Recreated and fixed the NeutralTest with HtmlUnit
- All tests run through Jetty now
- Upgraded jQuery to 1.6.3
- Send TDI text inputs by pressing Enter

## 1.3.4

- Added support for `<message>` XML protocol tag
