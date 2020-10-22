(function (TDI) {
	'use strict';

	QUnit.module('TDI.Ajax.Response');

	QUnit.test('TDI.Ajax.Response: events and XML', function (assert) {
		var done = assert.async();
		var requests = 2;
		var requestsDone = 0;
		var WINDOW_UNLOAD = 'unload';
		var WINDOW_PAGEHIDE = 'pagehide';

		assert.expect(55);

		assert.ok(window[WINDOW_UNLOAD] === false || window[WINDOW_UNLOAD] === undefined, 'Window is not unloaded.');
		assert.ok(window[WINDOW_PAGEHIDE] === false || window[WINDOW_PAGEHIDE] === undefined, 'Window page is not hidden.');

		// bind the events
		$(document)
			.bind('tdi:ajax:beforeLinkClick', function () {
				assert.ok(true, 'tdi:ajax:beforeLinkClick triggered.');
			})
			.bind('tdi:ajax:beforeFormSubmit', function () {
				assert.ok(true, 'tdi:ajax:beforeFormSubmit triggered.');
			})
			.bind('tdi:ajax:beforeUpdate', function () {
				assert.ok(true, 'tdi:ajax:beforeUpdate triggered.');
			})
			.bind('tdi:ajax:beforeInsert', function () {
				assert.ok(true, 'tdi:ajax:beforeInsert triggered.');
			})
			.bind('tdi:ajax:beforeStyle', function () {
				assert.ok(true, 'tdi:ajax:beforeScript triggered.');
			})
			.bind('tdi:ajax:beforeScript', function () {
				assert.ok(true, 'tdi:ajax:beforeScript triggered.');
			})
			.bind('tdi:ajax:beforePopup', function () {
				assert.ok(true, 'tdi:ajax:beforePopup triggered.');
			})
			.bind('tdi:ajax:beforeReload', function () {
				assert.ok(true, 'tdi:ajax:beforeReload triggered.');
				return false;
			})
			.bind('tdi:ajax:beforeRedirect', function () {
				assert.ok(true, 'tdi:ajax:beforeRedirect triggered.');
				return false;
			})
			.bind('tdi:ajax:beforeMessage', function (evt) {
				assert.ok(true, 'tdi:ajax:beforeMessage triggered.');
			})
			.bind('tdi:ajax:beforeDialog', function (evt) {
				assert.ok(true, 'tdi:ajax:beforeDialog triggered.');
			})
			.bind('tdi:ajax:update', function () {
				assert.ok(true, 'tdi:ajax:update triggered.');
			})
			.bind('tdi:ajax:insert', function () {
				assert.ok(true, 'tdi:ajax:insert triggered.');
			})
			.bind('tdi:ajax:script', function () {
				assert.ok(true, 'tdi:ajax:script triggered.');
			})
			.bind('tdi:ajax:style', function () {
				assert.ok(true, 'tdi:ajax:style triggered.');
			})
			.bind('tdi:ajax:popup', function (evt, data) {
				assert.ok(true, 'tdi:ajax:popup triggered.');
				if (data.popup) {
					data.popup.close();
				}
			})
			.bind('tdi:ajax:message', function () {
				assert.ok(true, 'tdi:ajax:message triggered.');
			})
			.bind('tdi:ajax:dialog', function () {
				assert.ok(true, 'tdi:ajax:dialog triggered.');
			})
			.bind('tdi:ajax:updatesDone', function () {
				assert.ok(true, 'tdi:ajax:updatesDone triggered.');
			})
			.bind('tdi:ajax:insertsDone', function () {
				assert.ok(true, 'tdi:ajax:insertsDone triggered.');
			})
			.bind('tdi:ajax:scriptsDone', function () {
				assert.ok(true, 'tdi:ajax:scriptsDone triggered.');
			})
			.bind('tdi:ajax:stylesDone', function () {
				assert.ok(true, 'tdi:ajax:stylesDone triggered.');
			})
			.bind('tdi:ajax:popupsDone', function () {
				assert.ok(true, 'tdi:ajax:popupsDone triggered.');
			})
			.bind('tdi:ajax:unknownsDone', function () {
				assert.ok(true, 'tdi:ajax:unknownsDone triggered.');
			})
			.bind('tdi:ajax:done', function () {
				assert.ok(true, 'tdi:ajax:done triggered.');

				requestsDone++;
				if (requestsDone === requests) {
					$(window).trigger('unload');
					$(window).trigger('pagehide');

					assert.equal(window['onpagehide' in window ? WINDOW_PAGEHIDE : WINDOW_UNLOAD], true, 'Window is unloaded/pagehidden.');

					done();
				}
			});

		// send the form
		$('#tdi-ajax-send-link').click();
		$('#tdi-ajax-send-form').submit();
	});
})(window.TDI);
