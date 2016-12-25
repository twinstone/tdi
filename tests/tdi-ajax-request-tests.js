(function (TDI) {
	'use strict';

	QUnit.module('TDI.Ajax.Request');

	QUnit.test('TDI.Ajax.Request.ajaxifyUrl', function (assert) {
		assert.expect(14);

		var urls = [
			[
				'http://example.com',
				'http://example.com?_infuse=1',
			],
			[
				'http://example.com#hash',
				'http://example.com?_infuse=1#hash',
			],
			[
				'http://example.com?#hash',
				'http://example.com?_infuse=1#hash',
			],
			[
				'http://example.com?param=value',
				'http://example.com?_infuse=1&param=value',
			],
			[
				'http://example.com?param1=value1&param2=value2',
				'http://example.com?_infuse=1&param1=value1&param2=value2',
			],
			[
				'http://example.com?param1=value1#hash',
				'http://example.com?_infuse=1&param1=value1#hash',
			],
			[
				'http://example.com?param1=value1&param2=value2#hash',
				'http://example.com?_infuse=1&param1=value1&param2=value2#hash',
			],
			[
				'',
				'?_infuse=1',
			],
			[
				'#hash',
				'?_infuse=1#hash',
			],
			[
				'?#hash',
				'?_infuse=1#hash',
			],
			[
				'?param=value',
				'?_infuse=1&param=value',
			],
			[
				'?param1=value1&param2=value2',
				'?_infuse=1&param1=value1&param2=value2',
			],
			[
				'?param1=value1#hash',
				'?_infuse=1&param1=value1#hash',
			],
			[
				'?param1=value1&param2=value2#hash',
				'?_infuse=1&param1=value1&param2=value2#hash',
			],
		];
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[0][0]).replace(/&_ts=\d+/, ''),
			urls[0][1].replace(/&_ts=\d+/, ''),
			'Absolute URL without parameters and a hash.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[1][0]).replace(/&_ts=\d+/, ''),
			urls[1][1].replace(/&_ts=\d+/, ''),
			'Absolute URL with a hash.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[2][0]).replace(/&_ts=\d+/, ''),
			urls[2][1].replace(/&_ts=\d+/, ''),
			'Absolute URL with queryString sign and a hash.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[3][0]).replace(/&_ts=\d+/, ''),
			urls[3][1].replace(/&_ts=\d+/, ''),
			'Absolute URL with 1 parameter.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[4][0]).replace(/&_ts=\d+/, ''),
			urls[4][1].replace(/&_ts=\d+/, ''),
			'Absolute URL with multiple parameters.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[5][0]).replace(/&_ts=\d+/, ''),
			urls[5][1].replace(/&_ts=\d+/, ''),
			'Absolute URL with 1 parameter and a hash.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[6][0]).replace(/&_ts=\d+/, ''),
			urls[6][1].replace(/&_ts=\d+/, ''),
			'Absolute URL with multiple parameters and a hash.'
		);

		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[7][0]).replace(/&_ts=\d+/, ''),
			urls[7][1].replace(/&_ts=\d+/, ''),
			'Relative URL without parameters and a hash.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[8][0]).replace(/&_ts=\d+/, ''),
			urls[8][1].replace(/&_ts=\d+/, ''),
			'Relative URL with a hash.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[9][0]).replace(/&_ts=\d+/, ''),
			urls[9][1].replace(/&_ts=\d+/, ''),
			'Relative URL with queryString sign and a hash.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[10][0]).replace(/&_ts=\d+/, ''),
			urls[10][1].replace(/&_ts=\d+/, ''),
			'Relative URL with 1 parameter.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[11][0]).replace(/&_ts=\d+/, ''),
			urls[11][1].replace(/&_ts=\d+/, ''),
			'Relative URL with multiple parameters.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[12][0]).replace(/&_ts=\d+/, ''),
			urls[12][1].replace(/&_ts=\d+/, ''),
			'Relative URL with 1 parameter and a hash.'
		);
		assert.equal(
			TDI.Ajax.Request.ajaxifyUrl(urls[13][0]).replace(/&_ts=\d+/, ''),
			urls[13][1].replace(/&_ts=\d+/, ''),
			'Relative URL with multiple parameters and a hash.'
		);
	});

	QUnit.test('TDI.Ajax.Request.send: beforeStart/start/beforeEnd/end callbacks', function (assert) {
		var done = assert.async();
		assert.expect(4);

		TDI.Ajax.Request.send('responses/empty.xml', {
			beforeStart: function () {
				assert.ok(true, '#send: beforeStart callback executed.');
			},

			start: function () {
				assert.ok(true, '#send: start callback executed.');
			},

			beforeEnd: function () {
				assert.ok(true, '#send: beforeEnd callback executed.');
			},

			end: function () {
				assert.ok(true, '#send: end callback executed.');
				done();
			},
		});
	});

	QUnit.test('TDI.Ajax.Request.send: prevent start', function (assert) {
		var done = assert.async();
		assert.expect(0);

		TDI.Ajax.Request.send('responses/empty.xml', {
			beforeStart: function () {
				return false;
			},

			end: function () {
				assert.ok(false, 'The AJAX request should not be called, it should be prevented.');
				done();
			},
		});

		setTimeout(function () {
			done();
		}, 1000);
	});

	QUnit.test('TDI.Ajax.Request.send: prevent end', function (assert) {
		var done = assert.async();
		assert.expect(0);

		TDI.Ajax.Request.send('responses/empty.xml', {
			beforeEnd: function () {
				return false;
			},

			end: function () {
				assert.ok(false, 'The `end` callback should not be called, it should be prevented.');
				done();
			},
		});

		setTimeout(function () {
			done();
		}, 1000);
	});

	QUnit.test('TDI.Ajax.Request.send: passing jQuery.ajax() settings', function (assert) {
		var done = assert.async();
		assert.expect(4);

		TDI.Ajax.Request.send('responses/empty.xml', {
			headers: {
				'X-Requested-With': 'TDIRequest'
			},

			password: 'pwd',
			processData: false,
			type: 'POST',

			beforeStart: function (xhr, settings, options) {
				assert.equal(settings.type, 'POST', 'Method is POST');
				assert.equal(settings.headers['X-Requested-With'], 'TDIRequest', 'Headers are overwritten');
				assert.equal(settings.password, 'pwd', 'Password is set to "pwd"');
				assert.equal(settings.processData, false, 'The processData is overwritten to false');
				return false;
			},

			end: function () {
				done();
			},
		});

		setTimeout(function () {
			done();
		}, 1000);
	});

	QUnit.test('TDI.Ajax.Request.send: default options', function (assert) {
		var done = assert.async();
		assert.expect(3);

		TDI.Ajax.Request.send('responses/empty.xml', {
			beforeStart: function (xhr, settings, options) {
				assert.equal(
					settings.url.replace(/&_ts=\d+/, ''),
					TDI.Ajax.Request.ajaxifyUrl('responses/empty.xml').replace(/&_ts=\d+/, ''),
					'The URL of the AJAX request is correct.'
				);

				assert.equal(settings.type, 'GET', 'The default method is GET.');
				assert.equal(settings.data, '', 'The default data is empty.');

				done();
				return false;
			}
		});
	});

	QUnit.test('TDI.Ajax.Request.send: options set', function (assert) {
		var done = assert.async();
		assert.expect(3);

		TDI.Ajax.Request.send('responses/empty.xml', {
			method: 'POST',
			data: 'param1=value1&param2=value2',

			beforeStart: function (xhr, settings, options) {
				assert.equal(
					settings.url.replace(/&_ts=\d+/, ''),
					TDI.Ajax.Request.ajaxifyUrl('responses/empty.xml').replace(/&_ts=\d+/, ''),
					'The URL of the AJAX request is correct.'
				);
				assert.equal(settings.type, 'POST', 'The default method is GET.');
				assert.equal(settings.data, 'param1=value1&param2=value2', 'The default data is empty.');

				done();
				return false;
			},
		});
	});

	QUnit.test('TDI.Ajax.Request.send: xhrFields', function (assert) {
		var done = assert.async();
		assert.expect(1);

		TDI.Ajax.Request.send('responses/empty.xml', {
			xhrFields: {
				withCredentials: true
			},

			beforeStart: function (xhr, settings, options) {
				assert.equal(settings.xhrFields.withCredentials, true, 'The withCredentials xhrField is set');

				done();
				return false;
			},
		});
	});
})(window.TDI);
