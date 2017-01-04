# Infusing Protocol

Every TDI response should be a valid XML document formatted according to Infuse protocol rules. The infuse protocol declares a set of instructions for the client part.

```xml
<?xml version="1.0"?>
<response>
    <status>OK</status>
    <update target replace append prepend class-add class-remove>html/text contents</update>
    <insert target position>html/text contents</insert>
    <script src>inline js code</script>
    <style src></style>
    <popup mode href width height></popup>
    <reload></reload>
    <redirect href></redirect>
</response>
```

## Infusion instructions

* [status](infusing-protocol-status.md)
* [update](infusing-protocol-update.md) - refresh HTML element content
* [insert](infusing-protocol-insert.md) - insert new content to the page
* [script](infusing-protocol-script.md) - download external JavaScript or perform inline JavaScript
* [style](infusing-protocol-style.md) -  download external CSS styles
* [popup](infusing-protocol-popup.md) - open popup window
* [reload](infusing-protocol-reload.md) - reload the page
* [redirect](infusing-protocol-redirect.md) - redirect to the URL
