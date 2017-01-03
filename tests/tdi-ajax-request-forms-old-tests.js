(function (TDI) {
	'use strict';

	console.log('-------------');
	console.log(TDI);
	console.log('-------------');

	QUnit.module('TDI.Ajax.Request Forms Old');

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
		assert.expect(2);

		var $form = $('#tdi-ajax-send-form-with-file');

		TDI.Ajax.Request.sendForm($form, {
			end: function () {
				assert.equal($form.attr('method'), 'post', 'The form method should be POST.');
				assert.equal($form.attr('enctype'), 'multipart/form-data', 'The form enctype should be set to multipart.');

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
		assert.expect(2);

		var $form = $('#tdi-ajax-send-form-with-file-forced-method');

		TDI.Ajax.Request.sendForm($form, {
			end: function () {
				assert.equal($form.attr('method'), 'post', 'The form method should be still POST.');
				assert.equal($form.attr('enctype'), 'multipart/form-data', 'The form enctype should be set to multipart.');

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
})(window.TDI);
