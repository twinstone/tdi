(function (TDI) {
	'use strict';

	QUnit.module('TDI.Ajax.Response');

	QUnit.test('TDI.Ajax.Response: preventable events', function (assert) {
		var done = assert.async();
		assert.expect(4);

		// bind the events
		$(document)
			.bind('tdi:ajax:beforeLinkClick', function () {
				return false;
			})
			.bind('tdi:ajax:beforeFormSubmit', function () {
				return false;
			})
			.bind('tdi:ajax:beforeUpdate', function () {
				return false;
			})
			.bind('tdi:ajax:beforeInsert', function () {
				return false;
			})
			.bind('tdi:ajax:beforeStyle', function () {
				return false;
			})
			.bind('tdi:ajax:beforeScript', function () {
				return false;
			})
			.bind('tdi:ajax:beforePopup', function () {
				return false;
			})
			.bind('tdi:ajax:beforeReload', function () {
				return false;
			})
			.bind('tdi:ajax:beforeRedirect', function () {
				return false;
			})
			.bind('tdi:ajax:beforeMessage', function () {
				return false;
			})
			.bind('tdi:ajax:beforeDialog', function () {
				return false;
			})
			.bind('tdi:ajax:update', function () {
				assert.ok(false, 'tdi:ajax:update should not be triggered.');
			})
			.bind('tdi:ajax:insert', function () {
				assert.ok(false, 'tdi:ajax:insert should not be triggered.');
			})
			.bind('tdi:ajax:script', function () {
				assert.ok(false, 'tdi:ajax:script should not be triggered.');
			})
			.bind('tdi:ajax:style', function () {
				assert.ok(false, 'tdi:ajax:style should not be triggered.');
			})
			.bind('tdi:ajax:popup', function (evt, data) {
				assert.ok(false, 'tdi:ajax:popup should not be triggered.');
			})
			.bind('tdi:ajax:message', function (evt, data) {
				assert.ok(false, 'tdi:ajax:message should not be triggered.');
			})
			.bind('tdi:ajax:dialog', function (evt, data) {
				assert.ok(false, 'tdi:ajax:dialog should not be triggered.');
			})
			.bind('tdi:ajax:done', function () {
				assert.ok(true, 'Link was not clicked (the click action was prevented)');
				assert.ok(true, 'Form was not submitted.');
				assert.ok(true, 'Reload was not triggered.');
				assert.ok(true, 'Redirect was not triggered.');

				done();
			});

		// send the form
		TDI.Ajax.Request.send('responses/full.xml');
		$('#tdi-ajax-send-link').click();
		$('#tdi-ajax-send-form').submit();
	});
})(window.TDI);
