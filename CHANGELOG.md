# Changelog

## 2.0.8-alpha

- Fix proper header settings - content type for POST requests

## 2.0.7-alpha

- Set trigger to `document.body` when calling TDI.Request.send

## 2.0.6-alpha

- Remove old logic for file upload

## 2.0.5-alpha

- Error checks and propper selector/target

## 2.0.0-alpha

- dropped support for older browsers and IE < 11, jQuery methods changed to native vanila
- Insert content, parsing tweaks, function docs

### Breaking changes

- Error response object changed to
  - {string} message
  - {Object} response
