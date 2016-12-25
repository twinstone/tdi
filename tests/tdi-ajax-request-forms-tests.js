(function (TDI) {
	'use strict';

	QUnit.module('TDI.Ajax.Request Forms');

	QUnit.test('TDI.Ajax.Request.sendForm: beforeStart/start/beforeEnd/end callbacks', function (assert) {
		var done = assert.async();
		assert.expect(4);

		var $form = $('#tdi-ajax-send-form-action');

		TDI.Ajax.Request.sendForm($form, {
			beforeStart: function () {
				assert.ok(true, 'sendForm: beforeStart callback executed.');
			},

			start: function () {
				assert.ok(true, 'sendForm: start callback executed.');
			},

			beforeEnd: function () {
				assert.ok(true, 'sendForm: beforeEnd callback executed.');
			},

			end: function () {
				assert.ok(true, 'sendForm: end callback executed.');
				done();
			},
		});
	});

	QUnit.test('TDI.Ajax.Request.sendForm: prevent start', function (assert) {
		var done = assert.async();
		assert.expect(1);

		var $form = $('#tdi-ajax-send-form-action');

		TDI.Ajax.Request.sendForm($form, {
			beforeStart: function () {
				return false;
			},

			end: function () {
				assert.ok(false, 'The form should not be sent, it should be prevented.');
				done();
			},
		});

		setTimeout(function () {
			assert.ok(true, 'The form start was prevented.');
			done();
		}, 1000);
	});

	QUnit.test('TDI.Ajax.Request.sendForm: prevent end', function (assert) {
		var done = assert.async();
		assert.expect(1);

		var $form = $('#tdi-ajax-send-form-action');

		TDI.Ajax.Request.sendForm($form, {
			beforeEnd: function () {
				return false;
			},

			end: function () {
				assert.ok(false, 'The `end` callback should not be called, it should be prevented.');
				done();
			},
		});

		setTimeout(function () {
			assert.ok(true, 'The form end was prevented.');
			done();
		}, 1000);
	});

	QUnit.test('TDI.Ajax.send', function (assert) {
		var done = assert.async();
		assert.expect(1);

		var $form = $('#tdi-ajax-send-form-action');
		TDI.Ajax.send($form, {
			end: function (xhr, textStatus, options) {
				assert.equal(options.method, 'get', 'The form method should be GET.');

				done();
			}
		});
	});

	QUnit.test('TDI.Ajax.Request.sendForm: file field', function (assert) {
		var done = assert.async();
		assert.expect(1);

		var $form = $('#tdi-ajax-send-form-with-file');

		TDI.Ajax.Request.sendForm($form, {
			end: function (xhr, textStatus, options) {
				assert.equal(options.type, 'post', 'The form method should be POST.');

				done();
			}
		});
	});

	QUnit.test('TDI.Ajax.send - form with forced method', function (assert) {
		var done = assert.async();
		assert.expect(1);

		var $form = $('#tdi-ajax-send-form-action-forced-method');
		TDI.Ajax.send($form, {
			end: function (xhr, textStatus, options) {
				assert.equal(options.method, 'post', 'The form method should be POST.');

				done();
			}
		});
	});

	QUnit.test('TDI.Ajax.Request.sendForm: file field; ignore forced method', function (assert) {
		var done = assert.async();
		assert.expect(1);

		var $form = $('#tdi-ajax-send-form-with-file-forced-method');

		TDI.Ajax.Request.sendForm($form, {
			end: function (xhr, textStatus, options) {
				assert.equal(options.type, 'post', 'The form method should be still POST.');

				done();
			}
		});
	});

	QUnit.test('TDI.Ajax.Request.send: with method', function (assert) {
		var done = assert.async();
		assert.expect(1);

		var $link = $('#tdi-ajax-send-with-method');

		TDI.Ajax.send($link, {
			end: function (xhr, textStatus, options) {
				assert.equal(options.method.toLowerCase(), 'post', 'The request method should be POST.');

				done();
			}
		});
	});

	QUnit.test('Forms with GET method should not use FormData', function (assert) {
		var done = assert.async();

		var $form = $('#tdi-ajax-send-form-action');
		TDI.Ajax.send($form, {
			end: function (xhr, textStatus, options) {
				assert.notOk(options.data instanceof FormData, 'Ajax data should not be FormData');
				assert.equal(
					options.data,
					'name=value&name2=value2',
					'Field values should be in Ajax data formatted as a query string'
				);

				done();
			}
		});
	});

	QUnit.test('Forms with upload should use FormData', function (assert) {
		var done = assert.async();

		var $form = $('#tdi-ajax-send-form-with-file');
		TDI.Ajax.send($form, {
			end: function (xhr, textStatus, options) {
				assert.ok(options.data instanceof FormData, 'Ajax data should be FormData');

				// can't verify contents of FormData instance, because of a bug in PhantomJS.
				// see: https://github.com/ariya/phantomjs/issues/14211
				//assert.ok( options.data.has('name'), 'Field should be in data' );
				//assert.ok( options.data.has('file'), 'File field should be in data' );

				done();
			}
		});
	});
})(window.TDI);
